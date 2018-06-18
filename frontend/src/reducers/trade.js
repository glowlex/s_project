import * as types from '../actions/actionTypes';
import {assign} from 'lodash';

const initialState = {
  offers: {},

};

const tradeReducer = function(state = initialState, action) {
  switch (action.type) {
    case types.TRADE_OFFERS_UPDATE:
    return assign({}, state, {offers: action.data});

    default:
    return state;

  }
}
