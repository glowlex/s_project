import React from 'react';
import {keys} from 'lodash';

InventoryPageItems.propTypes = {
  items: React.propTypes.arrayOf(React.propTypes.object).isRequired
};

function InventoryPageItems (props) {
  return (
    <tbody>
      {keys(props.items).map((k, i) => {
        let v = props.items[k];
        return (
          <tr key={v.assetid} tabIndex={i}>
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
                {v.amount}
              </div>
              <div >
                198
              </div>
            </th>
            <th scope="col-trade-amount" >
              <div className="table-scroll__trade">
                <div className="table-scroll__trade__counter">
                  12
                </div>
                <div className="table-scroll__trade__arrows">
                  <div className="btn_blue">
                    <span className="glyphicon glyphicon-chevron-up"/>
                  </div>

                  <div className="btn_blue">
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

export default InventoryPageItems;
