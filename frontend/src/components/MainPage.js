import React, {Component} from 'react';
import { Link, Switch} from 'react-router-dom';
import {RouteWithSubRoutes} from './App';


class MainPage extends Component {
  static propTypes = {
   routes: React.PropTypes.array,
 }
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <nav className="navbar">
          <Link className="navbar_brand navbar__link" to="/">
            <img src="./styles/img.svg" width="30" height="30" className="d-inline-block align-top " alt=""/>
            <span className="pl-1">S_project</span>
          </Link>
          <button type="button" className="btn btn_blue btn-secondary btn-sm" styles="width:6rem; font-size: 1.1rem">EXIT</button>
        </nav>
        <div className="mt-4"/>
        <div className="container">
          <nav>
            <div className="nav nav-tabs nav-tabs_round nav-justified" id="nav-tab" role="tablist">
              <Link className="nav-item nav-link nav-link_dark" id="nav-transactions-tab" data-toggle="tab" to="/transactions" role="tab" aria-controls="nav-transactions" aria-selected="false">Операции</Link>
              <Link className="nav-link_dark nav-item nav-link active" id="nav-inventory-tab" data-toggle="tab" to="/inventory" role="tab" aria-controls="nav-inventory" aria-selected="true">Инвентарь</Link>
              <Link className="nav-item nav-link nav-link_dark" id="nav-accounts-tab" data-toggle="tab" to="/accounts" role="tab" aria-controls="nav-accounts" aria-selected="false">Аккаунты</Link>
              <Link className="nav-item nav-link nav-link_dark" id="nav-options-tab" data-toggle="tab" to="/options" role="tab" aria-controls="nav-options" aria-selected="false">Настройки</Link>
            </div>
          </nav>
          <div className="blank-3"/>
          <div className="tab-content" id="nav-tabContent">
            <Switch>
              {this.props.routes.map((route, i) => (
                <RouteWithSubRoutes key={i} {...route}/>
              ))}
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default MainPage;
