import React, { useContext } from "react";
import Link from "next/link";
import { ThemeContext } from "./_app";
import HomeData from "@/data/Home.json";

const Home = () => {
  const { theme, handleTheme } = useContext(ThemeContext);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen px-4 py-14 bg-background">
        <div className="w-full mx-auto space-y-6 max-w-7xl">
          <div className="flex items-center justify-center w-full bg-background">
            <div className="flex w-full max-w-3xl space-x-8">
              <div className="max-w-[170px] w-full">
                {theme === "dark" ? (
                  <img
                    src={HomeData.dark_logo}
                    alt="bot icon"
                    className="rounded-full w-72 aspect-square"
                  />
                ) : (
                  <img
                    src={HomeData.light_logo}
                    alt="bot icon"
                    className="rounded-full w-72 aspect-square"
                  />
                )}
              </div>

              <div className="flex flex-col items-start space-y-8">
                <div className="space-y-6">
                  <h1 className="text-3xl font-bold text-accent">
                    {HomeData.title}
                  </h1>

                  <p className="text-base font-normal leading-8 text-accent">
                    {HomeData.description}
                  </p>
                </div>

                <Link
                  href="/chat"
                  className="flex items-center justify-center px-6 py-4 space-x-2 text-sm font-medium transition-all duration-300 rounded-lg bg-secondary hover:bg-secondary-foreground text-accent-foreground"
                >
                  <span>{HomeData.button}</span>
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
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
