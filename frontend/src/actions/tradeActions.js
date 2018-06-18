import * as types from './actionTypes';
import store from '../index';
import {clearInventoryItemsSelect, updateInventoryOfferPerform, updateInventory} from './inventoryActions';
import {makeTradeOfferApi} from '../api/tradeApi';
import {subjectsToHash} from 'myTools';
import {pick} from 'lodash/fp';

export function addTradeOffer() {
  // TODO:
  return {
    type: types.TRADE_OFFER_ADD,
  };
}

export function updateTradeOffers(data) {
  return {
    type: types.TRADE_OFFERS_UPDATE,
    data
  };
}

export function makeTradeOffer() {
  return async (dispatch) => {
    dispatch(updateInventoryOfferPerform(true));
    try {
      let state = store.getState().inventoryState.inventoryParts;
      let flag = true;
      for(let k in state) {
        if(Object.keys(state[k].itemsSelected).length != 0){
          flag = false;
        }
      }
      if (flag) {
        //так лучше?
        return Promise.resolve();
      }
      let req = prepareTradeOffer(state);
      let data = await makeTradeOfferApi(req);
      data = tradeOffersNormalize(data);
      dispatch(updateTradeOffers(data));
      dispatch(updateInventory(data));
      dispatch(clearInventoryItemsSelect());
    } catch(e) {
      console.log('makeTradeOffer error');
      return e;
    } finally {
      dispatch(updateInventoryOfferPerform(false));
    }
  };
}

function prepareTradeOffer(data) {
  let offers = [];
  let keys = Object.keys(data);
  if (keys.length < 2) {
    throw new Error("недостаточно участников для обмена");
  }
  if(Object.keys(data[keys[0]].itemsSelected).length >0){
    offers.push(_prepareTradeOfferObj(data[keys[0]].user, data[keys[1]].user, data[keys[0]].itemsSelected));
  }
  if(Object.keys(data[keys[1]].itemsSelected).length >0){
    offers.push(_prepareTradeOfferObj(data[keys[1]].user, data[keys[0]].user, data[keys[1]].itemsSelected));
  }
  return offers;
}

function _prepareTradeOfferObj(ufrom, uto, items) {
  let offer = {};
  offer.userFrom = ufrom;
  offer.userTo = uto;
  offer.asap=true;
  offer.bag = {};
  offer.bag.items=[];
  for(let k in items) {
    let t = pick(['classId',],items[k]);
    t.amount = items[k].amountSelect;
    offer.bag.items.push(t);
  }
  return offer;
}

function tradeOffersNormalize(data) {
  return subjectsToHash(data.exchangeQueries, 'id');
}
