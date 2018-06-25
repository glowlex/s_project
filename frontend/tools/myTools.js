import store from '../src/index';
import {requestAppLogout} from '../src/actions/appActions';
import * as urls from '../src/constants/urlConsts';

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

export function jwt_handler(f) {
  return function(){
    let accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      store.dispatch(requestAppLogout());
      return;
    }
    let expires = Cookies.get('expires');
    if (expires < Date().getSeconds()+30) {
      let refreshToken = Cookies.get('refreshToken');
      let req = {
        refreshToken
      };
      return axios.post(urls.URL_SERVER_API+urls.URL_ACCESS_TOKEN+'/get', req).then( (response) => {
        if (response.data.status == 200){
          Cookies.set('accessToken', response.data.accessToken);
          Cookies.set('refreshToken', response.data.refreshToken);
          Cookies.set('expires', response.data.expires);
          return f.apply(this, arguments);
        }else{
          return response;
        }
      });
    } else {
      return f.apply(this, arguments);
    }
  };
}
