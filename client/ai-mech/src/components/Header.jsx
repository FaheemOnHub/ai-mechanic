// import React from "react";
// import logo from "../assets/logo.png";
// const Header = () => {
//   return (
//     <div>
//       <header className="rounded-lg  flex justify-between p-4 mx-auto">
//         <a href="/" className="flex flex-row justify-center items-center">
//           <img src={logo} alt="" className="h-20 w-20 bg-white rounded-2xl" />
//           {/* <h1 className="p-4 text-3xl font-montserrat">
//             Vehicle Mechanic Assistant
//           </h1> */}
//         </a>

//         <div className=" hidden flex-row sm:flex  justify-end gap-10 items-center text-lg font-poppins text-white">
//           <a href="/">Home</a>
//           <a href="/about">About Us</a>
//           <a href="/quizzes">How it works</a>
//         </div>
//       </header>
//       <div className="hero-section flex flex-col justify-center items-center text-white">
//         <h1 className="flex-1 font-poppins font-semibold text-[52px] text-white ">
//           AI-Powered <br className="sm:block hidden" />{" "}
//           <span className="text-gradient">Vehicle Diagnosis</span>
//         </h1>

//         <h1 className="font-poppins font-semibold  text-[52px] text-white ">
//           at Your Fingertips
//         </h1>
//         <p className="text-lg  mt-10  font-poppins font-normal text-dimWhite text-[18px] leading-[30.8px]">
//           Get accurate and efficient vehicle diagnostics using cutting-edge
//           artificial intelligence technology.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Header;
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
// import { ModeToggle } from "./ui/";
import { Car, Menu } from "lucide-react";
import { Github } from "lucide-react";
const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <span className="font-bold text-xl">
              Vehicle Mechanic Assistant
            </span>
          </Link>
          {/* <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/about">About Us</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/how-it-works">How it works</Link>
            </Button>
            
          </nav> */}
          {
            <nav>
              <Link
                to="https://github.com/FaheemOnHub/ai-mechanic"
                target="blank"
              >
                <Github />
              </Link>
            </nav>
          }
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <div className="bg-accent">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered Vehicle Diagnosis
          </h1>
          <p className="text-xl mb-8">
            Get accurate and efficient vehicle diagnostics using cutting-edge
            artificial intelligence technology.
          </p>
          <Button size="lg" asChild>
            <Link to="/how-it-works">How it works</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
