import React, { useEffect, useRef, useState } from "react";
import { useFeedbackContext } from "@/context/FeedbackContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const FeedbackModal = () => {
  const dropdownRef = useRef(null);

  const [feedbackValue, setFeedbackValue] = useState("");

  const { isFeedbackOpen, setIsFeedbackOpen, messageId } = useFeedbackContext();

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsFeedbackOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleFeedback = async () => {
    const proxyUrl = `/api/feedback`;

    if (feedbackValue !== "") {
      const response = await axios.put(
        proxyUrl,
        { messageId, feedbackValue },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setFeedbackValue("");
      setIsFeedbackOpen(false);

      toast("Feedback Submitted", {
        icon: "👏",
      });
    }
  };

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-[1000] flex items-center justify-center max-h-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 bg_blur ${
        isFeedbackOpen || "hidden"
      }`}
    >
      <div
        className="relative w-full max-w-lg p-6 rounded-lg bg-foreground"
        ref={dropdownRef}
      >
        <div className="flex flex-col space-y-6 text-xs tracking-wider text-white">
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium tracking-wide text-muted">
              Provide Feedback
            </span>

            <span className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 cursor-pointer text-muted"
                onClick={() => setIsFeedbackOpen(false)}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>

          <div className="flex flex-col space-y-4 text-sm font-normal text-muted">
            <p>Provide your additional details based on the feedback.</p>

            <textarea
              className="p-4 border rounded-lg outline-none resize-none h-60 bg-background border-border"
              value={feedbackValue}
              onChange={(e) => setFeedbackValue(e.target.value)}
            ></textarea>

            <div>
              <button
                className="flex items-center justify-center px-6 py-3 space-x-2 text-sm font-medium transition-all duration-300 rounded-xl bg-secondary hover:bg-secondary hover:px-7"
                onClick={handleFeedback}
              >
                <span className="text-base font-normal tracking-wide text-accent-foreground">
                  Submit
                </span>

                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-accent-foreground"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
