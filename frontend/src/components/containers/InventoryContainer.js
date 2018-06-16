'use strict';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import InventoryPage from '../InventoryPage';
import InventoryPageControls from '../InventoryPageControls';
import store from '../../index';
import {getInventory} from '../../actions/inventoryActions';

class InventoryContainer extends React.Component {
  static defaultProps = {
    inventoryLoading: false,
    inventoryLoaded: false
  }

  static propTypes = {
    inventoryLoading: PropTypes.bool,
    inventoryLoaded: PropTypes.bool
  }

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if(!this.props.inventoryLoaded) {
      store.dispatch(getInventory(['L', 'R']));
    }
  }

  render() {
    if(!this.props.inventoryLoaded || this.props.inventoryLoading) {
      return "";
    }
    return(
      <div className="tab-pane fade  show active" id="nav-inventory" role="tabpanel" aria-labelledby="nav-inventory-tab">
        <div className="row justify-content-between">
          <div className="col-5">
            <InventoryPage inventoryPartNo={"L"}/>
          </div>
          <div className="col-2 p-0 m-0">
            <InventoryPageControls />
          </div>
          <div className="col-5">
            <InventoryPage inventoryPartNo={"R"}/>
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
