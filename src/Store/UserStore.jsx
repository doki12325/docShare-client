import React, { createContext, useContext, useState } from "react";

const userContext = createContext();

export default function UserStore({ children }) {
  const ENDPOINT = "https://doc-share-33k5.onrender.com/api";
  const [user, setUser] = useState({
    fistName: "",
    lastName: "",
    userName: "",
    email: "",
    token: "",
  });
  return (
    <userContext.Provider
      value={{ user: user, setUser: setUser, ENDPOINT: ENDPOINT }}
    >
      {children}
    </userContext.Provider>
  );
}

export const useUserContext = () => {
  return useContext(userContext);
};
