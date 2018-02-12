'use strict';
import * as types from './actionTypes';
import {getInventoryApi} from '../api/inventoryApi';
import {isEmpty, keys} from 'lodash';

export function requestInventory(users = [], inventoryLoading = false) {
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

export function updateInventoryBagLeft(id) {
  return {
    type: types.UPDATE_INVENTORY_BAG_L,
    id
  };
}

export function updateInventoryBagRight(id) {
  return {
    type: types.UPDATE_INVENTORY_BAG_R,
    id
  };
}

export function updateInventoryUserRight(user) {
  return {
    type: types.UPDATE_INVENTORY_USER_R,
    user
  };
}

export function updateInventoryUserLeft(user) {
  return {
    type: types.UPDATE_INVENTORY_USER_L,
    user
  };
}

export function updateInventoryUsers(users) {
  return {
    type: types.UPDATE_INVENTORY_USERS,
    users
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
        let ukeys = keys(data.inventories);
        dispatch(updateInventoryUsers(ukeys));
        let ukey = ukeys[0];

        dispatch(updateInventoryUserLeft(ukey));
        let bkeys = keys(data.inventories[ukey].bags);
        dispatch(updateInventoryBagLeft(bkeys[0]));
        if(ukeys.length > 1 ){
          ukey = ukeys[1];
          bkeys = keys(data.inventories[ukey].bags);
        }
        dispatch(updateInventoryUserRight(ukey));
        dispatch(updateInventoryBagRight(bkeys[0]));
      }
    } catch (e) {
        console.log('getInventory error');
    } finally {
      dispatch(requestInventory(users, false));
    }

  };
}

function normalizeInventories(data) {
  data.inventories.forEach(i => {
    i.bags.forEach(j => {
      j.items = subjectsToHash(j.items, 'classid');
    });
    i.bags = subjectsToHash(i.bags, 'name');
  });
  data.inventories = subjectsToHash(data.inventories, 'user');
  return data;
}

function subjectsToHash(subjects, id){
  let hash = {};
  subjects.forEach(s => hash[s[id]] = s);
  return hash;
}
