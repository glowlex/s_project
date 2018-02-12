'use strict';
import React from 'react';
import { connect } from 'react-redux';
import {isEmpty} from 'lodash';

import InventoryPage from '../InventoryPage';
import InventoryPageControls from '../InventoryPageControls';
import store from '../../index';
import {getInventory} from '../../actions/inventoryActions';

class InventoryContainer extends React.Component {
  static defaultProps = {
    inventories: {},
    inventoryLoading: false,
    inventoryLoaded: false
  }

  static propTypes = {
    inventories: React.propTypes.object,
    inventoryLoading: React.propTypes.boolean,
    inventoryLoaded: React.propTypes.boolean
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if(!this.props.inventoryLoaded) {
    store.dispatch(getInventory());
  }
  }

  render() {
    if(!this.props.inventoryLoaded) {
      return "";
    }
    return(
      <div className="tab-pane fade  show active" id="nav-inventory" role="tabpanel" aria-labelledby="nav-inventory-tab">
        <div className="row justify-content-between">
          <div className="col-5">
                <InventoryPage inventoryPageSide={"L"}/>
          </div>
          <div className="col-2 p-0 m-0">
            <InventoryPageControls />
          </div>
          <div className="col-5">
                <InventoryPage inventoryPageSide={"R"}/>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = function(store) {
  return {
    inventoryLoaded: store.inventoryState.inventoryLoaded,
    inventoryLoading: store.inventoryState.inventoryLoading
  };
};

export default connect(mapStateToProps)(InventoryContainer);
