'use strict';
import * as types from './actionTypes';
import {getInventoryApi} from '../api/inventoryApi';
import {isEmpty, keys} from 'lodash';
import store from '../index';

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
  let t = store.getState();
  t = t.inventoryState.inventoryUsersObj[user][0];
  return {
    type: types.UPDATE_INVENTORY_USER_R,
    user: {
      user: user,
      bag: t
    }
  };
}

export function updateInventoryUserLeft(user) {
  let t = store.getState();
  t = t.inventoryState.inventoryUsersObj[user][0];
  return {
    type: types.UPDATE_INVENTORY_USER_L,
    user: {
      user: user,
      bag: t
    }
  };
}

export function updateInventoryUsersArr(users) {
  return {
    type: types.UPDATE_INVENTORY_USERS_ARR,
    users
  };
}

export function updateInventoryUsersObj(users) {
  return {
    type: types.UPDATE_INVENTORY_USERS_OBJ,
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
        dispatch(updateInventoryUsersArr(data.usersArr));
        dispatch(updateInventoryUsersObj(data.usersObj));
        let u = data.usersArr[0];
        dispatch(updateInventoryUserLeft(u));
        if(data.usersArr.length > 1 ){
          u = data.usersArr[1];
        }
        dispatch(updateInventoryUserRight(u));
      }
    } catch (e) {
        console.log('getInventory error');
    } finally {
      dispatch(requestInventory(users, false));
    }

  };
}

function normalizeInventories(data) {
  data.usersObj = {};
  data.inventories.forEach(i => {
    i.bags.forEach(j => {
      j.items = subjectsToHash(j.items, 'classid');
    });
    i.bags = subjectsToHash(i.bags, 'name');
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
