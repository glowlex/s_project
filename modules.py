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
        self.create_db_schema()

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


    def create_db_schema(self):

        user_table = 'CREATE TABLE IF NOT EXISTS user (login VARCHAR(32) NOT NULL, password VARCHAR(32) NOT NULL,' \
                     'email VARCHAR(255) NOT NULL, money INTEGER NOT NULL DEFAULT 0 CHECK (money >=0), CONSTRAINT user_pk PRIMARY KEY (login), CONSTRAINT login_un UNIQUE (login));'
        cookie_table = 'CREATE TABLE IF NOT EXISTS cookie (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL DEFAULT 0, name VARCHAR(256), value VARCHAR(256), domain VARCHAR(256),' \
        'login VARCHAR(32) NOT NULL, CONSTRAINT fk_user FOREIGN KEY (login) REFERENCES user(login) ON DELETE CASCADE, CONSTRAINT cookie_un UNIQUE (login, name));'
        self.db.cursor().execute('DROP table  IF EXISTS  user')
        self.db.cursor().execute('DROP table IF EXISTS  cookie')
        self.db.cursor().execute(user_table)
        self.db.cursor().execute(cookie_table)
        return

    def add_user(self, login, password, email, money=0):
        query = 'INSERT OR REPLACE INTO user (login, password, email, money) ' \
         'VALUES(?, ?, ?, ?)'
        query_params = (login, password, email, money)
        self.db.cursor().execute(query, query_params)
        try:
            self.db.cursor().execute(query, query_params)
        except Exception:
            return False
        return True


    def add_cookie(self, login, name, value, domain):
        query = 'INSERT OR REPLACE INTO cookie (name, value, domain, login) \
         VALUES(?, ?, ?, ?);'
        query_params = (name, value, domain, login)
        try:
            self.db.cursor().execute(query, query_params)
        except Exception:
            return False
        return True

    def get_users(self):
        query = 'SELECT * FROM user'
        r = self.db.cursor().execute(query).fetchall()
        return r

    def get_cookies(self, login):
        query = 'SELECT * FROM cookie WHERE login=?'
        r = self.db.cursor().execute(query, (login,)).fetchall()
        return r





class SteamClient:

    def __init__(self, login, password, database):
        self.session = requests.session()
        self.session.headers.update(HEADERS)
        self.login = login
        self.password = password
        self.transferparameters = ''
        self.db = database

    def get_publick_key_n_timestamp(self):
        rsakey_url = LOGINURL+"/getrsakey/"
        data = {'username': self.login, 'donotcache': int(time.time()*1000)}
        resp = self.session.post(rsakey_url, data=data, allow_redirects=False)
        cont = resp.json()

        if(cont['success']):
            e = int(cont['publickey_exp'], 16)
            n = int(cont['publickey_mod'], 16)
            public_key = rsa.PublicKey(n,e)
                #rsa = construct((n, e))
                #cipher = PKCS1_v1_5.new(rsa)
                #password = cipher.encrypt(PASSWORD)
                #password = base64.b64encode(password)
            return public_key, cont['timestamp']
        else:
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
        log_url = LOGINURL+ "dologin/"
        self.set_cookies()
        firstlogin = True if self.session.cookies.items()==0 else False
        resp = self.session.get(LOGINURL)
        if(len(resp.cookies.items())==0):
            return
        data = self.get_data_for_login()
        resp = self.session.post(log_url, data=data, allow_redirects=False)
        cont = resp.json()
        self.transferparameters = cont.get('transfer_parameters', '')
        if cont.get('emailauth_needed', False):
            data = self.get_data_for_login(cont)
            resp = self.session.post(log_url, data=data, allow_redirects=False)
            cont = resp.json()

        if cont.get('login_complete', False):
            if firstlogin:
                for n, v in self.session.cookies.iteritems():
                    #TODO может разобраться с доменами
                    self.db.add_cookie(self.login, n, v, self.session.cookies.list_domains()[0])
            return True

        return False

    def get_data_for_login(self, cont={}):
            public_key, timestamp = self.get_publick_key_n_timestamp()
            enc_password = base64.b64encode(rsa.encrypt(self.password, public_key))
            email_code = ''
            if len(cont) != 0:
                i=20
                while(i>0):
                    email_code = self.get_email_authcode()
                    if email_code:
                        i=0
                    i-=1
                    time.sleep(30)

            pc_name = ''
            if(cont.get('emailauth_needed', False)):
                email_code = self.get_email_authcode()
                name_list = ('pc', 'mypc', 'apple', 'eeee', 'notik', 'nbook', 'qqq', 'firefox', 'chrome',\
                             'yan', 'dmitry', 'alex', 'ivan', 'sergey', 'niko', 'vera', 'natali', 'olga',\
                             'anna', 'masha', 'maria')
                pc_name = name_list[random.randint(0, len(name_list)-1)]
                if random.randint(1, 4)==2:
                    pc_name +=str(random.randint(1, 20))
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
        import quopri
        from imaplib import IMAP4, IMAP4_SSL
        import base64
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
        date = (datetime.date.today() - datetime.timedelta(days=10)).strftime("%d-%b-%Y")
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
        for id in msg_ids:
            st, subject = server.uid('fetch', id, '(BODY.PEEK[TEXT] ENVELOPE)')
            for response_part in subject:
                if isinstance(response_part, tuple):
                    ert = email.message_from_bytes(response_part[1]).get_payload(None, True)
                    if re.search(r'=\?((?:\w|-)+)\?B\?(.+)\?=', str(ert, errors='replace')):
                        bf = base64.decodebytes(ert)
                    else:
                        bf = quopri.decodestring(ert)
                    code = self.find_code(str(bf, errors='replace'))
                    if(code):
                        typ, response = server.uid('store', id, '+FLAGS', r'(\Deleted)')
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

list_response_pattern = re.compile(r'\((?P<flags>.*?)\) "(?P<delimiter>.*)" (?P<name>.*)')

def parse_list_response(line):
    match = list_response_pattern.match(line.decode('utf-8'))
    flags, delimiter, mailbox_name = match.groups()
    mailbox_name = mailbox_name.strip('"')
    return (flags, delimiter, mailbox_name)


def test():
    db = DataBase()
    us = SteamClient(lp.USERNAME, lp.PASSWORD, db)
    us.get_email_authcode()
    db.add_user(lp.USERNAME, lp.PASSWORD, 'eee')
    us.db.add_cookie(lp.USERNAME, *(lp.sl))
    us.db.add_cookie(lp.USERNAME, *(lp.sls))
    us.db.add_cookie(lp.USERNAME, *(lp.sma))
    us.db.add_cookie(lp.USERNAME, *(lp.srl))
    us.set_cookies()
    t1 = us.session.cookies.items()
    t2 = us.session.cookies.list_domains()

    us.do_login()

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
