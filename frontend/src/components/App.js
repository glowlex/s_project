/* eslint-disable import/no-named-as-default */
import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import InventoryContainer from './containers/InventoryContainer';
import MainPage from './MainPage';

const routes = [
  { path: '/inventory',
    component: InventoryContainer
  },
];

export const RouteWithSubRoutes = (route) => (
  <Route path={route.path} render={props => (
      // pass the sub-routes down to keep nesting
      <route.component {...props} routes={route.routes}/>
    )}/>
  );



  class App extends React.Component {
    render() {
      return (
        <MainPage routes={routes}>
        </MainPage>
      );
    }
  }


  App.propTypes = {
    children: PropTypes.element
  };

  export default App;
