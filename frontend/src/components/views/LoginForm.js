import React from 'react';

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
    return (
      <div>
        <h2 className="alt-header">About</h2>
        <p>
          This example app is part of the <a href="https://github.com/coryhouse/react-slingshot">React-Slingshot
          starter kit</a>.
        </p>
        <p>
          Click this bad link to see the 404 page.
        </p>
      </div>
    );
  }
}
