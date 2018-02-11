import * as types from '../actions/actionTypes';
import objectAssign from 'object-assign';

const initialState = {
  inventories: {},
  inventoryLoading: false,

};

const inventoryReducer = function(state = initialState, action) {
  switch (action.type) {
    case types.REQUEST_INVENTORY:
      return objectAssign({}, state, {inventoryLoading: action.inventoryLoading});
    case types.RECEIVE_INVENTORY:
      return objectAssign({}, state, {inventories: action.inventories});
    default:
      return state;
  }
};

export default inventoryReducer;
