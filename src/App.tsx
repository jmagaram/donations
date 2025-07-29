import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Header";
import Home from "./Home";
import Organizations from "./Organizations";
import "./App.css";
import { useState } from "react";
import { sampleData } from "./donationsData";
import { DonationsDataSchema } from "./types";

function App() {
  const [donationsData, setDonationsData] = useState(() => {
    const saved = localStorage.getItem("donationsData");
    return saved ? DonationsDataSchema.parse(JSON.parse(saved)) : sampleData();
  });

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orgs" element={<Organizations />} />
      </Routes>
    </Router>
  );
}

export default App;
