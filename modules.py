import random
import sqlite3
from http.cookiejar import Cookie

import re
from flask import g
import requests
import time
import json
#from Crypto.PublicKey.RSA import construct
from binascii import unhexlify
from codecs import encode
#from Crypto.Signature import PKCS1_v1_5
import lp
import rsa
import base64
from requests.cookies import cookiejar_from_dict, extract_cookies_to_jar, RequestsCookieJar, create_cookie
import datetime
import quopri
from imaplib import IMAP4_SSL
import base64

from s_db import DataBase

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
        return self.g_rgAppContextData

    def get_inventory_from_db(self):
        inv = self.db.get_inventories(self.login)
        inventory = {}
        for i in inv:
            inventory[str(i['appid'])] = {}
            contextids = self.db.get_contextids(self.login, i['appid'])
            for c in contextids:
                inventory[str(i['appid'])][str(c['contextid'])] = {}
                inventory[str(i['appid'])][str(c['contextid'])]['assets'] = self.db.get_items(self.login, i['appid'], c['contextid'])
                inventory[str(i['appid'])][str(c['contextid'])]['total_inventory_count'] = len(inventory[str(i['appid'])][str(c['contextid'])]['assets'])

                inventory[str(i['appid'])][str(c['contextid'])]['descriptions'] = self.db.get_descriptions(self.login, i['appid'], c['contextid'])
                inventory[str(i['appid'])][str(c['contextid'])]['total_inventory_count'] = len(inventory[str(i['appid'])][str(c['contextid'])]['descriptions'])
        self.inventory = inventory
        return self.inventory


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
        return self.inventory

    def save_inventory(self, inventory):
        for appid in inventory:
            for cid in inventory[appid]:
                self.db.add_descriptions(inventory[appid][cid].get('descriptions', list()))
                self.db.add_items(self.login, inventory[appid][cid].get('assets', list()))



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
    us = SteamClient(lp.ACCOUNTUSERNAME, lp.ACCOUNTPASSWORD, db)
    db.add_user(lp.uname, lp.upass, lp.uemail)
    db.add_account(lp.uname, lp.ACCOUNTUSERNAME, lp.ACCOUNTPASSWORD, lp.ename)
    us.db.add_cookie(lp.ACCOUNTUSERNAME, *(lp.sl))
    us.db.add_cookie(lp.ACCOUNTUSERNAME, *(lp.sls))
    us.db.add_cookie(lp.ACCOUNTUSERNAME, *(lp.sma))
    us.db.add_cookie(lp.ACCOUNTUSERNAME, *(lp.srl))
    aaa = us.db.get_accounts(lp.uname)
    ddd = us.get_inventory_from_db()
    #us.get_email_authcode()
    return
    us.do_login()
    us.get_inventory_params()
    db.update_account(login=lp.ACCOUNTUSERNAME, steamid = us.steamID)
    us.get_inventory_from_site()
    us.get_inventory_from_db()
    '''pwq = db.db.cursor().execute("select * from inventory").fetchall()
    pvv = db.db.cursor().execute("select * from item").fetchall()
    db.drop_inventories('rubiroidMW2', (440,))
    fvv = db.db.cursor().execute("select * from item").fetchall()
    fvq = db.db.cursor().execute("select * from inventory").fetchall()'''

    return




if __name__ == "__main__":
    test()
