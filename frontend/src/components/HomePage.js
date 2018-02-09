import React from 'react';
import {Route } from 'react-router-dom';
import AboutPage from './AboutPage';

class HomePage extends React.Component {
  render() {
  return (
    <div>
    <h2 className="alt-header">About</h2>
      <Route path="/m/a" component={AboutPage} />
    </div>
  );
}
}

export default HomePage;
