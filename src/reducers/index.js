import { combineReducers } from "redux";
import authReducer from "./authReducer"; // Import your auth reducer

const rootReducer = combineReducers({
  auth: authReducer, // Add your reducers here
  // other reducers can be added here
});

export default rootReducer;