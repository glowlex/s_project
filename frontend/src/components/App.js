'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';
import InventoryContainer from './containers/InventoryContainer';
import MainPage from './MainPage';
import LoginForm from './views/LoginForm';

const routes = {
  logOff: [{
    path: '/login',
    component: LoginForm
  }],
  logOn: [{
    path: '/inventory',
    component: InventoryContainer
  }],
};

export const RouteWithSubRoutes = (route) => (
  <Route path={route.path} render={props => (
      // pass the sub-routes down to keep nesting
      <route.component {...props} routes={route.routes}/>
    )}/>
  );



  class App extends React.Component {
    render() {
      return (
        <MainPage routes={routes.logOn} routesLogOff={routes.logOff}>
        <Redirect from="*" to="/" />
        </MainPage>
      );
    }
  }


  App.propTypes = {
    children: PropTypes.element
  };

  export default App;
