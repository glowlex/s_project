'use strict';
import * as testData from './testData';

export function getInventoryApi(users = []) {
  users.length;
  return new Promise(resolve=> setTimeout(resolve, 100, testData.testInv));
}
