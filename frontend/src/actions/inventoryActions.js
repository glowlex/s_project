import * as types from './actionTypes';
import {getInventoryApi} from '../api/inventoryApi';

export function requestInventory(users = [], inventoryLoading = true) {
  return {
    type: types.REQUEST_INVENTORY,
    users,
    inventoryLoading
  };
}

export function receiveInventory(inventories) {
  return {
    type: types.RECEIVE_INVENTORY,
    inventories
  };
}

export function getInventory(users = []) {
  return async (dispatch) => {
    dispatch(requestInventory(users, true));
    try {
      let data = await getInventoryApi(users);
         dispatch(receiveInventory(data));
    } catch (e) {

    } finally {
      dispatch(requestInventory(users, false));
    }

  };
}
