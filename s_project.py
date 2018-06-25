from flask import Flask
from flask import render_template, flash, redirect, g, jsonify, request
from flask_cors import CORS, cross_origin
from flask_json import FlaskJSON, JsonError, json_response, as_json
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, create_refresh_token, decode_token, fresh_jwt_required
import time
 
import s_db
from modules import *

app = Flask(__name__)
app.config.from_object('config')
app.config['SECRET_KEY'] = 'lel-kek-cheburek'
jwt = JWTManager(app)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
FlaskJSON(app)


users = {
    lp.uname: {
    'login': lp.uname,
    'password': "a",
    'id': '112'
    }
}



@app.before_request
def testapp():
    #g.user = get_jwt_identity()
    pass

@app.route('/')
@app.route('/index')

def index():
    get_db()
    flash('Login requested')
    user = { 'nickname': 'Miguel' } # выдуманный пользователь
    return render_template("index.html",
        title = 'Home',
        user = user)


@app.route('/api/login/<method>', methods = ['GET', 'POST'])
@as_json
def login(method):
    jsn = request.get_json()
    user = users.get(jsn['userInfo']['login'])
    if not user:
        return {}, 400
    access_token = create_access_token(identity={'login':user['login']})
    refresh = create_refresh_token({'login':user['login']})
    dc = decode_token(access_token)
    return {'userInfo': {'login':user['login']}, 'accessToken': access_token, 'refreshToken': refresh, 'expires': dc.expires}, 200


@app.route('/api/access_token/get', methods=['POST'])
@as_json
def update_access_token(method):
    jsn = request.get_json()
    tkn = check_token(jsn['refreshToken'])
    if not tkn:
        return {}, 401
    drt = decode_token(tkn['refresh_token'])
    if drt['expires'] < time.time():
        get_db().delete_access_tokens(drt['login'], tkn['refresh_token'])
        return {}, 401
    
    refresh = tkn['refresh_token']
    access = create_access_token(drt['login'])
    if drt['expires'] - time.time() < 3600*10:
        refresh = create_refresh_token(drt['login'])
        get_db().add_refresh_token(drt['login'], access, refresh)
    else:
        get_db().add_refresh_token(drt['login'], access)
    dc = decode_token(access)
    return {'accessToken': access, 'refreshToken': refresh, 'expires': dc.expires}, 200
        
        
    

def check_token(refresh):
    dc = decode_token(refresh)
    tokns = get_db().get_access_tokens(dc['login'])
    for k in tokns:
        if k['refresh_token'] == refresh:
            return k
    return None

@app.route('/api/get_accounts/', methods = ['GET'])
def get_accounts():
    u = request.args.get('user')
    a = get_db().get_accounts(u)
    for i in a:
        i.pop('password')
    return jsonify({'status': 'ok', 'data': a})


@app.route('/api/inventory/<method>', methods = ['POST'])
@jwt_required
@as_json
def get_inventory(method):
    if method == 'get':
        jsn = request.get_json()
        cuser = get_jwt_identity()
        inv = get_db().get_inventories(cuser['login'], jsn.get('accountInfos', []))
    return inv, 200


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = s_db.DataBase()
    return db

def get_db_direct():
    db = get_db()
    return db.db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    '''if db is not None:
        db.close()'''







if __name__ == "__main__":
    app.run(debug=True)
