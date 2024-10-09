import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ThemeProvider } from "/components/ui/theme-provider";
import Header from "./components/Header";
import ProblemInput from "./pages/ProblemInput";
import HowitWorks from "./pages/HowitWorks";

const App = () => {
  return (
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
  );
};

export default App;
