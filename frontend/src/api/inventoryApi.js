'use strict';
import axios from 'axios';
import * as urls from '../constants/urlConsts';

export function getInventoryApi(users = []) {
  let req = {
    accountInfos: users,
  };
  return axios.post(urls.URL_SERVER_API+urls.URL_INVENTORY+'/get', req).then( (response) => {
    return response.data;
  });
}
