import axios from "axios";
import * as api from "../api/index.js";
import { AUTH, CHECK_PASSWORD, PASSWORD_CHANGE } from "../constants/actionTypes";

// Action types
export const SIGNUP_REQUEST = "SIGNUP_REQUEST";
export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const SIGNUP_FAILURE = "SIGNUP_FAILURE";

export const signUpRequest = () => ({
  type: SIGNUP_REQUEST,
});

export const signUpSuccess = (user) => ({
  type: SIGNUP_SUCCESS,
  payload: user,
});

export const signUpFailure = (error) => ({
  type: SIGNUP_FAILURE,
  payload: error,
});



// Login function
export const login = (email, password) => async(dispatch) => {
  try {
    const response = await api.signIn(email, password);

    // Check if the status code is 401 and handle it as an error
    if (response.data.statusCode === 401) {
      throw new Error(response.data.message || "Invalid credentials");
    }


    const { data } = response;
    const teste = JSON.parse(data.body);

    if (!teste.user.Approved) {
      throw new Error("Conta Inválida.");
    }
    if (teste.user.Approved === false) {
      throw new Error("Sua conta ainda não foi aprovada.");
    }
    await dispatch({ type: AUTH, data });
    return null; // Return null on success
  } catch (error) {
    return error.message || "Login failed"; // Return error message on failure
  }
};

// Sign up function
export const signUp = (userData) => {
  return async(dispatch) => {
    dispatch(signUpRequest()); // Start the signup request
    try {
      const response = await axios.post(
        "https://5ltkbz062m.execute-api.sa-east-1.amazonaws.com/prod/users",
        {
          action: "signUp", 
          Email: userData.email,     
          Password: userData.password,
          Company: userData.company, 
          Surname: userData.surname,
          Name: userData.name,
          Phone: userData.phone,
          Notifications: userData.notificationEnabled,

          Role: userData.role,
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const { user, token } = response.data;
      dispatch(signUpSuccess({ user, token }));

    } catch (error) {
      dispatch(signUpFailure(error.message));
      throw error; // Optional: throw the error to handle it in the component
    }
  };
};

// Check password function
// Check password function
export const checkPassword = (email, password) => {
  return async(dispatch) => {
    try {
      const response = await api.checkPassword(email, password);
      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || "Password check failed");
      }

      // Dispatch only if no error
      const { data } = response;
      await dispatch({ type: CHECK_PASSWORD, data });
      return null; // Return null on success
    } catch (error) {
      return error.message || "Login failed"; // Return error message on failure
    }
  };
};

export const passwordChange = (email, password) => {
  return async(dispatch) => {
    try {
      const response = await api.passwordChange(email, password);
      if (response.data.statusCode !== 200) {
        throw new Error(response.data.message || "Password change failed");
      }

      // Dispatch only if no error
      const { data } = response;
      await dispatch({ type: PASSWORD_CHANGE, data });
      return null; // Return null on success
    } catch (error) {
      return error.message || "Login failed"; // Return error message on failure
    }
  };
};
