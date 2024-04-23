import React, { useContext, useEffect, useState } from "react";
import dataContext from "../../Store/DataContext";
import classes from "./Correction.module.css";
import { Button } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Table from "../../UI/Table";
import { useNavigate } from "react-router";
import DownloadIcon from "@mui/icons-material/Download";
import { useLocation } from "react-router";
import Navbar from "../../components/Navbar/Navbar";

const Correction = () => {
  const [currIndex, setCurrIndex] = useState(0);
  const dataCtx = useContext(dataContext);
  const state = dataCtx.imageMappedData;
  const obj = useLocation();
  const lengthOfResult = obj.state.length;

  const navigate = useNavigate();
  console.log(obj.pathname);
  useEffect(() => {
    if (dataCtx.imageMappedData.length === 0) {
      navigate("/comparecsv", { replace: true });
    }
  }, []);

  useEffect(() => {
    const confirmExit = (e) => {
      // Cancel the event
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = "";

      // Optionally, display a confirmation dialog
      const confirmationMessage =
        "Are you sure you want to leave this page? Please download corrected CSV before closing this page.";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    // Add event listener when the component mounts
    window.addEventListener("beforeunload", confirmExit);

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", confirmExit);
    };
  }, []); // Empty dependency array to run effect only once on mount
  useEffect(() => {
    const handleBackButton = (event) => {
      console.log("trig");
      const confirmationMessage =
        "Are you sure you want to leave this page? Please download corrected CSV before closing this page.";
      event.returnValue = confirmationMessage; // For Chrome
      return confirmationMessage; // For other browsers
    };

    // Add event listener for popstate when the component mounts
    window.addEventListener("popstate", handleBackButton);

    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);
  useEffect(() => {
    document.body.style.userSelect = "none";
    return () => {
      // Cleanup function to reset the style when the component unmounts
      document.body.style.userSelect = "auto";
    };
  }, []);

  const prevHandler = () => {
    setCurrIndex((prev) => {
      if (prev === 0) {
        return prev;
      } else {
        return prev - 1;
      }
    });
  };

  const nextHandler = () => {
    setCurrIndex((prev) => {
      if (prev === lengthOfResult - 1) {
        return prev;
      } else {
        return prev + 1;
      }
    });
  };
  const convertToCsv = (jsonData) => {
    const headers = Object.keys(jsonData[0]);
    const csvHeader = headers.join(",") + "\n";
    const csvData = jsonData
      .map((obj) => {
        return headers.map((key) => obj[key]).join(",");
      })
      .join("\n");
    return csvHeader + csvData;
  };
  const downloadHandler = () => {
    const jsonObj = dataCtx.csvFile; // Assuming dataCtx.csvFile is a JSON object

    // Convert JSON to CSV
    const csvData = convertToCsv(jsonObj);

    // Create a Blob object
    const blob = new Blob([csvData], { type: "text/csv" });

    // Create a download link
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "data.csv";
    link.click();
  };

  return (
    <>
  
      <div
        className={`flex lg:flex-row md:flex-col justify-between animate-slide-left-to-right ${classes.correction} `}
      >
        {state.length !== 0 && (
          <div className="w-full">
            <div className={`text-center text-3xl font-bold ${classes.imgdiv}`}>
              <h1
                className={`text-center text-3xl font-bold ${classes.imgHead}`}
              >
                Image Name : {state[currIndex].img.imgName}
              </h1>
            </div>

            <img
              src={state[currIndex].img.imgUrl}
              className={`w-full  object-contain p-5 ${classes.imgContainer}`}
              alt="omr sheet"
            />
          </div>
        )}
        {state.length !== 0 && (
          <div className="w-full">
            <h1 className="text-center text-3xl font-bold m-5">
              {currIndex + 1} of {state.length}
            </h1>
            <div className="pt-5 pl-4 pr-4 pb-3 h-2/3  bg-opacity-15 bg-black rounded mb-5 mr-5">
              <Table data={state[currIndex].data} />
            </div>

            <div className="flex justify-around">
              <Button
                variant="contained"
                startIcon={<ArrowBackIosIcon />}
                onClick={prevHandler}
              >
                PREV
              </Button>
              <Button
                variant="contained"
                endIcon={<DownloadIcon />}
                onClick={downloadHandler}
                color="secondary"
              >
                DOWNLOAD CORRECTED CSV
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIosIcon />}
                onClick={nextHandler}
              >
                NEXT
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Correction;
