import * as types from './actionTypes';
import {doLoginApi} from '../api/appApi';
import {has} from 'lodash';

export function requestAppLogin(status) {
  return {
    type: types.APP_USER_LOGIN_REQUEST,
    status
  };
}

export function successAppLogin(status) {
  return {
    type: types.APP_USER_LOGIN_SUCCESS,
    status
  };
}

export function receiveAppLogin(userInfo, userOptions) {
  return {
    type: types.APP_USER_RECEIVE,
    userInfo,
    userOptions
  };
}

export function doLogin(login, pass) {
  return async (dispatch) => {
  dispatch(requestAppLogin(true));
  try {
    let data = await doLoginApi(login, pass);
  if(has(data, 'userInfo')){
    dispatch(receiveAppLogin(data.userInfo, data.userOptions));
    dispatch(successAppLogin(true));
  } else {
    dispatch(successAppLogin(false));
  }
  } catch(e) {
    dispatch(successAppLogin(false));
  } finally {
    dispatch(requestAppLogin(false));
  }
};
}
