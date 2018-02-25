import React from 'react';

import store from '../../index';
import {updateInventoryUser} from '../../actions/inventoryActions';

button.propTypes = {
  id: React.propTypes.string,
  users: React.propTypes.array.isRequired,
  user: React.propTypes.string.isRequired,
  partNo: React.propTypes.string.isRequired
};

button.defaultProps = {
  id:"",
};

function handleButtonClick(e, user, partNo) {
  store.dispatch(updateInventoryUser(user, partNo));
}

export default function button(props) {
  return (
    <div className="dropdown  control-panel__user__button">
      <button className="btn btn_blue  dropdown-toggle" type="button" id={props.id} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <span>{props.user}</span>
      </button>
      <div className="dropdown-menu dropdown-menu control-panel__user__button__scroll" role="menu" aria-labelledby="dropdownMenuButton">
        {props.users.map( user => {
          return (<button key={user} data-user={user} data-partno={props.partNo} className="dropdown-item dropdown-item_thin" onClick={(e) => handleButtonClick(e, user, props.partNo)} >{user}</button>);
        })}
      </div>
    </div>
  );
}
