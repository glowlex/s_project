'use strict';
import * as types from './actionTypes';
import {getInventoryApi} from '../api/inventoryApi';
import {isEmpty, keys} from 'lodash';

export function requestInventory(users = [], inventoryLoading = true) {
  return {
    type: types.REQUEST_INVENTORY,
    users,
    inventoryLoading
  };
}

export function receiveInventory(inventories, inventoryLoaded=false) {
  return {
    type: types.RECEIVE_INVENTORY,
    inventories,
    inventoryLoaded
  };
}

export function changeInventoryBagLeft(id) {
  return {
    type: types.CHANGE_INVENTORY_BAG_L,
    id
  };
}

export function changeInventoryBagRight(id) {
  return {
    type: types.CHANGE_INVENTORY_BAG_R,
    id
  };
}

export function changeInventoryUserRight(user) {
  return {
    type: types.CHANGE_INVENTORY_USER_R,
    user
  };
}

export function changeInventoryUserLeft(user) {
  return {
    type: types.CHANGE_INVENTORY_USER_L,
    user
  };
}

export function getInventory(users = []) {
  return async (dispatch) => {
    dispatch(requestInventory(users, true));
    try {
      let data = await getInventoryApi(users);
      data = normalizeInventories(data);
      dispatch(receiveInventory(data.inventories, true));
      if (!isEmpty(data.inventories)) {
        let key = keys(data.inventories)[0];
        dispatch(changeInventoryUserLeft(key));
        dispatch(changeInventoryBagLeft(keys(data.inventories[key].bags)[0]));
      }
    } catch (e) {

    } finally {
      dispatch(requestInventory(users, false));
    }

  };
}

function normalizeInventories(data) {
  data.inventories.forEach(i => {
    i.bags.forEach(j => {
      j.items = subjectsToHash(j.items, 'assetid');
    });
    i.bags = subjectsToHash(i.bags, 'id');
  });
  data.inventories = subjectsToHash(data.inventories, 'user');
  return data;
}

function subjectsToHash(subjects, id){
  let hash = {};
  subjects.forEach(s => hash[s[id]] = s);
  return hash;
}
