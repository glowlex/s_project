'use strict';
import React from 'react';

class InventoryPageNav extends React.Component {
  static defaultProps = {
    user: "",
    bagSelected: "",
    bags: [],
    pageSide: "L"
  }

  static propTypes = {
    user: React.propTypes.string.isRequired,
    bagSelected: React.propTypes.string.isRequired,
    bags: React.propTypes.array.isRequired,
    pageSide: React.propTypes.string.isRequired
  }

  constructor(props){
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
    <div>
      <ul className={"nav bag-navigation row px-1 "+ (this.props.pageSide==='L' ? "" : "bag-navigation_right")}>
        <li className="nav-item col-lg-6 col-md-4"/>
        <li className="nav-item ">
          <button type="button" className="btn btn_blue btn-secondary btn-sm">
            <span className="glyphicon glyphicon-menu-left" aria-hidden="true"/>
          </button>
        </li>
        <li className="nav-item mr-auto">
          <label htmlFor="bag-name">
            <img className="mx-2" width="32" src="./styles/img.svg" alt=""/>
            {this.props.bagSelected}
          </label>
        </li>
        <li className="nav-item">
          <button type="button" className="btn btn_blue btn-secondary btn-sm">
            <span className="glyphicon glyphicon-menu-right" aria-hidden="true"/>
          </button>
        </li>
      </ul>
    </div>
    );
  }
}

export default InventoryPageNav;
