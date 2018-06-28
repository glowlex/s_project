'use strict';
import {jwt_handler} from 'myTools';
import axios from 'axios';
import * as urls from '../constants/urlConsts';

export function makeTradeOfferApi(offers) {
  let options = jwt_handler();
  if (!options){
    return;
  }
  let req = {
    exchangeQueries: offers,
  };
  return axios.post(urls.URL_SERVER_API+urls.URL_TRADE+'/post', req, options).then( (response) => {
    return response.data;
  });
}
