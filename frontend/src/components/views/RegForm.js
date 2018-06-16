import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import store from '../../index';
import {doReg} from '../../actions/appActions';
import * as urls from '../../constants/urlConsts';


class RegForm extends React.Component {
  static propTypes = {
    userSigningUp: PropTypes.boolean,
    userSignUpError: PropTypes.boolean
  }

  static defaultProps = {
    userSigningUp: false,
    userSignUpError: false
  }

  onRegClick = (e) => {
    e.preventDefault();
    let login = e.target.form.elements.namedItem("regPage__login").value;
    let email = e.target.form.elements.namedItem("regPage__email").value;
    let pass1 = e.target.form.elements.namedItem("regPage__pass1").value;
    let pass2 = e.target.form.elements.namedItem("regPage__pass2").value;
    if(pass1 !== pass2) {
      return; //TODO:
    }
    if(!(login && email && pass1)) {
      return; //TODO: незаполнены поля
    }
    store.dispatch(doReg(login, email, pass1));
  }

  render() {
    return (
      <form className="d-flex justify-content-center">
        <div className="w-50">
          <div className="form-group">
            <label className="h3 w-100 text-center" htmlFor="registration">Registration</label>
            <div className="blank-2"></div>
            <input className="form-control" id="regPage__login" type="text" placeholder="Login" required/>
          </div>
          <div className="form-group">
            <input className="form-control" id="regPage__email" type="email" placeholder="Email" required/>
          </div>
          <div className="form-group">
            <input className="form-control" id="regPage__pass1" type="password" placeholder="Password" required />
          </div>
          <div className="form-group">
            <input className="form-control" id="regPage__pass2" type="password" placeholder="Repeat password" required/>
          </div>
          <div className="form-group">
            <button className="btn btn_blue" type="submit" onClick={this.onRegClick} disabled={this.props.userSigningUp && "disabled"} >Sing Up</button>
            <Link to={urls.URL_LOGIN}><div className="h4 float-right">Login</div></Link>
        </div>
        </div>
      </form>
    );
  }
}

const mapStateToProps = function(store) {
  return {
    userSigningUp: store.appState.userSigningUp,
    userSignUpError: store.appState.userLoginError
  };
};

export default withRouter(connect(mapStateToProps)(RegForm));
