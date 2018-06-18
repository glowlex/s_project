'use strict';
import * as testData from './testData';
import {set} from 'lodash/fp';

export function makeTradeOfferApi(offers) {
  offers[0].id = 1;
  return new Promise(resolve => setTimeout(resolve, 300, set(['exchangeQueries', 0], offers[0], testData.testOffer)));
}
