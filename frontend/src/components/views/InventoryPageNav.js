'use strict';
import React from 'react';
import {indexOf} from 'lodash';

import store from '../../index';
import {updateInventoryBagLeft, updateInventoryBagRight} from '../../actions/inventoryActions';

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
    bags: React.propTypes.arrayOf(React.propTypes.string).isRequired,
    pageSide: React.propTypes.string.isRequired
  }

  handleBagNext = (e, v=1) => {
    this._handleBag(e, v);
  }

  handleBagPrev = (e, v=-1) => {
    this._handleBag(e, v);
  }

  _handleBag = (e, v) => {
    debugger;
    e.preventDefault();
    let i = indexOf(this.props.bags, this.props.bagSelected)+v;
    //время ебанутых конструкций
    i += (i >= this.props.bags.length || i <= -1) ? -v : 0;
    if (this.props.pageSide==="L") {
      store.dispatch(updateInventoryBagLeft(this.props.bags[i]));
    } else {
      store.dispatch(updateInventoryBagRight(this.props.bags[i]));
    }
  }


  constructor(props){
    super(props);
  }

  componentDidMount() {
  }
  render() {
    return (
      <div>
        <ul className={"nav bag-navigation row px-1 "+ (this.props.pageSide==='R' && "bag-navigation_right")}>
          <li className="nav-item col-lg-6 col-md-4"/>
          <li className="nav-item ">
            <button type="button" className="btn btn_blue btn-secondary btn-sm" onClick={this.handleBagPrev}>
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
            <button type="button" className="btn btn_blue btn-secondary btn-sm" onClick={this.handleBagNext}>
              <span className="glyphicon glyphicon-menu-right" aria-hidden="true"/>
            </button>
          </li>
        </ul>
      </div>
    );
  }
}

export default InventoryPageNav;
