import React from 'react';
import {connect} from 'react-redux';

import InventoryPageControlsButtonList from './views/InventoryPageControlsButtonList';

class InventoryPageControls extends React.Component {
  static defaultProps = {
    inventoryLeftSide: {
      user: '!undef',
    },
    inventoryRightSide: {
      user: '!undef',
    },
    inventoryUsersArr: [],
    inventoryUsersObj: {}
  }

  static propTypes = {
    inventoryLeftSide: React.propTypes.object,
    inventoryRightSide: React.propTypes.object,
    inventoryUsersArr: React.propTypes.arrayOf(React.propTypes.string),
    inventoryUsersObj: React.propTypes.arrayOf(React.propTypes.object)
  }

  constructor(props) {
    super(props);
  }

  render () {

    return (
      <div className="control-panel" >
        <div className="control-panel__user">
          <span className="glyphicon glyphicon-triangle-left"/>
              <InventoryPageControlsButtonList side={"L"} id={'InventoryPageControlsButtonLeft'} user={this.props.inventoryLeftSide.user} users={this.props.inventoryUsersArr}/>
        </div>
        <div className="blank-2"/>
        <div className="control-panel__user control-panel__user_right">
          <span className="glyphicon glyphicon-triangle-left"/>
            <InventoryPageControlsButtonList side={"R"} id={'InventoryPageControlsButtonRight'} user={this.props.inventoryRightSide.user} users={this.props.inventoryUsersArr}/>
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
          <button className="btn btn_blue " type="button" id="dropdownMenuButton" aria-expanded="false">
            Прод/обмен
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
    inventoryLeftSide: store.inventoryState.inventoryLeftSide,
    inventoryRightSide: store.inventoryState.inventoryRightSide,
    inventoryUsersArr: store.inventoryState.inventoryUsersArr
  };
};

export default connect(mapStateToProps)(InventoryPageControls);
