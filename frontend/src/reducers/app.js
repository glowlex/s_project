import * as types from '../actions/actionTypes';
import {set} from 'lodash/fp';


const initialState = {
  userLoggedOn: true, //test
  userLogging: false,
  userLoginError: false,
  userSigningUp: false,
  userSignUpError: false,
  userInfo:{},
  userOptions: {}
};

export default function appReducer(state = initialState, action){
  let t;
  switch(action.type){
    case types.APP_USER_LOGIN_REQUEST:
    return set(['userLogging'], action.status, state);

    case types.APP_USER_LOGIN_SUCCESS:
    set(['userLoginError'], !action.status, state);
    return set(['userLoggedOn'], action.status, state);

    case types.APP_USER_RECEIVE:
    t = set('userInfo', action.userInfo, state);
    return set('userOptions', action.userOptions, t);

    case types.APP_USER_LOGOUT:
    return {};

    case types.APP_USER_REG_REQUEST:
    return set('userSigningUp', action.status, state);

    case types.APP_USER_REG_SUCCESS:
    return set('userSignUpError', !action.status, state);

    default:
    return state;
  }
}
