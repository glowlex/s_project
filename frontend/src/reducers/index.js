// Set up your root reducer here...
 import { combineReducers } from 'redux';
 import { routerReducer } from 'react-router-redux';
 import inventoryReducer from './inventory';
 import appReducer from './app';
 import tradeReducer from './trade';

 const rootReducer = combineReducers({
   appState: appReducer,
   inventoryState: inventoryReducer,
   tradeState: tradeReducer,
   routing: routerReducer
 });

 export default rootReducer;
