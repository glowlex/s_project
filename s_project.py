from flask import Flask
from flask import render_template, flash, redirect, g, jsonify, request
from flask_httpauth import HTTPBasicAuth
from flask_cors import CORS, cross_origin
from flask_json import FlaskJSON, JsonError, json_response, as_json
import s_db
from modules import *

app = Flask(__name__)
app.config.from_object('config')
auth = HTTPBasicAuth()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
FlaskJSON(app)

users = {
    lp.uname: lp.upass,
}

@app.before_request
def testapp():
    g.user = {"login": lp.uname}
 
@auth.verify_password
def ver_pw(username, password):
    if username in users and users[username] == password:
        g.user = {"login": username}
        return True
    return False

@app.route('/')
@app.route('/index')
@auth.login_required
def index():
    get_db()
    flash('Login requested')
    user = { 'nickname': 'Miguel' } # выдуманный пользователь
    return render_template("index.html",
        title = 'Home',
        user = user)

@app.route('/login', methods = ['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        flash('Login requested for OpenID="' + form.openid.data + '", remember_me=' + str(form.remember_me.data))
        return redirect('/index')
    return render_template('login.html',
        title = 'Sign In',
        form = form)

@app.route('/api/get_accounts/', methods = ['GET'])
def get_accounts():
    u = request.args.get('user')
    a = get_db().get_accounts(u)
    for i in a:
        i.pop('password')
    return jsonify({'status': 'ok', 'data': a})


@app.route('/api/inventory/<method>', methods = ['POST'])
#@auth.login_required
@as_json
def get_inventory(method):
    if method == 'get':
        jsn = request.get_json()
        inv = get_db().get_inventories(g.user['login'], jsn.get('accountInfos', []))
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
