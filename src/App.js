import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Auth/Login";
import CreateUser from "./pages/Admin/CreateUser";
import { AllUser } from "./pages/Admin/AllUser";
import { PageNotFound } from "./pages/PageNotFound";
import { useContext } from "react";
import CsvHomepage from "./pages/CSV Comparer/CsvHomepage";
import Correction from "./pages/CSV Comparer/Correction";
import ImageUploader from "./pages/ImageUploader/ImageUploader";
import ImageScanner from "./pages/ImageScanner/ImageScanner";
import dataContext from "./Store/DataContext";
import CsvUploader from "./pages/CsvUploader/CsvUploader";
<<<<<<< HEAD
import HomePage from "./components/Navbar/Navbar"
=======
import TemplateMapping from "./pages/TemplateMapping/TemplateMapping";
import HomePageTest from "./pages/HomePageTest";
import ResultGenerationProvider from "./Store/ResultGenerationProvider";

>>>>>>> 1b41835a249846cf2513475c02453d6ad9c9b75b
function App() {
  const datactx = useContext(dataContext);

  return (
    <BrowserRouter>
      {datactx.isLogin && <HomePage />}
      <Routes>
        {datactx.isLogin && (
          <>
            <Route path="/home" element={""} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/all-user" element={<AllUser />} />
            <Route path="/comparecsv" element={<CsvHomepage />} />
            <Route
              path="/comparecsv/correct_compare_csv"
              element={<Correction />}
            />
            <Route path="/imageuploader" element={<ImageUploader />} />
            <Route path="/imageuploader/scanner" element={<ImageScanner />} />
            <Route path="/csvuploader" element={<CsvUploader />} />
            <Route
              path="/csvuploader/templatemap/:id"
              element={<TemplateMapping />}
            />

            <Route path="/templatemap/:id" element={<TemplateMapping />} />
            <Route
              path="/resultGeneration"
              element={
                <ResultGenerationProvider>
                  <HomePageTest />
                </ResultGenerationProvider>
              }
            />
            <Route
              path="*"
              element={
                <PageNotFound errorMessage="Page Not Found" errorCode="404" />
              }
            />
          </>
        )}

        {!datactx.isLogin && (
          <>
            <Route path="/" element={<Login />} />
            <Route
              path="*"
              element={
                <PageNotFound
                  errorMessage="User Not Authorised"
                  errorCode="401"
                />
              }
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
