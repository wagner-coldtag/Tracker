import axios from "axios";
import * as api from "../api/index.js";
import { AUTH } from "../constants/actionTypes";


// Action types
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const SIGNUP_REQUEST = "SIGNUP_REQUEST";
export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const SIGNUP_FAILURE = "SIGNUP_FAILURE";
export const CHECK_PASSWORD_REQUEST = "CHECK_PASSWORD_REQUEST";
export const CHECK_PASSWORD_SUCCESS = "CHECK_PASSWORD_SUCCESS";
export const CHECK_PASSWORD_FAILURE = "CHECK_PASSWORD_FAILURE";

// Action creators
export const loginRequest = () => ({
  type: LOGIN_REQUEST,
});

export const loginSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  payload: user,
});

export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});

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

export const checkPasswordRequest = () => ({
  type: CHECK_PASSWORD_REQUEST,
});

export const checkPasswordSuccess = (user) => {
  return {
    type: CHECK_PASSWORD_SUCCESS,
    payload: user,
  };
};

export const checkPasswordFailure = (error) => ({
  type: CHECK_PASSWORD_FAILURE,
  payload: error,
});

// Login function
export const login = (email, password) => async (dispatch) => {
  try {
    const response = await api.signIn(email, password);

    // Check if the status code is 401 and handle it as an error
    console.log(response);
    if (response.data.statusCode === 401) {
      throw new Error(response.data.message || "Invalid credentials");
    }

    // Dispatch only if no error
    const { data } = response;
    await dispatch({ type: AUTH, data });
    return null;  // Return null on success
  } catch (error) {
    return error.message || "Login failed"; // Return error message on failure
  }
};
//export const login = (email, password) => {
//  return async (dispatch) => {
//    dispatch(loginRequest()); // Start the login request
//    try {
//      const { data } = await axios.post(
//        "https://5ltkbz062m.execute-api.sa-east-1.amazonaws.com/prod/users",
//        {
//          action: "login",  // Add the action parameter as per your API requirements
//          Email: email,     // Use uppercase 'Email' as expected by your API
//          Password: password // Use uppercase 'Password'
//        },
//        {
//          headers: {
//            "Content-Type": "application/json"
//          }
//        }
//      );
//
//      // Check for a successful response
//      const body = JSON.parse(response.data.body);
//
//      // If the body contains "Invalid credentials", throw an error
//      if (body.message === "Login successful") {
//        const userData = body.user; // Access user data directly
//
//        // Save user info to localStorage (excluding password)
//        localStorage.setItem("profile", JSON.stringify({ user: userData }));
//
//        // Dispatch login success with user data
//        dispatch(loginSuccess(userData));
//      } else {
//        // Handle login failure
//        dispatch(loginFailure(body.message || "Login failed"));
//      }
//
//    } catch (error) {
//      // Handle any errors that occur
//      const errorMessage = error.response?.data?.body || error.message || "Login failed";
//      dispatch(loginFailure(errorMessage));
//      throw error; // Optional: throw the error to handle it in the component
//    }
//  };
//};

// Sign up function
export const signUp = (userData) => {
  return async (dispatch) => {
    dispatch(signUpRequest()); // Start the signup request
    try {
      const response = await axios.post(
        "https://5ltkbz062m.execute-api.sa-east-1.amazonaws.com/prod/users",
        {
          action: "signUp",  // Add the action parameter for sign up
          Email: userData.email,     // Use uppercase 'Email' as expected by your API
          Password: userData.password, // Use uppercase 'Password'
          Company: userData.company,   // Additional fields
          Surname: userData.surname,
          Name: userData.name,
          Role: userData.role,
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // Assuming your response has a token and user info
      const { user, token } = response.data;

      dispatch(signUpSuccess({ user, token }));

      // Optionally, save user data to localStorage after signup

    } catch (error) {
      dispatch(signUpFailure(error.message));
      throw error; // Optional: throw the error to handle it in the component
    }
  };
};

// Check password function
// Check password function
export const checkPassword = (email, password) => {
  return async (dispatch) => {
    dispatch(checkPasswordRequest()); // Start the check password request

    try {
      const response = await axios.post(
        "https://5ltkbz062m.execute-api.sa-east-1.amazonaws.com/prod/users",
        {
          action: "checkPassword",
          Email: email,
          Password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const body = JSON.parse(response.data.body);

      // Check if password verification was successful
      if (body.message === "Password is correct") {
        dispatch(checkPasswordSuccess(body)); // Dispatch success action
      } else {
        dispatch(checkPasswordFailure(body.message || "Password check failed"));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.body || error.message || "Password check failed";
      dispatch(checkPasswordFailure(errorMessage));
      throw error; // Optional: throw the error to handle it in the component
    }
  };
};
