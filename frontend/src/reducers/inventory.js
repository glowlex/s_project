'use strict';
import * as types from '../actions/actionTypes';
import {assign, get, keys} from 'lodash';
import {set, unset, get as getfp} from 'lodash/fp';

const initialState = {
  inventories: {},
  inventoryDescriptions: {},
  inventoryLoading: false,
  inventoryLoaded: false,
  inventoryTradePerform: false,
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
    amount = get(state, ['inventoryParts', action.no, 'itemsSelected', action.item.classId, 'amountSelect'], 0);
    if(action.item.amount < amount+action.amount) {return state;}
    amount+=action.amount;
    t = set(['inventoryParts', action.no, 'itemsSelected', action.item.classId], action.item, state);
    //так не работает
    //update(['inventoryParts', action.no, 'itemsSelected', action.item.classid, 'amountSelect'], function(n) { return n ? n + 1 : 0; }, t);
    return set(['inventoryParts', action.no, 'itemsSelected', action.item.classId, 'amountSelect'], amount, t);

    case types.INVENTORY_ITEM_SELECT_DELETE:
    amount = get(state, ['inventoryParts', action.no, 'itemsSelected', action.item.classId, 'amountSelect'], 0);
    if(amount===0){return state;}
    if(amount-action.amount === 0) {
      t = unset(['inventoryParts', action.no, 'itemsSelected', action.item.classId], state);
    } else {
      t = set(['inventoryParts', action.no, 'itemsSelected', action.item.classId, 'amountSelect'], amount-action.amount, state);
    }
    return t;

    case types.INVENTORY_BAG_PAGE_UPDATE:
    t = keys(state.inventories[state.inventoryParts[action.no].user].bags[state.inventoryParts[action.no].bag].items).length-1;
    amount = get(state, ['inventoryParts', action.no, 'page'], 0);
    amount = (amount + action.page) <0 ? 0 : (amount + action.page) > t ? t : amount + action.page;
    return set(['inventoryParts', action.no, 'page'], amount, state);

    case types.INVENTORY_DESCRIPTIONS_UPDATE:
    return set('inventoryDescriptions', action.data, state);

    case types.INVENTORY_OFFER_PERFORM_UPDATE:
    return set('inventoryTradePerform', action.status, state);

    case types.INVENTORY_ITEMS_SELECT_CLEAR:
    t = get(state, ['inventoryParts',], {});
    for(let k in t) {
      //так не работает даже если значение из асайна
      //t[k].itemsSelected = {};
      t =set([k, 'itemsSelected'], {}, t);
    }
    t =set(['inventoryParts',], t, state);
    return t;

    default:
    return state;
  }
};

export default inventoryReducer;
