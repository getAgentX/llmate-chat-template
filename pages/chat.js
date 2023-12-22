import React, { useState, useEffect, useRef, useContext } from "react";
import { ThoughtCard, TrendingSidebar } from "@/components";
import InfoData from "@/data/ChatDefault.json";
import axios from "axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyToClipboard from "react-copy-to-clipboard";
import { MarkDownComponent } from "@/components/common/MarkdownComponent";
import FeedbackModal from "@/components/modal/FeedbackModal";
import { useFeedbackContext } from "@/context/FeedbackContext";
import { ThemeContext } from "./_app";
import toast from "react-hot-toast";
import Link from "next/link";
import { createSSEWithPost } from "@/utils/sse";

const Chat = () => {
  const [prompt, setPrompt] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [skeletonLoader, setSkeletonLoader] = useState(false);
  const [copyLoader, setCopyLoader] = useState(false);
  const [history, setHistory] = useState([]);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [activeAppRunID, setActiveAppRunID] = useState(null);
  const [responseStream, setResponseStream] = useState([]);
  const [refetch, setRefetch] = useState(false);
  const [thoughts, setThoughts] = useState([]);
  const [createdChatId, setCreatedChatId] = useState(null);
  const [loadingState, setLoadingState] = useState(false);

  const { setIsFeedbackOpen, setMessageId } = useFeedbackContext();

  const { theme, handleTheme } = useContext(ThemeContext);

  const scrollRef = useRef();

  const handleCreateChat = async () => {
    const apiUrl = "/api/create-chat";

    const chatResponse = await axios.post(
      apiUrl,
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    setCreatedChatId(chatResponse?.data?.id);
  };

  useEffect(() => {
    handleCreateChat();
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const scrollOptions = {
      behavior: "smooth",
    };

    scrollRef.current?.scrollIntoView(scrollOptions);
  }, [history, responseStream, thoughts]);

  const getActiveAppInfo = async () => {
    // const appInfoUrl = `${process.env.NEXT_PUBLIC_LLMATE_API_URL}app-run/${activeAppRunID}/`;

    // const response = await axios.get(appInfoUrl, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY,
    //   },
    // });

    const apiUrl = `/api/app-info?id=${activeAppRunID}`;

    const response = await axios.get(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": process.env.NEXT_PUBLIC_API_KEY,
      },
    });

    const responseData = response?.data?.result;
    const messageId = response?.data?.message_id;

    if (responseData) {
      const queryData = {
        messageId: messageId,
        name: "bot",
        value: responseData,
        thoughts: [...thoughts],
      };

      setHistory((prev) => [...prev, queryData]);
    }

    setRefetch(false);
    setResponseStream([]);
    setThoughts([]);
  };

  const fetchData = async (data) => {
    setIsSidebarOpen(false);
    setSkeletonLoader(true);
    setIsLoading(true);

    const queryData = {
      messageId: "",
      name: "user",
      value: data,
      thoughts: [],
    };

    setHistory((prev) => [...prev, queryData]);

    const payload = {
      chat_id: createdChatId || "",
      query: data,
      app_run_type: "CHAT",
    };

    const apiUrl = "/api/app-run";

    const sse = await createSSEWithPost(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    sse.addEventListener("message", (e) => {
      const eventData = e.data.split("\n\n");

      for (let index = 0; index < eventData.length; index++) {
        const eventBase64 = eventData[index];

        if (eventBase64) {
          try {
            const decodedString = Buffer.from(eventBase64, "base64").toString(
              "utf-8"
            );

            const event = JSON.parse(decodedString);

            // if (event.event === "app_run_observation_token") {
            //   console.log("Event", event);
            // }

            if (event?.data?.extra_identifiers?.tool_name) {
              const newThought = event?.data?.extra_identifiers?.tool_name;

              setLoadingState(true);

              setThoughts((prevThoughts) => {
                const uniqueThoughts = new Set([...prevThoughts, newThought]);
                return [...uniqueThoughts];
              });
            }

            // event.data.extra_identifiers.tool_name

            if (event.event == "app_run_created") {
              setActiveAppRunID(event.data.id);
            }

            if (event.event == "app_run_response_token") {
              setResponseStream((prev) => [...prev, event.data.token]);
              setSkeletonLoader(false);
              setLoadingState(false);
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    });

    sse.addEventListener("close", () => {
      setIsLoading(false);
      setRefetch(true);
    });
  };

  useEffect(() => {
    if (refetch) {
      getActiveAppInfo();
    }
  }, [refetch]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchData(prompt);
      setPrompt("");
    }
  };

  const handleCopy = () => {
    setCopyLoader(true);

    setTimeout(() => {
      setCopyLoader(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setHistory([]);
    setThoughts([]);
    handleCreateChat();
    setLoadingState(false);
  };

  const handleReaction = async (id, data) => {
    const apiUrl = `/api/reaction`;

    const response = await axios.put(
      apiUrl,
      { id, data },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    setIsFeedbackOpen(false);

    if (data === 1) {
      toast("Liked Message", {
        icon: "😄",
      });

      setMessageId(id);
      setIsFeedbackOpen(true);
    }

    if (data === 0) {
      toast("Disliked Message", {
        icon: "😕",
      });

      setMessageId(id);
      setIsFeedbackOpen(true);
    }
  };

  return (
    <div className="relative flex flex-col min-h-[100dvh] h-full bg-background">
      <div className="sticky top-0 left-0 z-40 w-full px-4 py-4 border-b bg-background border-border">
        <div className="w-full max-w-5xl mx-auto">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <img
                src={
                  theme === "dark"
                    ? "/images/full-logo.svg"
                    : "/images/full-dark-logo.svg"
                }
                alt=""
                className="w-32 aspect-auto"
              />

              {/* <h2 className="hidden text-2xl font-semibold text-accent font-Nunito-SemiBold xsm:block">
                llmate
              </h2> */}
            </Link>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span
                  className="flex justify-center items-center min-w-[48px] hover:px-4 gap-2 h-12 rounded-full bg-foreground group cursor-pointer transition-all duration-300 group hover:bg-foreground relative"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-muted-foreground group-hover:text-muted"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <span className="hidden text-sm font-normal text-accent xsm:group-hover:block">
                    Trending Questions
                  </span>
                </span>

                {theme === "dark" ? (
                  <span
                    className="relative flex items-center justify-center w-12 h-12 gap-2 transition-all duration-300 rounded-full cursor-pointer bg-foreground hover:bg-foreground"
                    onClick={() => handleTheme("")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      dataSlot="icon"
                      className="w-5 h-5 text-muted-foreground hover:text-muted"
                    >
                      <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
                    </svg>
                  </span>
                ) : (
                  <span
                    className="relative flex items-center justify-center w-12 h-12 gap-2 transition-all duration-300 rounded-full cursor-pointer bg-foreground hover:bg-foreground"
                    onClick={() => handleTheme("dark")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      dataSlot="icon"
                      className="w-5 h-5 text-muted-foreground hover:text-muted"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>

              <button className="flex items-center justify-center px-4 py-2 space-x-2 text-sm font-medium transition-all duration-300 rounded-lg bg-secondary hover:bg-secondary-foreground hover:scale-105">
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
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                </span>

                <span
                  className="hidden text-base font-normal tracking-wide text-accent-foreground xsm:block"
                  onClick={handleRefresh}
                >
                  Refresh
                </span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      <div className="relative">
        <div className="flex flex-col w-full mx-auto">
          <div className="py-10 xsm:py-16 bg-background">
            <div className="max-w-5xl px-4 mx-auto">
              <div className="flex space-x-4">
                <div className="flex w-16 xsm:max-w-[60px] xsm:w-full">
                  <div>
                    <img
                      src={
                        theme === "dark"
                          ? "/images/bot-dark.svg"
                          : "/images/bot.svg"
                      }
                      alt="bot icon"
                      className="w-8 rounded-full xsm:w-full aspect-square"
                    />
                  </div>
                </div>

                <div className="flex flex-col w-full space-y-6">
                  <div className="flex flex-col space-y-6">
                    {InfoData.default_info.paragraph.map((paragraph, index) => {
                      return (
                        <p
                          className="text-sm font-normal leading-7 xsm:text-base text-muted"
                          key={index}
                        >
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-y-4">
                    {InfoData.default_questions.map((question, index) => {
                      return (
                        <div
                          className="flex items-center px-4 py-4 mr-4 text-sm font-normal transition-all duration-300 border rounded-md cursor-pointer xsm:text-base bg-background hover:bg-foreground text-muted border-border"
                          key={index}
                          onClick={() => fetchData(question)}
                        >
                          {question}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-16 xsm:pb-32">
            {history?.map(({ messageId, name, value, thoughts }, index) => {
              if (name === "user") {
                return (
                  <div className="py-8 bg-hover" key={index}>
                    <div className="max-w-5xl px-4 mx-auto">
                      <div className="flex justify-end space-x-4">
                        <div className="flex items-center">
                          <p className="w-full text-sm font-normal leading-7 xsm:text-base text-muted">
                            {value}
                          </p>
                        </div>

                        <div className="flex w-16 xsm:max-w-[60px] xsm:w-full">
                          <div>
                            <img
                              src={
                                theme === "dark"
                                  ? "/images/user-dark.svg"
                                  : "/images/user.svg"
                              }
                              alt="bot icon"
                              className="w-8 rounded-full xsm:w-full aspect-square"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (name === "bot") {
                return (
                  <div className="py-12 bg-background" key={index}>
                    <div className="max-w-5xl px-4 mx-auto">
                      <div className="flex space-x-4">
                        <div className="flex w-16 xsm:max-w-[60px] xsm:w-full">
                          <div>
                            <img
                              src={
                                theme === "dark"
                                  ? "/images/bot-dark.svg"
                                  : "/images/bot.svg"
                              }
                              alt="bot icon"
                              className="w-8 rounded-full xsm:w-full aspect-square"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col w-full space-y-6">
                          {thoughts.length > 0 && (
                            <div className="pt-1.5 pb-4 pl-8">
                              <ol className="relative flex flex-col text-muted border-border border-s [&>*:last-child]:mb-0">
                                {thoughts.map((thought, index) => {
                                  return (
                                    <ThoughtCard
                                      name={thought}
                                      theme={theme}
                                      key={index}
                                      loading={false}
                                    />
                                  );
                                })}
                              </ol>
                            </div>
                          )}

                          <div className="px-4 prose-sm prose text-muted xsm:prose-base prose-a:text-link prose-strong:text-muted marker:text-muted max-w-none">
                            <Markdown
                              remarkPlugins={[remarkGfm]}
                              components={MarkDownComponent}
                            >
                              {value}
                            </Markdown>
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <CopyToClipboard
                              text={value}
                              onCopy={() => handleCopy()}
                            >
                              <button className="hover:bg-foreground transition-all duration-300 px-4 py-2.5 text-base border rounded-lg font-normal text-muted border-border flex items-center space-x-2">
                                <span>{copyLoader ? "Copied" : "Copy"}</span>

                                <span className="flex items-center justify-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-muted"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                                    />
                                  </svg>
                                </span>
                              </button>
                            </CopyToClipboard>

                            <div className="flex items-center space-x-4">
                              <span className="flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  dataSlot="icon"
                                  className="w-5 h-5 border-none outline-none cursor-pointer text-muted-foreground hover:text-muted"
                                  data-tooltip-id="tooltip"
                                  data-tooltip-content="Like"
                                  onClick={() => handleReaction(messageId, 1)}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
                                  />
                                </svg>
                              </span>

                              <span className="flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  dataSlot="icon"
                                  className="w-5 h-5 border-none outline-none cursor-pointer text-muted-foreground hover:text-muted"
                                  data-tooltip-id="tooltip"
                                  data-tooltip-content="Dislike"
                                  onClick={() => handleReaction(messageId, 0)}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54"
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            })}

            {isLoading && (
              <div className="py-12 bg-background">
                <div className="max-w-5xl px-6 mx-auto">
                  <div className="flex space-x-2">
                    <div className="flex w-16 xsm:max-w-[60px] xsm:w-full">
                      <div>
                        <img
                          src={
                            theme === "dark"
                              ? "/images/bot-dark.svg"
                              : "/images/bot.svg"
                          }
                          alt="bot icon"
                          className="w-8 rounded-full xsm:w-full aspect-square"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col w-full space-y-6">
                      {skeletonLoader && thoughts.length === 0 && (
                        <div
                          role="status"
                          className="w-full px-6 mx-auto animate-pulse"
                        >
                          <div className="w-56 h-2 mb-4 rounded-full bg-foreground"></div>
                          <div className="mb-2.5 h-2 max-w-sm rounded-full bg-foreground"></div>
                          <div className="mb-2.5 h-2 rounded-full bg-foreground"></div>
                          <div className="mb-2.5 h-2 max-w-2xl w-full rounded-full bg-foreground"></div>
                          <div className="mb-2.5 h-2 max-w-xl w-full rounded-full bg-foreground"></div>
                          <div className="h-2 max-w-xs rounded-full bg-foreground"></div>
                          <span className="sr-only">Loading...</span>
                        </div>
                      )}

                      {thoughts.length > 0 && (
                        <div className="pb-4 pl-8 pt-1.5">
                          <ol className="relative flex flex-col text-muted border-border border-s [&>*:last-child]:mb-0">
                            {thoughts.map((thought, index) => {
                              return (
                                <ThoughtCard
                                  name={thought}
                                  theme={theme}
                                  key={index}
                                  loading={
                                    index === thoughts.length - 1 &&
                                    loadingState
                                  }
                                />
                              );
                            })}
                          </ol>
                        </div>
                      )}

                      <div className="flex flex-col w-full px-4 prose-sm prose xsm:prose-base text-muted max-w-none prose-a:text-link marker:text-muted prose-strong:text-muted">
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={MarkDownComponent}
                        >
                          {responseStream.join("")}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 flex items-center justify-center w-full pb-2 xsm:px-4 xsm:pb-6">
          <div className="relative w-full max-w-5xl px-4">
            <input
              type="text"
              className="w-full py-4 pl-4 pr-16 text-lg font-normal border outline-none xsm:pr-20 xsm:pl-8 xsm:text-xl xsm:py-6 rounded-xl bg-foreground focus:bg-foreground text-accent placeholder:text-muted-foreground placeholder:font-normal border-border"
              placeholder={
                isLoading ? "Agent is thinking..." : "Ask me anything..."
              }
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              value={prompt}
            />

            <span></span>

            {isLoading || (
              <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 right-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 transition-all duration-300 cursor-pointer text-muted-foreground hover:scale-110"
                  onClick={() => fetchData(prompt)}
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </span>
            )}

            {isLoading && (
              <span className="absolute flex items-center justify-center -translate-y-1/2 top-1/2 right-10">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6 text-muted-foreground animate-spin fill-muted"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
              </span>
            )}
          </div>
        </div>

        <div ref={scrollRef}></div>
      </div>

      <TrendingSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        fetchData={fetchData}
      />

      <FeedbackModal />
    </div>
  );
};

export default Chat;
