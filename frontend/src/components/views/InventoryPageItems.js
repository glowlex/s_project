import React from 'react';
import {keys, get} from 'lodash';

import store from '../../index';
import {addInventoryItemSelect, deleteInventoryItemSelect} from '../../actions/inventoryActions';
import {convertRem} from '../../tools';

class InventoryPageItems extends React.Component {

static propTypes = {
  items: React.propTypes.arrayOf(React.propTypes.object).isRequired,
  partNo: React.propTypes.string.isRequired,
  itemsSelected: React.propTypes.object,
  id: React.propTypes.string,
  pageSelected: React.propTypes.number
};

static defaultProps = {
  itemsSelected: {},
  items: {},
  pageSelected: 0
};

constructor(props) {
  super(props);
}

componentDidUpdate() {
  let elem = document.getElementById(this.props.id);
  elem.scrollTo(0, this.props.pageSelected*convertRem(4));
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
  return (
    <tbody>
      {keys(this.props.items).map((k, i) => {
        let item = this.props.items[k];
        return (
          <tr key={item.classid} tabIndex={i}>
          <th scope="col-img">
            <img src=".\96fx96f.png"  alt=""/>
           </th>
            <th scope="col-bs-amount" >
              <div>
                6756
              </div>
              <div>
                34
              </div>
            </th>
            <th scope="col-sold" >
              <div >
                63
              </div>
              <div >
                281
              </div>
            </th>
            <th scope="col-buy-prices" >
              <div >
                675.46
              </div>
              <div >
                542.21
              </div>
            </th>
            <th scope="col-sell-prices" >
              <div >
                555.77
              </div>
              <div >
                67546
              </div>
              <div >
                675.46
              </div>
            </th>
            <th scope="col-amount">
              <div >
                {item.amount}
              </div>
              <div >
                198
              </div>
            </th>
            <th scope="col-trade-amount" >
              <div className="table-scroll__trade">
                <div className="table-scroll__trade__counter">
                  {get(this.props, ['itemsSelected', item.classid, 'amountSelect'], 0)}
                </div>
                <div className="table-scroll__trade__arrows">
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
