import "@/styles/globals.css";
import React, { useState, useEffect, createContext } from "react";
import { FeedbackContext } from "@/context/FeedbackContext";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";

export const ThemeContext = createContext();

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState("dark");

  const handleTheme = (data) => {
    setTheme(data);
    localStorage.setItem("theme", data);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme !== null || storedTheme !== undefined) {
      setTheme(storedTheme);
    } else {
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  }, []);

  return (
    <FeedbackContext>
      <ThemeContext.Provider value={{ theme, setTheme, handleTheme }}>
        <div className={`${theme}`}>
          <Component {...pageProps} />
          <Tooltip
            id="tooltip"
            place="bottom"
            style={{
              zIndex: 1000,
            }}
          />
          <Toaster />
        </div>
      </ThemeContext.Provider>
    </FeedbackContext>
  );
}
