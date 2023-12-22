import React, { createContext, useState, useContext } from "react";

const Context = createContext();

export const FeedbackContext = ({ children }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [messageId, setMessageId] = useState(false);

  return (
    <Context.Provider
      value={{ isFeedbackOpen, setIsFeedbackOpen, messageId, setMessageId }}
    >
      {children}
    </Context.Provider>
  );
};

export const useFeedbackContext = () => useContext(Context);
