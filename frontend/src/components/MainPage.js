import React from 'react';
import { Link } from 'react-router-dom';


const MainPage = () => {
  return (
    <div>
    <nav className="navbar">
      <Link className="navbar_brand" to="/">
        <img src="./styles/img.svg" width="30" height="30" className="d-inline-block align-top " alt=""/>
        <span className="pl-1">S_project</span>
      </Link>
      <button type="button" className="btn btn_blue btn-secondary btn-sm" styles="width:6rem; font-size: 1.1rem">EXIT</button>
    </nav>
    <div className="mt-4">
    </div>
    <div className="container">

    </div>
    </div>
  );
};

export default MainPage;
