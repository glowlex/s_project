'use strict';
import * as testData from './testData';


export function getInventoryApi(users = []) {
  users.length;
  return Promise.resolve(testData.testInv);
}

export function doLogin(user, pass) {
    user.length;
    pass.length;
    return Promise.resolve(testData.testLogin);
}
