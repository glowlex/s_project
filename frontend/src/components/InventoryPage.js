'use strict';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {keys} from 'lodash';

import store from '../index';
import InventoryPageNav from './views/InventoryPageNav';
import InventoryPageSearch from './views/InventoryPageSearch';
import InventoryPageItems from './views/InventoryPageItems';
import InventoryPagePagination from './views/InventoryPagePagination';

class InventoryPage extends React.Component {
  static defaultProps = {

  }

  static propTypes = {
    inventories: PropTypes.object.isRequired,
    inventoryDescriptions: PropTypes.object,
    inventoryParts: PropTypes.object.isRequired,
    inventoryUsersArr: PropTypes.arrayOf(PropTypes.string).isRequired,
    inventoryUsersObj: PropTypes.object.isRequired,
    inventoryPartNo: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    let nav, search, items, pagination;
      let user = this.props.inventoryParts[this.props.inventoryPartNo].user;
      let bags = this.props.inventories[user].bags;
      let bagSelected = this.props.inventoryParts[this.props.inventoryPartNo].bag;
      let part = this.props.inventoryPartNo;
      let id = "InventoryPageItems_" + this.props.inventoryPartNo;
      let page = this.props.inventoryParts[this.props.inventoryPartNo].page;
      nav = (<InventoryPageNav
        partNo={part}
        user={user}
        bagSelected={bagSelected}
        bags={keys(bags)}
         />);
       search = <InventoryPageSearch partNo={part} user={user}/>;
       items = <InventoryPageItems descriptions={this.props.inventoryDescriptions} id={id} pageSelected={page} items={bags[bagSelected].items} itemsSelected={this.props.inventoryParts[part].itemsSelected} partNo={part} />;
       pagination = <InventoryPagePagination pageSelected={page} partNo={part} />;
  return(
      <div>
        {nav}
        {search}
        <div className="bag">
          <div className="bag__list row">
            <div className="table-scroll" id={id}>
              <table >
                <thead className="table-scroll__head_static" style={{borderBottom:"0px"}}>
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
        {pagination}
      </div>
    </div>
  );
}
}

const mapStateToProps = function(store) {
  return {
    inventories: store.inventoryState.inventories,
    inventoryParts: store.inventoryState.inventoryParts,
    inventoryUsersArr: store.inventoryState.inventoryUsersArr,
    inventoryUsersObj: store.inventoryState.inventoryUsersObj,
    inventoryDescriptions : store.inventoryState.inventoryDescriptions
  };
};
export default connect(mapStateToProps)(InventoryPage);
