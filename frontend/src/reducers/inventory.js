import * as types from '../actions/actionTypes';
const initialState = {
  inventories: {},
};

const inventoryReducer = function(state = initialState, action) {
  switch (action.type) {
    case types.ADD_INVENTORIES:
      return Object.assing({}, state, {inventories: action.inventories});
  }
  return state;
};

export default inventoryReducer;
