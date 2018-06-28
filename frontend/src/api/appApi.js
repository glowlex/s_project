import * as testData from './testData';
import * as urls from '../constants/urlConsts';
import Cookies from 'js-cookie';
import axios from 'axios';

export function doLoginApi(login, password) {
    let req = {
      'userInfo': {
      login,
      password
    }
    };
    return axios.post(urls.URL_SERVER_API+urls.URL_LOGIN+'/post', req).then( (response) => {
      if (response.data.status == 200){
      Cookies.set('accessToken', response.data.accessToken);
      Cookies.set('refreshToken', response.data.refreshToken);
      Cookies.set('expires', response.data.expires);
    }
      return response.data;
    });
}

export function doLogoutApi(){
  let req = {
    'refreshToken': Cookies.get('refreshToken')
  };
  return axios.post(urls.URL_SERVER_API+urls.URL_LOGOUT+'/post', req);
}

export function doRegApi(login, email, pass) {
  login.length;
  email.lenght;
  pass.lenght;
  return Promise.resolve(testData.testLogin);
}
