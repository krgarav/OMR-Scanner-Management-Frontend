import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Auth/Login";
import CreateUser from "./pages/Admin/CreateUser";
import { AllUser } from "./pages/Admin/AllUser";
import { PageNotFound } from "./pages/PageNotFound";
import { useEffect, useState } from "react";
import CsvHomepage from "./pages/CSV Comparer/CsvHomepage";
import Correction from "./pages/CSV Comparer/Correction";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    setIsLogin(!!storedData);
  }, [isLogin]);
  console.log(isLogin)
  return (
    <BrowserRouter>
    <HomePage />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/home"
          element={isLogin ? <PageNotFound  /> : <HomePage />}
        />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/all-user" element={<AllUser />} />
        <Route path="/page-not-found" element={<PageNotFound />} />
        <Route path= "*" element={<PageNotFound />} />
        <Route path="/comparecsv" element={<CsvHomepage />} />
        <Route path="/correct_compare_csv" element={<Correction />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
