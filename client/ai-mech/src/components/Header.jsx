import React from "react";
import logo from "../assets/logo.png";
const Header = () => {
  return (
    <div>
      <header className="rounded-lg  flex justify-between p-4 mx-auto">
        <a href="/" className="flex flex-row justify-center items-center">
          <img src={logo} alt="" className="h-20 w-20 bg-white rounded-2xl" />
          {/* <h1 className="p-4 text-3xl font-montserrat">
            Vehicle Mechanic Assistant
          </h1> */}
        </a>

        <div className=" hidden flex-row sm:flex  justify-end gap-10 items-center text-lg font-poppins text-white">
          <a href="/">Home</a>
          <a href="/about">About Us</a>
          <a href="/quizzes">How it works</a>
        </div>
      </header>
      <div className="hero-section flex flex-col justify-center items-center text-white">
        <h1 className="flex-1 font-poppins font-semibold text-[52px] text-white ">
          AI-Powered <br className="sm:block hidden" />{" "}
          <span className="text-gradient">Vehicle Diagnosis</span>
        </h1>

        <h1 className="font-poppins font-semibold  text-[52px] text-white ">
          at Your Fingertips
        </h1>
        <p className="text-lg  mt-10  font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px]">
          Get accurate and efficient vehicle diagnostics using cutting-edge
          artificial intelligence technology.
        </p>
      </div>
    </div>
  );
};

export default Header;
