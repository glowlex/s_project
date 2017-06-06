from flask import Flask
from modules import *
from flask import render_template, flash, redirect, g

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


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()







if __name__ == "__main__":
    app.run(debug=True)
