import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProblemInput from "./pages/ProblemInput";

const App = () => {
  return (
    <Router>
      <div className="bg-primary ">
        <Header />
        <Routes>
          <Route path="/" element={<ProblemInput />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
