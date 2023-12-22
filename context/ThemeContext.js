import React, { createContext, useState, useContext } from "react";

const Context = createContext();

export const ThemeContext = ({ children }) => {
  //  dark__theme,
  //  sunburst__theme,
  //  twilight__theme

  const [theme, setTheme] = useState("dark__theme");

  const handleTheme = () => {};

  return (
    <Context.Provider value={{ theme, setTheme, handleTheme }}>
      {children}
    </Context.Provider>
  );
};

export const useThemeContext = () => useContext(Context);
