/* eslint-disable import/no-named-as-default */
import React from 'react';
import PropTypes from 'prop-types';
import { Switch, NavLink, Route } from 'react-router-dom';
import HomePage from './HomePage';
import MainPage from './MainPage';

class App extends React.Component {
  render() {
    return (
          <Route exact path="/" component={MainPage} >
          <Route component={HomePage} />
          </Route>
    );
  }
}

App.propTypes = {
  children: PropTypes.element
};

export default App;
