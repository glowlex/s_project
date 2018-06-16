import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import store from '../index';

import InventoryPageControlsButtonList from './views/InventoryPageControlsButtonList';
import {makeTradeOffer,} from '../actions/tradeActions';

class InventoryPageControls extends React.Component {
  static defaultProps = {
    inventoryParts:{},
    inventoryUsersArr: []
  }

  static propTypes = {
    inventoryParts: PropTypes.object,
    inventoryUsersArr: PropTypes.arrayOf(PropTypes.string)
  }

  constructor(props) {
    super(props);
  }

   handleSellClick = (e) => {
    e.preventDefault();
    store.dispatch(makeTradeOffer());
  }

  render () {

    return (
      <div className="control-panel" >
        <div className="control-panel__user">
          <span className="glyphicon glyphicon-triangle-left"/>
              <InventoryPageControlsButtonList partNo={'L'} id={'InventoryPageControlsButtonLeft'} user={this.props.inventoryParts['L'].user} users={this.props.inventoryUsersArr}/>
        </div>
        <div className="blank-2"/>
        <div className="control-panel__user control-panel__user_right">
          <span className="glyphicon glyphicon-triangle-left"/>
            <InventoryPageControlsButtonList partNo={'R'} id={'InventoryPageControlsButtonRight'} user={this.props.inventoryParts['R'].user} users={this.props.inventoryUsersArr}/>
        </div>
        <div className="text-center">
          выроврять
        </div>
        <div className="control-panel__excange">
          <button type="button" className="btn page-link btn_blue " aria-label="Previous">
            <span className="glyphicon glyphicon-menu-left" aria-hidden="true"/>
          </button>
          <button type="button" className="btn page-link btn_blue " aria-label="Previous">
            <span className="" aria-hidden="true">&#2000;</span>
          </button>
          <button type="button" className="btn page-link btn_blue " aria-label="Previous">
            <span className="glyphicon glyphicon-menu-right" aria-hidden="true"/>
          </button>
        </div>
        <div className="blank-2"/>
        <div className="control-panel__check">
          <div className="form-check ">
            <label className="form-check-label">
              <input type="checkbox" className="form-check-input mr-2"/>
              ASAP
            </label>
            <div className="blank-1"/>
            <label className="form-check-label">
              <input type="checkbox" className="form-check-input mr-2"/>
              set
            </label>
          </div>
        </div>
        <div className="blank-2"/>
        <div className="control-panel__buttons">
          <button className={"btn btn_blue "+ (this.props.inventorySellRequest && "disabled")} type="button" id="dropdownMenuButton" aria-expanded="false" onClick={(e) => this.handleSellClick(e)}>
            {this.props.inventoryTradePerform ? "Selling..." : "Прод/обмен"}
          </button>
          <div className="blank-2"/>
          <button className="btn btn_blue " type="button" id="dropdownMenuButton" aria-expanded="false">
            Подтвердить
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = function(store) {
  return {
    inventoryParts: store.inventoryState.inventoryParts,
    inventoryUsersArr: store.inventoryState.inventoryUsersArr,
    inventoryTradePerform: store.inventoryState.inventoryTradePerform
  };
};

export default connect(mapStateToProps)(InventoryPageControls);
