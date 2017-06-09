import random
import sqlite3
from http.cookiejar import Cookie

import re
from flask import g
import requests
import time
import json
from Crypto.PublicKey.RSA import construct
from binascii import unhexlify
from codecs import encode
from Crypto.Signature import PKCS1_v1_5
import lp
import rsa
import base64
from requests.cookies import cookiejar_from_dict, extract_cookies_to_jar, RequestsCookieJar, create_cookie
import datetime
import quopri
from imaplib import IMAP4_SSL
import base64


DATABASE = 's.db'
HEADERS = {'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding':'gzip, deflate, sdch, br',
    'Accept-Language':'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
    'Cache-Control':'max-age=0',
    'Connection':'keep-alive',
    'Host':'steamcommunity.com',
    'Referer':'steamcommunity.com',
    'Upgrade-Insecure-Requests':'1',
    'User-Agent':'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'}
LOGINURL = 'https://steamcommunity.com/login/'


class DataBase:

    def __init__(self):
        self.db = self.get_db()
        self.db.row_factory = self.dict_factory
        self._create_db_schema()

    @staticmethod
    def dict_factory(cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    def get_db(self):
        return sqlite3.connect(DATABASE)
        db = getattr(g, '_database', None)
        if db is None:
            db = g._database = sqlite3.connect(DATABASE)
        return db


    def init_db():
        with app.app_context():
            db = get_db()
            with app.open_resource('schema.sql', mode='r') as f:
                db.cursor().executescript(f.read())
            db.commit()


    def _create_db_schema(self):
        user_table = 'CREATE TABLE IF NOT EXISTS user (' \
                     ' login VARCHAR(32) NOT NULL,' \
                     ' password VARCHAR(32) NOT NULL,' \
                     ' email VARCHAR(255) NOT NULL,' \
                     ' money INTEGER NOT NULL DEFAULT 0 CHECK (money >=0),' \
                     ' CONSTRAINT user_pk PRIMARY KEY (login),' \
                     ' CONSTRAINT login_un UNIQUE (login));'

        cookie_table = 'CREATE TABLE IF NOT EXISTS cookie (' \
                       ' id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL DEFAULT 0,' \
                       ' name VARCHAR(256),' \
                       ' value VARCHAR(256),' \
                       ' domain VARCHAR(256),' \
                       ' login VARCHAR(32) NOT NULL,' \
                       ' CONSTRAINT fk_user FOREIGN KEY (login) REFERENCES user(login) ON DELETE CASCADE,' \
                       ' CONSTRAINT cookie_un UNIQUE (login, name));'

        inventory_table = 'CREATE TABLE IF NOT EXISTS inventory(' \
                          ' login VARCHAR(32) NOT NULL,' \
                          ' appid INT NOT NULL,' \
                          ' amount INT NOT NULL DEFAULT 0 CHECK (amount>=0),' \
                          ' CONSTRAINT fk_user FOREIGN KEY (login) REFERENCES user(login) ON DELETE CASCADE,' \
                          ' CONSTRAINT inventory_un UNIQUE (login, appid));'

        item_table = 'CREATE TABLE IF NOT EXISTS item(' \
                     ' login VARCHAR(32) NOT NULL,' \
                     ' appid INT NOT NULL,' \
                     ' amount INT NOT NULL,' \
                     ' assetid BIGINT(20) NOT NULL,' \
                     ' classid INT NOT NULL,' \
                     ' contextid INT NOT NULL,' \
                     ' instanceid INT NOT NULL DEFAULT 0,' \
                     ' CONSTRAINT fk_inventory FOREIGN KEY (login) REFERENCES inventory(login) ON DELETE CASCADE,' \
                     ' CONSTRAINT fk_class FOREIGN KEY (classid) REFERENCES class(classid) ON DELETE NO ACTION,' \
                     ' CONSTRAINT item_un UNIQUE (assetid));'

        item_index = 'CREATE INDEX IF NOT EXISTS item_index ON item (login, appid, classid);'

        description_table = 'CREATE TABLE IF NOT EXISTS description(' \
                      ' classid INT NOT NULL,' \
                      ' appid INT NOT NULL,' \
                      ' commodity INT NOT NULL,' \
                      ' currency INT NOT NULL,' \
                      ' url_icon VARCHAR(128) NOT NULL,' \
                      ' url_icon_large VARCHAR(128) NOT NULL,' \
                      ' instanceid INT NOT NULL DEFAULT 0,' \
                      ' market_fee_app INT NOT NULL,' \
                      ' name VARCHAR(45) NOT NULL,' \
                      ' market_hash_name VARCHAR(45) NOT NULL,' \
                      ' market_marketable_restriction INT NOT NULL,' \
                      ' market_name VARCHAR(45) NOT NULL,' \
                      ' market_tradable_restriction INT NOT NULL,' \
                      ' marketable INT NOT NULL,' \
                      ' tradable INT NOT NULL,' \
                      ' CONSTRAINT class_un UNIQUE (appid, classid));'


        #test
        #self.db.cursor().execute('DROP table  IF EXISTS  user')
        #self.db.cursor().execute('DROP table IF EXISTS  cookie')
        self.db.cursor().execute('DROP table IF EXISTS  description')
        self.db.cursor().execute('DROP table IF EXISTS  item')
        self.db.cursor().execute('DROP table IF EXISTS  inventory')
        self.db.cursor().execute('DROP index IF EXISTS  item_index')

        self.db.cursor().execute(user_table)
        self.db.cursor().execute(cookie_table)
        self.db.cursor().execute(inventory_table)
        self.db.cursor().execute(description_table)
        self.db.cursor().execute(item_table)
        self.db.cursor().execute(item_index)
        self.db.commit()
        self._add_queries_names()
        return

    def _add_queries_names(self):
        query = 'PRAGMA table_info({table})'
        tab = self.db.cursor().execute("SELECT * FROM sqlite_master WHERE type='table'").fetchall()
        tables = list([i['name'] for i in tab])
        for name in tables:
            d = self.db.cursor().execute(query.format(table=name)).fetchall()
            self.__dict__['_table_'+name] = list([i['name'] for i in d])
        return


    def add_user(self, login, password, email, money=None):
        if money is None:
            money = 0
        query = 'INSERT OR REPLACE INTO user (login, password, email, money) ' \
         'VALUES(?, ?, ?, ?)'
        query_params = (login, password, email, money)
        self.db.cursor().execute(query, query_params)
        try:
            self.db.cursor().execute(query, query_params)
        except Exception:
            self.db.rollback()
            return False
        self.db.commit()
        return True


    def add_cookie(self, login, name, value, domain):
        query = 'INSERT OR REPLACE INTO cookie (name, value, domain, login) \
         VALUES(?, ?, ?, ?);'
        query_params = (name, value, domain, login)
        try:
            self.db.cursor().execute(query, query_params)
        except Exception:
            self.db.rollback()
            return False
        self.db.commit()
        return True

    def get_users(self):
        query = 'SELECT * FROM user'
        r = self.db.cursor().execute(query).fetchall()
        return r

    def get_cookies(self, login):
        query = 'SELECT * FROM cookie WHERE login=?'
        r = self.db.cursor().execute(query, (login,)).fetchall()
        return r

    def add_items(self, login, items):
        inv = self.get_inventories(login)
        appids = []
        for i in inv:
            appids.append(str(i['appid']))
        query = 'INSERT OR ABORT INTO item (' + ', '.join(self._table_item) + ') VALUES(' + ''.join([r'?, ' for _ in self._table_item]) + ');'
        for i in items:
            if not i['appid'] in appids:
                self._add_inventory(login, i['appid'])
            try:
                query_params = list([login]+[i.get(x) for x in self._table_item if x != 'login'])
                self.db.cursor().execute(query, query_params)
            except sqlite3.IntegrityError as e:
                if e.args[0].find('UNIQUE') == -1:
                    print('add_items', e.args[0])
        self.db.commit()


    def add_descriptions(self, descs):
        query = 'INSERT OR ABORT INTO descriptions (classid, appid, commodity, currency, url_icon, url_icon_large,' \
                ' instanceid, market_fee_app, name, market_hash_name, market_marketable_restriction, market_name,' \
                'market_tradable_restriction, marketable, tradable)' \
                'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
        for d in descs:
            for n, v in d.items():
                try:
                    query_params = (v.classid, v.appid, v.commodity, v.currency, v.url_icon, v.url_icon_large,
                                    v.instanceid, v.market_fee_app, v.name, v.market_hash_name, v.market_marketable_restriction,
                                    v.market_name, v.market_tradable_restriction, v.marketable, v.tradable)
                    self.db.cursor().execute(query, query_params)
                except:
                    print('add_descriptions error')
        self.db.commit()

    def delete_items(self, items):
        pass

    def get_inventories(self, login):
        query = 'SELECT * FROM inventory WHERE login=?'
        r = self.db.cursor().execute(query, (login, )).fetchall()
        return r

    def _add_inventory(self, login, appid):
        query = 'INSERT OR ABORT INTO inventory (login, appid, amount)' \
                'VALUES(?, ?, ?);'
        query_params = (login, appid, 0)
        try:
            self.db.cursor().execute(query, query_params)
        except sqlite3.IntegrityError as e:
            if e.args[0].find('UNIQUE') == -1:
                print('_add_inventory', e.args[0])
        self.db.commit()

    def drop_inventories(self, login):
        pass





class SteamClient:

    def __init__(self, login, password, database):
        self.session = requests.session()
        self.session.headers.update(HEADERS)
        self.login = login
        self.password = password
        self.transferparameters = ''
        self.db = database
        self.sessionID = None
        self.steamID = None
        self.g_rgAppContextData = None
        self.inventory = None

    def get_publick_key_n_timestamp(self):
        rsakey_url = LOGINURL+"/getrsakey/"
        data = {'username': self.login, 'donotcache': int(time.time()*1000)}
        resp = self.session.post(rsakey_url, data=data, allow_redirects=False)
        cont = resp.json()

        if cont.get('success'):
            e = int(cont['publickey_exp'], 16)
            n = int(cont['publickey_mod'], 16)
            public_key = rsa.PublicKey(n, e)
                #rsa = construct((n, e))
                #cipher = PKCS1_v1_5.new(rsa)
                #password = cipher.encrypt(PASSWORD)
                #password = base64.b64encode(password)
            return public_key, cont['timestamp']
        else:
            print('get_publick_key_n_timestamp error')
            raise AttributeError

    '''def get_cookies(self):
        #TODO sql query
        cookies = []
        cookies.append(create_cookie('steamLogin', lp.sl[1], domain='steamcommunity.com'))
        cookies.append(create_cookie('steamLoginSecure', lp.sls[1], domain='steamcommunity.com'))
        cookies.append(create_cookie(lp.sma[0], lp.sma[1], domain='steamcommunity.com'))
        cookies.append(create_cookie('steamRememberLogin', lp.srl[1], domain='steamcommunity.com'))
        return cookies'''

    def set_cookies(self):
        cook = self.db.get_cookies(self.login)
        for i in cook:
            c = create_cookie(i['name'], i['value'], domain=i['domain'])
            self.session.cookies.set_cookie(c)



    def do_login(self):
        log_url = LOGINURL + "dologin/"
        self.set_cookies()
        firstlogin = True if len(self.session.cookies.items()) == 0 else False
        resp = self.session.get(LOGINURL)
        if len(resp.cookies.items()) == 0:
            return
        data = self.get_data_for_login()
        resp = self.session.post(log_url, data=data, allow_redirects=False)
        cont = resp.json()
        self.transferparameters = cont.get('transfer_parameters', '')
        i = 3
        while cont.get('emailauth_needed', False) is not False and i > 0:
            data = self.get_data_for_login(cont)
            resp = self.session.post(log_url, data=data, allow_redirects=False)
            cont = resp.json()
            i -= 1
            if cont.get('login_complete', False):
                break

        if cont.get('login_complete', False):
            if firstlogin:
                for n, v in self.session.cookies.iteritems():
                    #TODO может разобраться с доменами
                    if n == 'sessionid':
                        continue
                    self.db.add_cookie(self.login, n, v, self.session.cookies.list_domains()[0])
            return True

        return False

    def get_data_for_login(self, cont=None):
        if cont is None:
            cont = {}
        try:
            public_key, timestamp = self.get_publick_key_n_timestamp()
        except:
            return None
        enc_password = base64.b64encode(rsa.encrypt(self.password, public_key))
        email_code = ''
        pc_name = ''
        if cont.get('emailauth_needed', False):
            email_code = self.get_email_authcode()
            name_list = ('pc', 'mypc', 'apple', 'eeee', 'notik', 'nbook', 'qqq', 'firefox', 'chrome',
                         'yan', 'dmitry', 'alex', 'ivan', 'sergey', 'niko', 'vera', 'natali', 'olga',
                         'anna', 'masha', 'maria')
            pc_name = name_list[random.randint(0, len(name_list)-1)]
            if random.randint(1, 4) == 2:
                pc_name += str(random.randint(1, 20))
            i = 20
            #todo переместить цикл в do_login?
            while i > 0:
                email_code = self.get_email_authcode()
                if email_code:
                    break
                i -= 1
                time.sleep(10)

        data = {
            'password': enc_password,
            'username': self.login,
            'twofactorcode': '',
            'emailauth': email_code,
            'loginfriendlyname': pc_name,
            'captchagid': -1,
            'captcha_text': '',
            'emailsteamid': cont.get('emailsteamid', ''),
            'rsatimestamp': timestamp,
            'remember_login': 'true',
            'donotcache': int(time.time()*1000)
        }
        return data

    def get_email_authcode(self):
        import email
        server = IMAP4_SSL('imap.yandex.ru')
        server.login(lp.ename, lp.epass)
        '''rv, mailboxes = server.list()
        msg_ids =[]
        for mb in mailboxes:
            flags, delimiter, mailbox_name = parse_list_response(mb)
            server.select(mailbox_name, readonly=True)
            #TODO поменять время на 3 дня
            date = (datetime.date.today() - datetime.timedelta(days=10)).strftime("%d-%b-%Y")
            msg_ids.extend(server.uid('search', None, '(SINCE {date} FROM "Steam Support")'.format(date=date))[1][0].split())
        '''
        server.select()
        date = (datetime.date.today() - datetime.timedelta(days=2)).strftime("%d-%b-%Y")
        msg_ids = server.uid('search', None, '(SINCE {date} FROM "Steam Support")'.format(date=date))[1][0].split()

        #server.select()
        #result, data = server.uid('search', None, "ALL")  # search and return uids instead
        #latest_email_uid = data[0].split()[-1]
        #ids = data[0]  # data is a list.
        #id_list = msg_ids.split()  # ids is a space separated string

        '''for num in id_list:
            typ, data = server.fetch(num, '(RFC822)')
            print('Message %s\n%s\n' % (num, data[0][1]))'''

        # server.close()
        # server.logout()

        #subject, t = server.uid('fetch', b'3168', '(BODY.PEEK[TEXT])')
        '''for response_part in t:
            if isinstance(response_part, tuple):
                ert = email.message_from_bytes(response_part[1]).get_payload(None, True)
                bf = quopri.decodestring(ert)
                bff = str(bf, errors='replace')
                print(response_part[1])'''

        msg_ids.sort(reverse=True)
        for uid in msg_ids:
            st, subject = server.uid('fetch', uid, '(BODY.PEEK[TEXT] ENVELOPE)')
            for response_part in subject:
                if isinstance(response_part, tuple):
                    ert = email.message_from_bytes(response_part[1]).get_payload(None, True)
                    if re.search(r'=\?((?:\w|-)+)\?B\?(.+)\?=', str(ert, errors='replace')):
                        bf = base64.decodebytes(ert)
                    else:
                        bf = quopri.decodestring(ert)
                    code = self.find_code(str(bf, errors='replace'))
                    if code:
                        try:
                            typ, response = server.uid('store', uid, '+FLAGS', r'(\Deleted)')
                        except:
                            print('get_email_authcode error')
                        finally:
                            server.close()
                            return code
        server.close()
        return False

    def find_code(self, text):
        ex = r'account[\s]*' + r'(?i)' + self.login + r'[,:]'
        match = re.search(ex, text)
        if match:
            ex += r'[\s]*'+r'(?P<code>\w{5,5})'
            match = re.search(ex, text)
            code = match.group('code')
            if code:
                return code
        return False

    def get_online(self):
        #todo пока не работает
        chat_url = 'https://steamcommunity.com/chat/'
        self.session.get(chat_url)

    def get_inventory_params(self):
        d = self.session.cookies.get_dict()
        self.sessionID = d.get('sessionid', None)
        k = self.session.cookies.keys()
        s = ''.join(k)
        match = re.search(r'[\w]*(?i)machineauth(?P<sid>\d{17,20})', s)
        self.steamID = match.group('sid')

        inventory_url = 'http://steamcommunity.com/profiles/{ID}/inventory/'.format(ID=self.steamID)
        resp = self.session.get(inventory_url)
        cont = str(resp.content)
        g_rgAppContextData = re.search(r'g_rgAppContextData = (?P<context>\{.*\});+?', cont).group('context')
        try:
            self.g_rgAppContextData = json.loads(g_rgAppContextData)
        except:
            print('get_inventory_params error')
        return

    def get_inventory_from_db(self):
        pass


    def get_inventory_from_site(self):
        inventory = {}
        for appid in self.g_rgAppContextData:
            rgContexts = self.g_rgAppContextData[appid]['rgContexts']
            inventory[appid] = {}
            for rgid in rgContexts:
                inventory[appid][rgid] = self._load_assets(appid, rgid)
                if rgContexts[rgid]['asset_count'] != inventory[appid][rgid].get('total_inventory_count'):
                    print('get_inventory_from_site загружено не всё')
        self.inventory = inventory
        self.save_inventory(inventory)
        return

    def save_inventory(self, inventory):
        for appid in inventory:
            for cid in inventory[appid]:
                self.db.add_items(self.login, inventory[appid][cid].get('assets', list()))
                self.db.add_descriptions(inventory[appid][cid].get('descriptions', list()))



    def _load_assets(self, appid, contextid):
        url = 'http://steamcommunity.com/inventory/' + self.steamID + '/' + appid + '/' + contextid
        last_assetid = None
        result = {}
        while True:
            if last_assetid:
                params = {'l': 'russian', 'count': 75, 'start_assetid': last_assetid}
            else:
                params = {'l': 'russian', 'count': 2000}
            resp = self.session.get(url, params=params)
            try:
                cont = resp.json()
                if len(result) == 0:
                    result = cont
                else:
                    for n, v in cont.items():
                        if(type(v) == list):
                            result[n].extend(v)
                        else:
                            result[n] = v
            except:
                print('_load_assets error')
                return {}
            if cont and cont.get('last_assetid', None):
                last_assetid = cont.get('last_assetid')
            else:
                break
        if result is None:
            return {}
        return result




list_response_pattern = re.compile(r'\((?P<flags>.*?)\) "(?P<delimiter>.*)" (?P<name>.*)')

def parse_list_response(line):
    match = list_response_pattern.match(line.decode('utf-8'))
    flags, delimiter, mailbox_name = match.groups()
    mailbox_name = mailbox_name.strip('"')
    return flags, delimiter, mailbox_name


def test():
    db = DataBase()
    iy = db.db.cursor().execute("select * from sqlite_master").fetchall()
    us = SteamClient(lp.USERNAME, lp.PASSWORD, db)
    '''db.add_user(lp.USERNAME, lp.PASSWORD, lp.ename)
    us.db.add_cookie(lp.USERNAME, *(lp.sl))
    us.db.add_cookie(lp.USERNAME, *(lp.sls))
    us.db.add_cookie(lp.USERNAME, *(lp.sma))
    us.db.add_cookie(lp.USERNAME, *(lp.srl))'''
    us.do_login()
    us.get_inventory_params()
    us.get_inventory_from_site()

    USERNAME = lp.USERNAME
    PASSWORD = lp.PASSWORD

    session = requests.session()
    session.headers.update(headers)
    session.get(LOGINURL)

    rsakey_url = "https://store.steampowered.com/login/getrsakey/"
    data = {'username': USERNAME, 'donotcache': int(time.time()*1000)}
    resp = session.post(rsakey_url, data=data, allow_redirects=False)
    cont = json.loads(resp.content)

    e = int(cont['publickey_exp'], 16)
    n = int(cont['publickey_mod'], 16)
    public_key = rsa.PublicKey(n,e)
    enc_password = base64.b64encode(rsa.encrypt(PASSWORD, public_key))



    log_url = "https://store.steampowered.com/login/dologin/"
    data = {
    'password': enc_password,
    'username': USERNAME,
    'twofactorcode': '',
    'emailauth': '',
    'loginfriendlyname': '',
    'captchagid': -1,
    'captcha_text': '',
    'emailsteamid': '',
    'rsatimestamp': cont['timestamp'],
    'remember_login': 'true',
    'donotcache': int(time.time()*1000)
    }

    resp = session.post(log_url, data=data, allow_redirects=False)
    cont = json.loads(resp.content)


    rsakey_url = "https://store.steampowered.com/login/getrsakey/"
    data = {'username': USERNAME, 'donotcache': int(time.time()*1000)}
    resp = session.post(rsakey_url, data=data, allow_redirects=False)
    cont = json.loads(resp.content)

    e = int(cont['publickey_exp'], 16)
    n = int(cont['publickey_mod'], 16)
    public_key = rsa.PublicKey(n,e)
    enc_password = base64.b64encode(rsa.encrypt(PASSWORD, public_key))
    #rsa = construct((n, e))
    #cipher = PKCS1_v1_5.new(rsa)
    #password = cipher.encrypt(PASSWORD)
    #password = base64.b64encode(password)


    log_url = "https://store.steampowered.com/login/dologin/"
    data = {
    'password': enc_password,
    'username': USERNAME,
    'twofactorcode': '',
    'emailauth': 'RY2F6',
    'loginfriendlyname': 'pc_name',
    'captchagid': -1,
    'captcha_text': '',
    'emailsteamid': '7656119xxxxxxxx',
    'rsatimestamp': cont['timestamp'],
    'remember_login': 'true',
    'donotcache': int(time.time()*1000)
    }

    resp = session.post(log_url, data=data, allow_redirects=False)
    cont = json.loads(resp.content)


    # Authenticate
    r = session.post(LOGINURL, data=formdata, headers=headers, allow_redirects=False)
    print('lll')



if __name__ == "__main__":
    test()
