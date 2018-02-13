import React from 'react';

import store from '../../index';
import {updateInventoryUserLeft, updateInventoryUserRight} from '../../actions/inventoryActions';

button.propTypes = {
  id: React.propTypes.string,
  usersArr: React.propTypes.array.isRequired,
  user: React.propTypes.string.isRequired,
  side: React.propTypes.string.isRequired
};

button.defaultProps = {
  id:"",
  side: "L"
};

function handleButtonClick(e, user, side) {
  if(side === "L") {
    store.dispatch(updateInventoryUserLeft(user));
  } else {
    store.dispatch(updateInventoryUserRight(user));
  }
}

export default function button(props) {
  return (
    <div className="dropdown  control-panel__user__button">
      <button className="btn btn_blue  dropdown-toggle" type="button" id={props.id} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span>{props.user}</span>
      </button>
      <div className="dropdown-menu dropdown-menu control-panel__user__button__scroll" role="menu" aria-labelledby="dropdownMenuButton">
        {props.users.map( user => {
          return (<button key={user} data-user={user} data-side={props.side} className="dropdown-item dropdown-item_thin" onClick={(e) => handleButtonClick(e, user, props.side)} >{user}</button>);
        })}
      </div>
    </div>
  );
}
