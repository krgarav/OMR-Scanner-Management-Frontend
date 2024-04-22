import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Auth/Login";
import CreateUser from "./pages/Admin/CreateUser";
import { AllUser } from "./pages/Admin/AllUser";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />}>
          <Route path="create-user" element={<CreateUser />} />
        <Route path="all-user" element={<AllUser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
