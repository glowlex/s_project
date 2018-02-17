import * as types from '../actions/actionTypes';
import {assign} from 'lodash';
import {set} from 'lodash/fp';

const initialState = {
  inventories: {},
  inventoryLoading: false,
  inventoryLoaded: false,
  inventoryParts: {},
  inventoryUsersArr: [],
  inventoryUsersObj: {}
};
/*
const inventoryPartNo = {
    user: "",
    bag: "",
    itemsSelected: {}
};*/

const inventoryReducer = function(state = initialState, action) {
  let t;
  switch (action.type) {
    case types.INVENTORY_REQUEST:
    return assign({}, state, { inventoryLoading: action.inventoryLoading});
    case types.INVENTORY_RECEIVE:
    return assign({}, state, {
      inventories: action.inventories,
      inventoryLoaded: action.inventoryLoaded
    });
    case types.INVENTORY_BAG_UPDATE:
    //у lodash/fp аргументы идут иначе
    t = set(['inventoryParts', action.no, 'bag'], action.bagId, assign({}, state));
    return t;
    case types.INVENTORY_USER_UPDATE:
    return set(['inventoryParts', action.no], action.user, assign({}, state));
    case types.INVENTORY_USERS_ARR_UPDATE:
    return assign({}, state, { inventoryUsersArr: action.users});
    case types.INVENTORY_USERS_OBJ_UPDATE:
    return assign({}, state, { inventoryUsersObj: action.users});
    case types.INVENTORY_ITEM_SELECT_ADD:
    return set(['inventoryParts', action.no, action.item.assetid], action.item, assign({}, state));
    default:
    return state;
  }
};

export default inventoryReducer;
