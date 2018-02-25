'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';

import InventoryContainer from './containers/InventoryContainer';
import MainPage from './MainPage';
import LoginForm from './views/LoginForm';
import RegForm from './views/RegForm';
import * as urls from '../constants/urlConsts';

const routes = {
  logOff: [{
    path: urls.URL_LOGIN,
    component: LoginForm
  },
  {
    path: urls.URL_REG,
    component: RegForm
  }
],
logOn: [{
  path: urls.URL_INVENTORY,
  component: InventoryContainer
}],
};

export const RouteWithSubRoutes = (route) => (
  <Route exact path={route.path} render={props => (
      // pass the sub-routes down to keep nesting
      <route.component {...props} routes={route.routes}/>
    )}/>
  );



  class App extends React.Component {
    render() {
      return (
        <MainPage routes={routes.logOn} routesLogOff={routes.logOff}>
          <Redirect from="*" to={urls.URL_INVENTORY} />
        </MainPage>
      );
    }
  }


  App.propTypes = {
    children: PropTypes.element
  };

  export default App;
