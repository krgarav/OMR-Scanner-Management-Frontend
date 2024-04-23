import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Auth/Login";
import CreateUser from "./pages/Admin/CreateUser";
import { AllUser } from "./pages/Admin/AllUser";
import { PageNotFound } from "./pages/PageNotFound";
import { useEffect, useState } from "react";
function App() {
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    setIsLogin(!!storedData);
  }, [isLogin]);
  console.log(isLogin)
  return (
    <BrowserRouter>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
