import sqlite3
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


DATABASE = 's.db'
ITEM_FIELDS = {
    'appid': 'appId',
    'amount': 'amount',
    'classid': 'classId'
}
DESCRIPTION_FIELDS = {
    'classid': 'classId',
    'appid': 'appId',
    'commodity': 'commodity',
    'currency': 'currency',
    'icon_url': 'iconUrl',
    'icon_url_large': 'iconUrlLarge',
    'instanceid': 'instanceId',
    'market_fee_app': 'marketFeeApp',
    'name': 'name',
    'market_hash_name': 'marketHashName', 
    'market_marketable_restriction': 'marketMarketableRestriction', 
    'market_name': 'marketName',
    'marketable': 'marketable', 
    'tradable': 'tradable'
}

class DataBase:

    def __init__(self):
        self.db = self._get_db()
        self.db.row_factory = self.dict_factory
        self._create_db_schema()

    @staticmethod
    def dict_factory(cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    @staticmethod
    def resp_to_dict_list(cursor, data):
        r = []
        for row in data:
            r.append(DataBase.dict_factory(cursor, row))
        return r

    def _get_db(self):
        return sqlite3.connect(DATABASE)

    def close(self):
        self.db.close()

    def _create_db_schema(self):
        account_table = 'CREATE TABLE IF NOT EXISTS account (' \
                        ' login VARCHAR(32) NOT NULL,' \
                        ' password VARCHAR(32) NOT NULL,' \
                        ' email VARCHAR(255) NOT NULL,' \
                        ' money INTEGER NOT NULL DEFAULT 0 CHECK (money >=0),' \
                        ' steamid INTEGER UNIQUE,' \
                        ' user VARCHAR(32) NOT NULL,' \
                        ' CONSTRAINT pk_account PRIMARY KEY (login),'\
                        ' CONSTRAINT fk_user_login FOREIGN KEY (user) REFERENCES user(login) ON DELETE CASCADE);'

        user_table = 'CREATE TABLE IF NOT EXISTS user (' \
                    ' login VARCHAR(32) NOT NULL,' \
                    ' password VARCHAR(32) NOT NULL,' \
                    ' email VARCHAR(255) NOT NULL,' \
                    ' CONSTRAINT pk_user PRIMARY KEY (login));'

        cookie_table = 'CREATE TABLE IF NOT EXISTS cookie (' \
                       ' id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL DEFAULT 0,' \
                       ' name VARCHAR(255),' \
                       ' value VARCHAR(255),' \
                       ' domain VARCHAR(255),' \
                       ' login VARCHAR(32) NOT NULL,' \
                       ' CONSTRAINT fk_account FOREIGN KEY (login) REFERENCES account(login) ON DELETE CASCADE,' \
                       ' CONSTRAINT un_cookie UNIQUE (login, name));'

        inventory_table = 'CREATE TABLE IF NOT EXISTS inventory(' \
                          ' login VARCHAR(32) NOT NULL,' \
                          ' id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL DEFAULT 0,' \
                          ' name VARCHAR(32),' \
                          ' appid INT NOT NULL,' \
                          ' icon VARCHAR(255),' \
                          ' inventory_logo VARCHAR(255),' \
                          ' CONSTRAINT fk_account_login FOREIGN KEY (login) REFERENCES account(login) ON DELETE CASCADE,' \
                          ' CONSTRAINT un_inventory  UNIQUE (login, appid));'

        bag_table = 'CREATE TABLE IF NOT EXISTS bag(' \
                    ' sender VARCHAR(32) NOT NULL,' \
                    ' reciver VARCHAR(32) NOT NULL,' \
                    ' id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,' \
                    ' CONSTRAINT fk_account_login FOREIGN KEY (sender) REFERENCES account(login) ON DELETE CASCADE,' \
                    ' CONSTRAINT fk_account_login1 FOREIGN KEY (reciver) REFERENCES account(login) ON DELETE CASCADE);'

        item_table = 'CREATE TABLE IF NOT EXISTS item(' \
                     ' inventory_id INT NOT NULL,' \
                     ' amount INT NOT NULL DEFAULT 1,' \
                     ' assetid BIGINT(20) NOT NULL PRIMARY KEY,' \
                     ' classid INT NOT NULL,' \
                     ' bag_id INT,' \
                     ' CONSTRAINT fk_inventory_id FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE,' \
                     ' CONSTRAINT fk_description_classid FOREIGN KEY (classid) REFERENCES description(classid) ON DELETE NO ACTION,' \
                     ' CONSTRAINT fk_bag_id FOREIGN KEY (bag_id) REFERENCES bag(id) ON DELETE SET NULL);'

        item_index = 'CREATE INDEX IF NOT EXISTS item_index ON item (login, appid, classid);'

        description_table = 'CREATE TABLE IF NOT EXISTS description(' \
                            ' classid INT NOT NULL UNIQUE,' \
                            ' appid INT NOT NULL,' \
                            ' commodity INT NOT NULL,' \
                            ' currency INT NOT NULL,' \
                            ' icon_url VARCHAR(255) NOT NULL,' \
                            ' icon_url_large VARCHAR(255) NOT NULL,' \
                            ' instanceid INT NOT NULL DEFAULT 0,' \
                            ' market_fee_app INT,' \
                            ' name VARCHAR(63) NOT NULL,' \
                            ' market_hash_name VARCHAR(63) NOT NULL,' \
                            ' market_marketable_restriction INT,' \
                            ' market_name VARCHAR(63) NOT NULL,' \
                            ' marketable INT NOT NULL,' \
                            ' tradable INT NOT NULL);'

        access_token_table = 'CREATE TABLE IF NOT EXISTS access_token (' \
                            ' access_token LONGTEXT NOT NULL,' \
                            ' refresh_token LONGTEXT NOT NULL UNIQUE,' \
                            ' login VARCHAR(32) NOT NULL,' \
                            ' CONSTRAINT fk_user_login FOREIGN KEY (login) REFERENCES user(login) ON DELETE CASCADE);'


        self.db.cursor().execute('PRAGMA foreign_keys = ON;')
        self.db.cursor().execute(user_table)
        self.db.cursor().execute(account_table)
        self.db.cursor().execute(cookie_table)
        self.db.cursor().execute(inventory_table)
        self.db.cursor().execute(description_table)
        self.db.cursor().execute(item_table)
        self.db.cursor().execute(bag_table)
        self.db.cursor().execute(access_token_table)
        #self.db.cursor().execute(item_index)
        
        #todo это чекает ключи
        self.db.cursor().execute('PRAGMA foreign_key_check;')
        ddd = self.db.cursor().execute('PRAGMA foreign_key_list(item);').fetchall()
        self.db.commit()
        self._add_queries_names()
        return

    def drop_db(self):
        self.db.cursor().execute('DROP table IF EXISTS user')
        self.db.cursor().execute('DROP table IF EXISTS account')
        self.db.cursor().execute('DROP table IF EXISTS cookie')
        self.db.cursor().execute('DROP table IF EXISTS inventory')
        self.db.cursor().execute('DROP table IF EXISTS description')
        self.db.cursor().execute('DROP table IF EXISTS item')
        self.db.cursor().execute('DROP table IF EXISTS access_token')
        self.db.cursor().execute('DROP index IF EXISTS item_index')
        self.db.commit()


    def _add_queries_names(self):
        query = 'PRAGMA table_info({table})'
        tab = self.db.cursor().execute("SELECT * FROM sqlite_master WHERE type='table'").fetchall()
        tables = list([i['name'] for i in tab])
        for name in tables:
            d = self.db.cursor().execute(query.format(table=name)).fetchall()
            self.__dict__['_table_'+name] = list([i['name'] for i in d])
        return

    def get_access_tokens(self, login):
        query = 'SELECT * FROM access_token WHERE login=?'
        r = self.db.cursor().execute(query, (login,)).fetchall()
        return r

    def add_access_tokens(self, login, access, refresh):
        query = 'INSERT OR ABORT INTO access_token (login, access_token, refresh_token) values(?, ? ,?)'
        query_params = (login, access, refresh)
        r = None
        try:
            r = self.db.cursor().execute(query, query_params)
        except sqlite3.DatabaseError as e:
            print('add_access_token', e.args[0])
        else:
            self.db.commit()
        return r.lastrowid if r else None

    def delete_access_tokens(self, login, refresh):
        query = 'DELETE FROM access_token WHERE login=? AND refresh_token=?'
        try:
            r = self.db.cursor().execute(query, (login, refresh))
        except sqlite3.DatabaseError as e:
            print('delete_access_token', e.args[0])
        else:
            self.db.commit()
        return r.rowcount if r else None

    def update_access_token(self, access, refresh):
        query = 'UPDATE access_token SET access_token=? WHERE refresh_token=?'
        query_params = (access, refresh)
        try:
            r = self.db.cursor().execute(query, query_params)
        except sqlite3.DatabaseError as e:
            print('update_access_token', e.args[0])
        else:
            self.db.commit()
        return r.rowcount if r else None

    def update_access_tokens(self, access, refresh):
        query = 'UPDATE access_token SET access_token=?, refresh_token=? WHERE refresh_token=?'
        query_params = (access, refresh, refresh)
        try:
            r = self.db.cursor().execute(query, query_params)
        except sqlite3.DatabaseError as e:
            print('update_access_tokens', e.args[0])
        else:
            self.db.commit()
        return r.arraysize if r else None

#ok
    def add_user(self, login, password, email):
        query = 'INSERT OR ABORT INTO user (login, password, email) ' \
        'VALUES(?,?,?)'
        query_params = (login, password, email)
        try:
            self.db.cursor().execute(query, query_params)
        except sqlite3.IntegrityError as e:
            if e.args[0].find('UNIQUE') == -1:
                print('add_user', e.args[0])
        else:
            self.db.commit()
        return True

    def add_account(self, user_login, login, password, email, money=0):
        query = 'INSERT OR ABORT INTO account (login, password, email, money, user) ' \
         'VALUES(?, ?, ?, ?, ?)'
        query_params = (login, password, email, money, user_login)
        #self.db.cursor().execute(query, query_params)
        try:
            self.db.cursor().execute(query, query_params)
        except sqlite3.IntegrityError as e:
            if e.args[0].find('UNIQUE') == -1:
                print('add_account', e.args[0])
        else:
            self.db.commit()
        return True

    def update_account(self, *args, **kwargs):
        #rr = self.get_accounts()
        query = 'UPDATE account SET ' + '=?,'.join([x for x in kwargs if x != 'login']) +'=?' \
        + ' WHERE login=?;'
        query_params = list([kwargs.get(x) for x in kwargs if x != 'login'] + [kwargs['login']])
        self.db.cursor().execute(query, query_params)
        self.db.commit()
        return True




    def add_cookie(self, login, name, value, domain):
        query = 'INSERT OR REPLACE INTO cookie (name, value, domain, login) \
         VALUES(?, ?, ?, ?);'
        query_params = (name, value, domain, login)
        try:
            self.db.cursor().execute(query, query_params)
        except sqlite3.IntegrityError as e:
            if e.args[0].find('UNIQUE') == -1:
                print('add_cookie', e.args[0])
        else:
            self.db.commit()
        return True
#ok
    def get_accounts(self, login):
        query = 'SELECT * FROM account WHERE user=?'
        r = self.db.cursor().execute(query, (login,)).fetchall()
        return r

    def get_cookies(self, login):
        query = 'SELECT * FROM cookie WHERE login=?'
        r = self.db.cursor().execute(query, (login,)).fetchall()
        return r
#ok
    def add_items(self, login, items):
        inv = self.db.cursor().execute('select appid, id from inventory where login=?', (login,)).fetchall()
        appids = {}
        for i in inv:
            appids[i['appid']] = i['id']
        names = [x for x in self._table_item]
        query = 'INSERT OR ABORT INTO item (' + ', '.join(names) + ') VALUES(' + ''.join([r'?,' for _ in names])[0:-1] + ');'
        for i in items:
            if appids.get(i['appid']) == None:
                r = self.add_inventory(login, i['appid'])
                appids[i['appid']] = r
            try:
                query_params = list([appids[i['appid']]]+[i.get(x) for x in names if x != 'inventory_id'])
                self.db.cursor().execute(query, query_params)
            except sqlite3.IntegrityError as e:
                if e.args[0].find('UNIQUE') == -1:
                    print('add_items', e.args[0])
        self.db.commit()
        return

    def get_contextids(self, login, appid):
        query = 'SELECT contextid FROM item WHERE login=? and appid=? GROUP BY contextid'
        r = self.db.cursor().execute(query, (login, appid)).fetchall()
        return r

    def get_items(self, login, appid = None, contextid = None):
        query = 'SELECT * FROM item WHERE login=?'
        query_params = (login,)
        if appid is not None:
            query += ' AND appid=?'
            query_params += (appid,)

        if contextid is not None:
            query += ' AND contextid=?'
            query_params += (contextid,)
        r = self.db.cursor().execute(query, query_params).fetchall()
        return r

    def get_descriptions(self, login, appid, contextid = None):
        query = 'SELECT * FROM description WHERE appid=?'
        query_params = (appid,)

        if contextid is not None:
            query += ' AND classid IN (SELECT DISTINCT classid FROM item WHERE login=? AND contextid=? )'
            query_params += (login, contextid)
        r = self.db.cursor().execute(query, query_params).fetchall()
        return r

    def get_all_descriptions(self):
        query = 'SELECT * FROM description'
        r = self.db.cursor().execute(query).fetchall()
        return r
#ok
    def add_descriptions(self, descs):
        query = 'INSERT OR ABORT INTO description (' + ', '.join(self._table_description) + ') VALUES(' + ''.join([r'?,' for _ in self._table_description])[0:-1] + ');'
        for i in descs:
            try:
                query_params = list([i.get(x) for x in self._table_description])
                self.db.cursor().execute(query, query_params)
            except sqlite3.IntegrityError as e:
                if e.args[0].find('UNIQUE') == -1:
                    print('add_descriptions', e.args[0])
        self.db.commit()
        return


    def delete_items(self, items):
        query = 'DELETE FROM item WHERE assetid = ?'
        query_params = [(x.get('assetid'),) for x in items]
        try:
            self.db.cursor().executemany(query, query_params)
        except sqlite3.IntegrityError as e:
            print('delete_items', e.args[0])
        else:
            self.db.commit()
        return
#ok
    def get_inventories(self, login, accounts=[]):
        nacc = []
        if len(accounts) >1:
            acc = self.db.cursor('SELECT login FROM account WHERE user=?', login).fetchall()
            for k in accounts:
                if k in acc:
                    nacc.append(k)
        query = 'select a.login, item.*, i.appid as bagId, i.name as bagName, i.icon, d.* from user u join account a on u.login=a.user' \
         ' join inventory i on a.login=i.login join item on i.id=item.inventory_id join description d on d.classid=item.classid' \
         ' where u.login=? ' + ('and a.login in(?) ' if len(nacc)!=0 else '') + ' order by a.login, appid, classid'
        query_params = [login,] + nacc
        r = self.db.cursor().execute(query, query_params).fetchall()
        return self._get_inventories_normalize(r)
#ok
    def _get_inventories_normalize(self, data):
        res = {}
        res['inventories'] =[]
        uobj = {}
        bag = {}
        lastrow = {}
        item = {}
        descs = []
        for row in data:
            if lastrow.get('classid') != row['classid']:
                if len(item.get('assetId', []))>0:
                    #todo доделать
                    item['amountAvailable'] = item['amount']
                    bag['items'].append(item)
                item = reducer(ITEM_FIELDS, row)
                item['assetId'] = []
                descs.append(reducer(DESCRIPTION_FIELDS, row))
            item['assetId'].append(row['assetid']) 

            if lastrow.get('bagId') != row['bagId']:
                if len(bag.keys())>0:
                    bag['itemDescriptions'] = descs
                    uobj['bags'].append(bag) 
                bag ={}
                bag['id'] = row['bagId']
                bag['name'] = row['bagName']
                bag['icon'] = row['icon']
                #bag['name'] = row['bagName']
                bag['items'] =[]
                bag['itemDescriptions'] =[]
                descs = []

            if lastrow.get('login') != row['login']:
                if len(uobj.keys())>0:
                    res['inventories'].append(uobj)
                uobj = {}
                uobj['user'] = row['login']
                uobj['bags'] = []
            
            lastrow = row

        if len(item.get('assetId', []))>0:
            bag['itemDescriptions'] = descs
            bag['items'].append(item)
        if len(bag.keys())>0:
            uobj['bags'].append(bag) 
        if len(uobj.keys())>0:
            res['inventories'].append(uobj)
        return res

#ok
    def add_inventory(self, login, appid, **kwargs):
        kwargs['login'] = login
        kwargs['appid'] = appid
        names = [x for x in self._table_inventory if x !='id']
        query = 'INSERT OR ABORT INTO inventory (' + ', '.join(names) + ') VALUES(' + ''.join([r'?,' for _ in names])[0:-1] + ');'
        query_params = [kwargs.get(x) for x in names]
        r = None
        try:
            r = self.db.cursor().execute(query, query_params)
        except sqlite3.IntegrityError as e:
            if e.args[0].find('UNIQUE') == -1:
                print('add_inventory', e.args[0])
        else:
            self.db.commit()
        return r.lastrowid if r else None

    def drop_inventories(self, login, appids = None):
        if appids is None:
            query = 'DELETE FROM inventory WHERE login = ?'
            self.db.cursor().execute(query, (login,))
        else:
            query = 'DELETE FROM inventory WHERE login = ? and appid = ?'
            self.db.cursor().executemany(query, [(login, x) for x in appids])
        self.db.commit()


def reducer(keys, data):
    res ={}
    for k, v in keys.items():
        res[v] = data[k]
    return res