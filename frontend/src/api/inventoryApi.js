'use strict';
import axios from 'axios';
import * as urls from '../constants/urlConsts';
import {jwt_handler} from 'myTools';

export function getInventoryApi(users = []) {
  let options = jwt_handler();
  if (!options){
    return;
  }
  let req = {
    accountInfos: users,
  };
  return axios.post(urls.URL_SERVER_API+urls.URL_INVENTORY+'/get', req, options).then( (response) => {
    return response.data;
  });
}
