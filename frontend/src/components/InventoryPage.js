'use strict';
import React from 'react';
import { connect } from 'react-redux';

import store from '../index';
import InventoryPageNav from './views/InventoryPageNav';

class InventoryPage extends React.Component {
  static defaultProps = {
    inventories: {},
    inventoryLeftSideUser: "",
    inventoryLeftSideBag: "",
    inventoryRightSideUser: "",
    inventoryRightSideBag: "",
    inventoryPageSide: "L"
  }

  static propTypes = {
    inventories: React.propTypes.object.isRequired,
    inventoryLeftSideUser: React.propTypes.string,
    inventoryLeftSideBag: React.propTypes.string,
    inventoryRightSideUser: React.propTypes.string,
    inventoryRightSideBag: React.propTypes.string,
    inventoryPageSide: React.propTypes.string.isRequired
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return(
      <div>
        if (this.props.inventoryPageSide === "L") {
          <InventoryPageNav bagId={this.props.inventoryLeftSideBag} user={this.props.inventoryLeftSideUser} />
        } else {
          <InventoryPageNav bag={this.props.inventoryRightSideBag} user={this.props.inventoryRightSideBag} />
        }
        <div className="w-100">
          <ul className="nav bag-search row px-1 mt-1">
            <li className="nav-item">
              <label className="h3" htmlFor="money">567 ₽</label>
            </li>
            <li className="nav-item w-50">
              <div className="input-group-sm w-100">
                <input type="text" className="form-control search" placeholder="search"/>
              </div>
            </li>
          </ul>
        </div>
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
                    <td scope="col-img"></td>
                    <td scope="col-bs-amount">6666</td>
                    <td scope="col-sold">7777</td>
                    <td scope="col-buy-prices">456.32</td>
                    <td scope="col-sell-prices"><div>
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
              <tbody>

              </tbody>
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
    inventoryLeftSideUser: store.inventoryState.inventoryLeftSideUser,
    inventoryLeftSideBag: store.inventoryState.inventoryLeftSideBag,
    inventoryRightSideUser: store.inventoryState.inventoryRightSideUser,
    inventoryRightSideBag: store.inventoryState.inventoryRightSideBag
  };
};
export default connect(mapStateToProps)(InventoryPage);
