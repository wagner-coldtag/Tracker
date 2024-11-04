const authReducer = (state = { authData: null }, action) => {
  switch(action.type) {
  case "AUTH": {
    // Parse the response and extract the `user` data
    const response = JSON.parse(action.data.body); // Ensure this is a JSON string
    const user = response.user; // Extract the `user` object

    // Save only the `user` part to localStorage
    localStorage.setItem("profile", JSON.stringify(user));

    // Return the state with only `user` in `authData`
    return { ...state, authData: user };
  }

  case "CHECK_PASSWORD": {
    return { ...state, authData: action?.data };
  }
  case "PASSWORD_CHANGE": {
    return { ...state, authData: action?.data };
  }
  case "LOGOUT": {
    localStorage.clear();
    return { ...state, authData: null };
  }

  default:
    return state;
  }
};

export default authReducer;
