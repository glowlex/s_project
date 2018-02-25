import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

import {doLogin} from '../../actions/appActions';
import store from '../../index';
import * as urls from '../../constants/urlConsts';

class LoginForm extends React.Component {
  static propTypes = {
    userLoggedOn: React.propTypes.boolean,
    userLogging: React.propTypes.boolean,
    userLoginError: React.propTypes.boolean
  }

  static defaultProps = {
    userLogging: false,
    userLoggedOn: false,
    userLoginError: false
  }
  constructor(props) {
    super(props);
  }

  onLoginClick = (e) => {
    e.preventDefault();
    let login = e.target.form.elements.namedItem("loginPage__login").value;
    let pass = e.target.form.elements.namedItem("loginPage__pass").value;
    if(!login || !pass) {
      return;
    }
    store.dispatch(doLogin(login, pass));
  }

  render(){
    return (
      <form className="d-flex justify-content-center">
        <div className="w-50">
          <div className="form-group">
            <label className="text-center w-100 h3" htmlFor="login">Log In</label>
            <div className="blank-2"/>
            <input id="loginPage__login" required className="form-control" type="text" placeholder="Login"/>
          </div>
          <div className="form-group">
            <input id="loginPage__pass" required className="form-control" type="password" placeholder="Password"/>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn_blue" onClick={this.onLoginClick} disabled={this.props.userLogging && "disabled"}>Sign In</button>
            <Link to={urls.URL_REG}><div className="h4 float-right">Registration</div></Link>
          </div>
        </div>
      </form>
    );
  }
}

const mapStateToProps = function (store) {
  return {
    userLogging: store.appState.userLogging,
    userLoggedOn: store.appState.userLoggedOn,
    userLoginError: store.appState.userLoginError
  };
};

export default withRouter(connect(mapStateToProps)(LoginForm));
