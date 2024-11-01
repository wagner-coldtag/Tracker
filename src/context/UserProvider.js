import { createContext, useContext, useState } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(JSON.parse(localStorage.getItem("profile")) !== null);
  return <UserContext.Provider
    value={{
      loggedIn,
      setLoggedIn
    }}
  >
    {children}
  </UserContext.Provider>;
};

export const UserState = () => {
  return useContext(UserContext);
};

export default UserProvider;