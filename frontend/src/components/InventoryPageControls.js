import React from 'react';

export default class InventoryPageControls extends React.Component {
  constructor(props) {
    super(props);
  }
  render () {
    return (
      <div className="control-panel" >
        <div className="control-panel__user">
          <span className="glyphicon glyphicon-triangle-left"/>
          <div className="dropdown  control-panel__user__button">
            <button className="btn btn_blue  dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              user left
            </button>
            <div className="dropdown-menu dropdown-menu control-panel__user__button__scroll" role="menu" aria-labelledby="dropdownMenuButton">
              <a className="dropdown-item dropdown-item_thin" href="#">Action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Another action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Something else here</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Another action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Something else here</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Another action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Something else here</a>
            </div>
          </div>
        </div>
        <div className="blank-2"/>
        <div className="control-panel__user control-panel__user_right">
          <span className="glyphicon glyphicon-triangle-left"/>
          <div className="dropdown  control-panel__user__button ">
            <button className="btn btn_blue  dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              user right
            </button>
            <div className="dropdown-menu dropdown-menu control-panel__user__button__scroll" role="menu" aria-labelledby="dropdownMenuButton">
              <a className="dropdown-item dropdown-item_thin" href="#">Action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Another action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Something else here</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Another action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Something else here</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Another action</a>
              <a className="dropdown-item dropdown-item_thin" href="#">Something else here</a>
            </div>
          </div>
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
            Ппод/обмен
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
