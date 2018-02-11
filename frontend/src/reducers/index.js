// Set up your root reducer here...
 import { combineReducers } from 'redux';
 import { routerReducer } from 'react-router-redux';
 import inventoryReducer from './inventory';

 const rootReducer = combineReducers({
   inventoryState: inventoryReducer,
   routing: routerReducer
 });

 export default rootReducer;
