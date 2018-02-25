import * as types from './actionTypes';
import {doLoginApi, doRegApi} from '../api/appApi';
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

export function requestAppLogout() {
  return {
    type: types.APP_USER_LOGOUT
  };
}

export function requestAppReg(status) {
  return {
    type: types.APP_USER_REG_REQUEST,
    status
  };
}

export function successAppReg(status) {
  return {
    type: types.APP_USER_REG_SUCCESS,
    status
  };
}

export function doReg(login, email, pass) {
  return async (dispatch) => {
    dispatch(requestAppReg(true));
    try {
      let data = await doRegApi(login, email, pass);
      if(has(data, 'userInfo')){
        dispatch(receiveAppLogin(data.userInfo, data.userOptions));
        dispatch(successAppLogin(true));
      } else {
        dispatch(successAppReg(false));
      }
    } catch (e) {
      dispatch(successAppReg(false));
    } finally {
      dispatch(requestAppReg(false));
    }
  };
}

export function doLogout() {
  return async (dispatch) => {
    dispatch(requestAppLogout());
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
