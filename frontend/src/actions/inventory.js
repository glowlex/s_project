import * as types from './actionTypes';

export function addInventories(inventories) {
  return {
    type: types.ADD_INVENTORIES,
    inventories
  };
}
