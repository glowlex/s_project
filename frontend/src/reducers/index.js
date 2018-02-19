// Set up your root reducer here...
 import { combineReducers } from 'redux';
 import { routerReducer } from 'react-router-redux';
 import inventoryReducer from './inventory';
 import appReducer from './app';

 const rootReducer = combineReducers({
   appState: appReducer,
   inventoryState: inventoryReducer,
   routing: routerReducer
 });

 export default rootReducer;
