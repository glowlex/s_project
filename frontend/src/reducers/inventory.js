import * as types from '../actions/actionTypes';
import objectAssign from 'object-assign';

const initialState = {
  inventories: {},
  inventoryLoading: false,
  inventoryLoaded: false,
  inventoryLeftSideUser: "",
  inventoryLeftSideBag: "",
  inventoryRightSideUser: "",
  inventoryRightSideBag: "",
};

const inventoryReducer = function(state = initialState, action) {
  switch (action.type) {
    case types.REQUEST_INVENTORY:
      return objectAssign({}, state, {inventoryLoading: action.inventoryLoading});
    case types.RECEIVE_INVENTORY:
      return objectAssign({}, state, {
        inventories: action.inventories,
        inventoryLoaded: action.inventoryLoaded
      });
    case types.CHANGE_INVENTORY_BAG_L:
      return objectAssign({}, state, {inventoryLeftSideBag: action.id});
    case types.CHANGE_INVENTORY_BAG_R:
      return objectAssign({}, state, {inventoryRightSideBag: action.id});
    case types.CHANGE_INVENTORY_USER_L:
      return objectAssign({}, state, {inventoryLeftSideUser: action.user});
    case types.CHANGE_INVENTORY_USER_R:
      return objectAssign({}, state, {inventoryRightSideUser: action.user});
    default:
      return state;
  }
};

export default inventoryReducer;
