import React from 'react';
import { Link } from 'react-router-dom';

// Since this component is simple and static, there's no parent container for it.
const InventoryPage = () => {
  return (
    <div>
      <h2 className="alt-header">About</h2>
      <p>
        This example app is part of the <a href="https://github.com/coryhouse/react-slingshot">React-Slingshot
        starter kit</a>.
      </p>
      <p>
        <Link to="/badlink">Click this bad link</Link> to see the 404 page.
      </p>
    </div>
  );
};

export default InventoryPage;