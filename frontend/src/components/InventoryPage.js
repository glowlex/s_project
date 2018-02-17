'use strict';
import React from 'react';
import { connect } from 'react-redux';
import {keys} from 'lodash';

import store from '../index';
import InventoryPageNav from './views/InventoryPageNav';
import InventoryPageSearch from './views/InventoryPageSearch';
import InventoryPageItems from './views/InventoryPageItems';

class InventoryPage extends React.Component {
  static defaultProps = {
    inventories: {},
    inventoryParts: {},
    inventoryUsersArr: [],
    inventoryUsersObj: {},
  }

  static propTypes = {
    inventories: React.propTypes.object.isRequired,
    inventoryParts: React.propTypes.object.isRequired,
    inventoryUsersArr: React.propTypes.arrayOf(React.propTypes.string).isRequired,
    inventoryUsersObj: React.propTypes.arrayOf(React.propTypes.object).isRequired,
    inventoryPartNo: React.propTypes.string.isRequired
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    let nav, search, items;
      let user = this.props.inventoryParts[this.props.inventoryPartNo].user;
      let bags = this.props.inventories[user].bags;
      let bagSelected = this.props.inventoryParts[this.props.inventoryPartNo].bag;
      nav = (<InventoryPageNav
        partNo={this.props.inventoryPartNo}
        user={user}
        bagSelected={bagSelected}
        bags={keys(bags)}
         />);
       search = <InventoryPageSearch partNo={this.props.inventoryPartNo} user={user}/>;
       items = <InventoryPageItems items={bags[bagSelected].items} />;
    return(
      <div>
        {nav}
        {search}
        <div className="bag">
          <div className="bag__list row">
            <div className="table-scroll">
              <table >
                <thead className="table-scroll__head_static">
                  <tr>
                    <td scope="col-img">Icon </td>
                    <td scope="col-bs-amount">П/К</td>
                    <td scope="col-sold">Продаж</td>
                    <td scope="col-buy-prices">Покупка</td>
                    <td scope="col-sell-prices">Продажа</td>
                    <td scope="col-amount">Кол-во</td>
                    <td scope="col-trade-amount">Обмен</td>
                  </tr>
                </thead>
                <thead className="table-scroll__head_invisible">
                  <tr>
                    <td scope="col-img"/>
                    <td scope="col-bs-amount">6666</td>
                    <td scope="col-sold">7777</td>
                    <td scope="col-buy-prices">456.32</td>
                    <td scope="col-sell-prices">
                    <div>
                      555.77
                    </div>
                    <div>
                      675.46
                    </div>
                    <div>
                      8842.4
                    </div>
                  </td>
                  <td scope="col-amount">999</td>
                  <td scope="col-trade-amount">0000</td>
                </tr>
              </thead>
              {items}
            </table>
          </div>

        </div>
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-end row">
            <li className="page-item">
              <button type="button" className="btn page-link btn_blue btn-secondary btn-sm" aria-label="Previous">
                <span className="glyphicon glyphicon-menu-left" aria-hidden="true"/>
              </button>
            </li>
            <li className="page-item">
              <a className="page-link btn_blue btn-sm bag__pagination__page" href="#">1 из 3</a>
            </li>
            <li className="page-item">
              <button type="button" className="btn page-link btn_blue btn-secondary btn-sm" aria-label="Previous">
                <span className="glyphicon glyphicon-menu-right" aria-hidden="true"/>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
}

const mapStateToProps = function(store) {
  return {
    inventories: store.inventoryState.inventories,
    inventoryParts: store.inventoryState.inventoryParts,
    inventoryUsersArr: store.inventoryState.usersArr,
    inventoryUsersObj: store.inventoryState.inventoryUsersObj
  };
};
export default connect(mapStateToProps)(InventoryPage);
