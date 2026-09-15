import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux"; // Import Provider from react-redux
import { BrowserRouter } from "react-router-dom";
import { createStore, applyMiddleware } from "redux"; // Correct import
import { thunk } from "redux-thunk"; // Use named import for thunk
import App from "./App";
import UserProvider from "./context/UserProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import rootReducer from "./reducers"; // Import your root reducer

const store = createStore(
  rootReducer, // Your root reducer
  applyMiddleware(thunk) // Apply thunk middleware
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <UserProvider>
        <GoogleOAuthProvider clientId="1026921384788-gi8416qgicnge55tv35c8hqm070ej98s.apps.googleusercontent.com">

          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </UserProvider>
    </Provider>
  </React.StrictMode>
);