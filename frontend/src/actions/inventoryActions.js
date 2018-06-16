'use strict';
import * as types from './actionTypes';
import {getInventoryApi} from '../api/inventoryApi';
import {isEmpty, keys, assign} from 'lodash';
import store from '../index';

export function clearInventoryItemsSelect() {
  return {
    type: types.INVENTORY_ITEMS_SELECT_CLEAR,
  };
}

export function updateInventoryOfferPerform(status) {
  return {
    type: types.INVENTORY_OFFER_PERFORM_UPDATE,
    status
  };
}

export function requestInventory(users = [], inventoryLoading = false) {
  return {
    type: types.INVENTORY_REQUEST,
    users,
    inventoryLoading
  };
}

export function receiveInventory(inventories, inventoryLoaded=false) {
  return {
    type: types.INVENTORY_RECEIVE,
    inventories,
    inventoryLoaded
  };
}

export function updateInventoryBag(bagId, no) {
  return {
    type: types.INVENTORY_BAG_UPDATE,
    bagId,
    no
  };
}

export function updateInventoryUser(user, no) {
  let t = store.getState();
  t = t.inventoryState.inventoryUsersObj[user][0];
  return {
    type: types.INVENTORY_USER_UPDATE,
    user: {
      user: user,
      bag: t,
      itemsSelected: {},
      page: 0
    },
    no
  };
}

export function updateInventoryUsersArr(users) {
  return {
    type: types.INVENTORY_USERS_ARR_UPDATE,
    users
  };
}

export function updateInventoryUsersObj(users) {
  return {
    type: types.INVENTORY_USERS_OBJ_UPDATE,
    users
  };
}

export function addInventoryItemSelect(item, no, amount=1) {
  return {
    type: types.INVENTORY_ITEM_SELECT_ADD,
    item,
    no,
    amount
  };
}

export function deleteInventoryItemSelect(item, no, amount=1) {
  return {
    type: types.INVENTORY_ITEM_SELECT_DELETE,
    item,
    no,
    amount
  };
}

export function updateInventoryBagPage(page, no) {
  return {
    type: types.INVENTORY_BAG_PAGE_UPDATE,
    page,
    no
  };
}

export function requestUserLogin(status) {
  return {
    type: types.APP_USER_LOGIN_REQUEST,
    status
  };
}

export function succesUserLogin(status) {
  return {
    type: types.APP_USER_LOGIN_SUCCESS,
    status
  };
}

export function updateInventoryDescriptions(data) {
  return {
    type: types.INVENTORY_DESCRIPTIONS_UPDATE,
    data
  };
}

export function getInventory(parts, users = []) {
  return async (dispatch) => {
    dispatch(requestInventory(users, true));
    try {
      let data = await getInventoryApi(users);
      data = normalizeInventories(data);
      normalizeDescriptions(data);
      dispatch(receiveInventory(data.inventories, true));
      if (!isEmpty(data.inventories)) {
        dispatch(updateInventoryUsersArr(data.usersArr));
        dispatch(updateInventoryUsersObj(data.usersObj));
        dispatch(updateInventoryDescriptions(data.descriptions));
        let u = data.usersArr[0];
        dispatch(updateInventoryUser(u, parts[0]));
        if(data.usersArr.length > 1 ){
          u = data.usersArr[1];
        }
        if(parts.length>1){
          dispatch(updateInventoryUser(u, parts[1]));
        }
      }
    } catch (e) {
      console.log('getInventory error');
      return e;
    } finally {
      dispatch(requestInventory(users, false));
    }

  };
}

function normalizeDescriptions(data) {
  for(let u in data.usersObj) {
    for(let b in data.inventories[u].bags){
      for(let k in data.inventories[u].bags[b].items) {
        data.descriptions[k] = data.descriptions[k] || {}; //TODO: решить что делать
        data.descriptions[k].amount |= 0;
        data.descriptions[k].amount += data.inventories[u].bags[b].items[k].amount;
      }
    }
  }
  return data;
}

function normalizeInventories(data) {
  data.usersObj = {};
  let desc;
  data.descriptions = {};
  data.inventories.forEach(i => {
    i.bags.forEach(j => {
      j.items = subjectsToHash(j.items, 'assetId');
    });
    i.bags = subjectsToHash(i.bags, 'name');
    for(let k in i.bags) {
    desc = subjectsToHash(i.bags[k].itemDescriptions, 'classId');
    assign(data.descriptions, desc);
    delete i.bags[k].itemDescriptions;
  }
    data.usersObj[i.user] = keys(i.bags);
  });
  data.inventories = subjectsToHash(data.inventories, 'user');
  data.usersArr = keys(data.inventories);
  return data;
}

function subjectsToHash(subjects, id){
  let hash = {};
  subjects.forEach(s => hash[s[id]] = s);
  return hash;
}
