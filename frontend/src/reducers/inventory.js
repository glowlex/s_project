'use strict';
import * as types from '../actions/actionTypes';
import {assign, get, keys} from 'lodash';
import {set, unset} from 'lodash/fp';

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
    itemsSelected: {},
    page: 0
};*/

const inventoryReducer = function(state = initialState, action) {
  let t, amount;
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
    t = set(['inventoryParts', action.no, 'bag'], action.bagId, state);
    return t;

    case types.INVENTORY_USER_UPDATE:
    return set(['inventoryParts', action.no], action.user, state);

    case types.INVENTORY_USERS_ARR_UPDATE:
    return assign({}, state, { inventoryUsersArr: action.users});

    case types.INVENTORY_USERS_OBJ_UPDATE:
    return assign({}, state, { inventoryUsersObj: action.users});

    case types.INVENTORY_ITEM_SELECT_ADD:
    amount = get(state, ['inventoryParts', action.no, 'itemsSelected', action.item.classid, 'amountSelect'], 0);
    if(action.item.amount < amount+action.amount) {return state;}
    amount+=action.amount;
    t = set(['inventoryParts', action.no, 'itemsSelected', action.item.classid], action.item, state);
    //так не работает
    //update(['inventoryParts', action.no, 'itemsSelected', action.item.classid, 'amountSelect'], function(n) { return n ? n + 1 : 0; }, t);
    return set(['inventoryParts', action.no, 'itemsSelected', action.item.classid, 'amountSelect'], amount, t);

    case types.INVENTORY_ITEM_SELECT_DELETE:
    amount = get(state, ['inventoryParts', action.no, 'itemsSelected', action.item.classid, 'amountSelect'], 0);
    if(amount===0){return state;}
    if(amount-action.amount === 0) {
      t = unset(['inventoryParts', action.no, 'itemsSelected', action.item.classid], state);
    } else {
      t = set(['inventoryParts', action.no, 'itemsSelected', action.item.classid, 'amountSelect'], amount-action.amount, state);
    }
    return t;

    case types.INVENTORY_BAG_PAGE_UPDATE:
    t = keys(state.inventories[state.inventoryParts[action.no].user].bags[state.inventoryParts[action.no].bag].items).length-1;
    amount = get(state, ['inventoryParts', action.no, 'page'], 0);
    amount = (amount + action.page) <0 ? 0 : (amount + action.page) > t ? t : amount + action.page;
    return set(['inventoryParts', action.no, 'page'], amount, state);

    default:
    return state;
  }
};

export default inventoryReducer;
