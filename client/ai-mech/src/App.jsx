// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Header from "./components/Header";
// import ProblemInput from "./pages/ProblemInput";

// const App = () => {
//   return (
//     <Router>
//       <div className="bg-primary ">
//         <Header />
//         <Routes>
//           <Route path="/" element={<ProblemInput />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ThemeProvider } from "/components/ui/theme-provider";
import Header from "./components/Header";
import ProblemInput from "./pages/ProblemInput";
import HowitWorks from "./pages/HowitWorks";

const App = () => {
  return (
    // <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ProblemInput />} />
            <Route path="/how-it-works" element={<HowitWorks />} />
          </Routes>
        </main>
      </div>
    </Router>
    // </ThemeProvider>
  );
};

export default App;
