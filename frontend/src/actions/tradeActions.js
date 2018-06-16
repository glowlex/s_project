import * as types from './actionTypes';
import store from '../index';
import {clearInventoryItemsSelect, updateInventoryOfferPerform} from './inventoryActions';
import {makeTradeOfferApi} from '../api/tradeApi';

export function addTradeOffer() {
  // TODO:
  return {
    type: types.TRADE_OFFER_ADD,
  };
}

export function makeTradeOffer() {
  return async (dispatch) => {
    dispatch(updateInventoryOfferPerform(true));
    try {
      let data = await makeTradeOfferApi();

      dispatch(clearInventoryItemsSelect());
    } catch(e) {
      console.log('makeTradeOffer error');
      return e;
    } finally {
      dispatch(updateInventoryOfferPerform(false));
    }
  };
}
