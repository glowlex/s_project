import sqlite3
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

    def _create_db_schema(self):
        user_table = 'CREATE TABLE IF NOT EXISTS user (' \
                     ' login VARCHAR(32) NOT NULL,' \
                     ' password VARCHAR(32) NOT NULL,' \
                     ' email VARCHAR(255) NOT NULL,' \
                     ' money INTEGER NOT NULL DEFAULT 0 CHECK (money >=0),' \
                     ' CONSTRAINT user_pk PRIMARY KEY (login));'

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
                     ' CONSTRAINT fk_inventory FOREIGN KEY (login, appid) REFERENCES inventory(login, appid) ON DELETE CASCADE,' \
                     ' CONSTRAINT fk_class FOREIGN KEY (classid) REFERENCES description(classid) ON DELETE NO ACTION,' \
                     ' CONSTRAINT item_un UNIQUE (assetid));'

        item_index = 'CREATE INDEX IF NOT EXISTS item_index ON item (login, appid, classid);'

        description_table = 'CREATE TABLE IF NOT EXISTS description(' \
                      ' classid INT NOT NULL UNIQUE,' \
                      ' appid INT NOT NULL,' \
                      ' commodity INT NOT NULL,' \
                      ' currency INT NOT NULL,' \
                      ' icon_url VARCHAR(128) NOT NULL,' \
                      ' icon_url_large VARCHAR(128) NOT NULL,' \
                      ' instanceid INT NOT NULL DEFAULT 0,' \
                      ' market_fee_app INT,' \
                      ' name VARCHAR(45) NOT NULL,' \
                      ' market_hash_name VARCHAR(45) NOT NULL,' \
                      ' market_marketable_restriction INT,' \
                      ' market_name VARCHAR(45) NOT NULL,' \
                      ' marketable INT NOT NULL,' \
                      ' tradable INT NOT NULL,' \
                      ' CONSTRAINT class_un UNIQUE (appid, classid));'


        #test
        self.db.cursor().execute('DROP table IF EXISTS  user')
        self.db.cursor().execute('DROP table IF EXISTS  cookie')
        self.db.cursor().execute('DROP table IF EXISTS  description')
        self.db.cursor().execute('DROP table IF EXISTS  inventory')
        self.db.cursor().execute('DROP table IF EXISTS  item')
        self.db.cursor().execute('DROP index IF EXISTS  item_index')

        self.db.cursor().execute('PRAGMA foreign_keys = ON;')
        self.db.cursor().execute(user_table)
        self.db.cursor().execute(cookie_table)
        self.db.cursor().execute(inventory_table)
        self.db.cursor().execute(description_table)
        self.db.cursor().execute(item_table)
        self.db.cursor().execute(item_index)
        #todo это чекает ключи
        self.db.cursor().execute('PRAGMA foreign_key_check;')
        ddd = self.db.cursor().execute('PRAGMA foreign_key_list(item);').fetchall()
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
        except sqlite3.IntegrityError as e:
            if e.args[0].find('UNIQUE') == -1:
                print('add_user', e.args[0])
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
        query = 'INSERT OR ABORT INTO item (' + ', '.join(self._table_item) + ') VALUES(' + ''.join([r'?,' for _ in self._table_item])[0:-1] + ');'
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
        return


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
            if e.args[0].find('UNIQUE') == -1:
                print('add_descriptions', e.args[0])
        self.db.commit()
        return

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

    def drop_inventories(self, login, appids=None):
        if appids is None:
            query = 'DELETE FROM inventory WHERE login = ?'
            self.db.cursor().execute(query, (login,))
        else:
            query = 'DELETE FROM inventory WHERE login = ? and appid = ?'
            self.db.cursor().executemany(query, [(login, x) for x in appids])
        self.db.commit()