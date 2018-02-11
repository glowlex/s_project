import * as testData from './testData';


export function getInventoryApi(users = []) {
  return Promise.resolve(testData.testInv);
}
