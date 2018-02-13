import * as types from '../actions/actionTypes';
import objectAssign from 'object-assign';
import deepAssign from 'assign-deep';

const initialState = {
  inventories: {},
  inventoryLoading: false,
  inventoryLoaded: false,
  inventoryLeftSide: {
    user: "",
    bag: ""
  },
  inventoryRightSide: {
    user: "",
    bag: ""
  },
  inventoryUsersArr: [],
  inventoryUsersObj: {}
};

const inventoryReducer = function(state = initialState, action) {
  switch (action.type) {
    case types.REQUEST_INVENTORY:
      return objectAssign({}, state, { inventoryLoading: action.inventoryLoading});
    case types.RECEIVE_INVENTORY:
      return objectAssign({}, state, {
        inventories: action.inventories,
        inventoryLoaded: action.inventoryLoaded
      });
    case types.UPDATE_INVENTORY_BAG_L:
      return deepAssign({}, state, { inventoryLeftSide: { bag: action.id}});
    case types.UPDATE_INVENTORY_BAG_R:
      return deepAssign({}, state, { inventoryRightSide: { bag: action.id}});
    case types.UPDATE_INVENTORY_USER_L:
      return deepAssign({}, state, { inventoryLeftSide: action.user});
    case types.UPDATE_INVENTORY_USER_R:
      return deepAssign({}, state, { inventoryRightSide: action.user});
    case types.UPDATE_INVENTORY_USERS_ARR:
      return objectAssign({}, state, { inventoryUsersArr: action.users});
    case types.UPDATE_INVENTORY_USERS_OBJ:
      return objectAssign({}, state, { inventoryUsersObj: action.users});
    default:
      return state;
  }
};

export default inventoryReducer;
