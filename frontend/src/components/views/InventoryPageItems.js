import React from 'react';
import {keys, get} from 'lodash';
import PropTypes from 'prop-types';
import store from '../../index';
import {addInventoryItemSelect, deleteInventoryItemSelect} from '../../actions/inventoryActions';
import {convertRem} from 'myTools';

class InventoryPageItems extends React.Component {

  static propTypes = {
    items: PropTypes.object.isRequired,
    partNo: PropTypes.string.isRequired,
    itemsSelected: PropTypes.object,
    id: PropTypes.string,
    pageSelected: PropTypes.number,
    descriptions: PropTypes.object
  };

  static defaultProps = {
    descriptions: {},
    itemsSelected: {},
    items: {},
    pageSelected: 0
  };

  constructor(props) {
    super(props);
    this.lastPageSelected = 0;
  }

  componentDidUpdate() {
    if(this.props.pageSelected !== this.lastPageSelected) {
      let elem = document.getElementById(this.props.id);
      elem.scrollTo(0, this.props.pageSelected*convertRem(4));
      this.lastPageSelected = this.props.pageSelected;
    }
  }

  changeAmountUp = (e, item, no) => {
    e.preventDefault();
    store.dispatch(addInventoryItemSelect(item, no));
  }

  changeAmountDown = (e, item, no) => {
    e.preventDefault();
    store.dispatch(deleteInventoryItemSelect(item, no));
  }



  render () {
    let nm = this.props.items
    return (
      <tbody>
        {keys(this.props.items).map((k, i) => {
          let item = this.props.items[k];
          let desc = this.props.descriptions[item.classId];
          return (
            <tr key={item.classId} tabIndex={i} className={""+(item.frozen && "table-scroll_item__frozen")}>
              <th scope="col-img">
                <img src={desc.iconUrl}  alt=""/>
              </th>
              <th scope="col-bs-amount" >
                <div>
                  {desc.sellOffers}
                </div>
                <div>
                  {desc.buyOffers}
                </div>
              </th>
              <th scope="col-sold" >
                <div >
                  {desc.sellPerDay}
                </div>
                <div >
                  {desc.sellDayMax}
                </div>
              </th>
              <th scope="col-buy-prices" >
                <div >
                  {desc.buyPriceMax}
                </div>
                <div >
                  {desc.buyPriceAvg}
                </div>
              </th>
              <th scope="col-sell-prices" >
                <div >
                  {desc.sellOffersPrice}
                </div>
                <div >
                  {desc.sellOffersPriceMin}
                </div>
                <div >
                  {desc.sellOffersPriceAvg}
                </div>
              </th>
              <th scope="col-amount">
                <div >
                  {item.amountAvailable}
                </div>
                <div >
                  {item.amount}
                </div>
                <div >
                  {desc.amount}
                </div>
              </th>
              <th scope="col-trade-amount" >
                <div className="table-scroll__trade">
                  <div className="table-scroll__trade__counter">
                    {get(this.props, ['itemsSelected', item.classId, 'amountSelect'], 0)}
                  </div>
                  <div className={"table-scroll__trade__arrows " + (item.frozen && "disable-events")}>
                    <div className="btn_blue" onClick={(e) => this.changeAmountUp(e, item, this.props.partNo)}>
                      <span className="glyphicon glyphicon-chevron-up"/>
                    </div>

                    <div className="btn_blue" onClick={e => this.changeAmountDown(e, item, this.props.partNo)}>
                      <span className="glyphicon glyphicon-chevron-down"/>
                    </div>
                  </div>

                </div>
              </th>
            </tr>
          );})}
        </tbody>
      );
    }

  }
  export default InventoryPageItems;
