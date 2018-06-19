from flask import Flask
from flask import render_template, flash, redirect, g, jsonify, request
import s_db
from modules import *

app = Flask(__name__)
app.config.from_object('config')


@app.route('/')
@app.route('/index')
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
    u = get_db().get_accounts()
    print(u)
    for i in u:
        i.pop('password')
    return jsonify({'status': 'ok', 'data': u})

@app.route('/api/get_inventory/', methods = ['GET'])
def get_inventory():
    r = request.args.get('login', None, type=str)
    u = SteamClient(r, '', get_db()).get_inventory_from_db()
    return jsonify({'status': 'ok', 'data': u})


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
