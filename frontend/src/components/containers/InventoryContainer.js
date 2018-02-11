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
    inventoryLoading: false
  }

  static propTypes = {
    inventories: React.propTypes.object,
    inventoryLoading: React.propTypes.boolean
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if(isEmpty(this.props.inventories)) {
    store.dispatch(getInventory());
  }
  }

  render() {
    return(
      <div className="tab-pane fade  show active" id="nav-inventory" role="tabpanel" aria-labelledby="nav-inventory-tab">
        <div className="row justify-content-between">
          <div className="col-5">
                <InventoryPage inventories={this.props.inventories} side={"left"}/>
          </div>
          <div className="col-2 p-0 m-0">
            <InventoryPageControls />
          </div>
          <div className="col-5">
                <InventoryPage inventories={this.props.inventories} side={"right"}/>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = function(store) {
  return {
    inventories: store.inventoryState.inventories,
    inventoryLoading: store.inventoryState.inventoryLoading
  };
}
export default connect(mapStateToProps)(InventoryContainer);
