import * as types from '../actions/actionTypes';
import {set} from 'lodash/fp';


const initialState = {
  userLoggedOn: false,
  userLogging: false,
  userInfo:{},
  userOptions: {}
};

export default function appReducer(state = initialState, action){
  let t;
  switch(action.type){
    case types.APP_USER_LOGIN_REQUEST:
    return set(['userLogging'], action.status, state);

    case types.APP_USER_LOGIN_SUCCESS:
    return set(['userLoggedOn'], true, state);

    case types.APP_USER_UPDATE:
    t = set('userInfo', action.userInfo, state);
    return set('userOptions', action.userOptions, t);

    default:
    return state;
  }
}
