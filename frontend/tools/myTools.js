import * as urls from '../src/constants/urlConsts';
import Cookies from 'js-cookie';
import axios from 'axios';

export function subjectsToHash(subjects, id){
  let hash = {};
  subjects.forEach(s => hash[s[id]] = s);
  return hash;
}

function getRootElementFontSize( ) {
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}
export function convertRem(value) {
  return value * getRootElementFontSize();
}

export function jwt_handler(s = ()=>{}, f = ()=>{}) {
    let accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      f();
      return;
    }
    let expires = Cookies.get('expires');
    let h = {headers: { Authorization: "Bearer " }};
    if (expires < (new Date()).getTime()/1000+10) {
      let refreshToken = Cookies.get('refreshToken');
      let req = {
        refreshToken
      };
      return axios.post(urls.URL_SERVER_API+urls.URL_ACCESS_TOKEN+'/get', req).then( (response) => {
        if (response.status == 200){
          Cookies.set('accessToken', response.data.accessToken);
          Cookies.set('refreshToken', response.data.refreshToken);
          Cookies.set('expires', response.data.expires);
          h.headers.Authorization += response.data.accessToken;
          s();
          return h;
        }
        f();
        return;
      }).catch(function (error) {
        if (error.response.status == 401){
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('expires');
        }
          console.log(error);
      });
    } else {
      h.headers.Authorization += accessToken;
      s();
      return h;
    }
}
