import React, { useContext, useEffect, useState } from "react";
import dataContext from "../../Store/DataContext";
import classes from "./Correction.module.css";
import { Button, Tooltip } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Table from "../../UI/Table";
import { useNavigate } from "react-router";
import DownloadIcon from "@mui/icons-material/Download";
import { useLocation } from "react-router";
import { toast } from "react-toastify";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
const Correction = () => {
  const [currIndex, setCurrIndex] = useState(0);
  const dataCtx = useContext(dataContext);
  const state = dataCtx.imageMappedData;
  const location = useLocation();
  const lengthOfResult = location.state?.length;
  const navigate = useNavigate();

  // const toggleZoom = (e) => {
  //   console.log(e.currentTarget.style.cursor);
  //   if (e.ctrlKey) {
  //     setZoomLevel(1); // Zoom out
  //   } else {
  //     setZoomLevel(2); // Zoom in
  //   }
  // };

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if (e.key === "Control") {
  //       document.querySelector(".zoomable-image").style.cursor = "zoom-out";
  //     }
  //   };

  //   const handleKeyUp = () => {
  //     document.querySelector(".zoomable-image").style.cursor = "zoom-in";
  //   };

  //   document.addEventListener("keydown", handleKeyDown);
  //   document.addEventListener("keyup", handleKeyUp);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //     document.removeEventListener("keyup", handleKeyUp);
  //   };
  // }, []);

  useEffect(() => {
    if (dataCtx.imageMappedData.length === 0) {
      navigate("/comparecsv", { replace: true });
    }
  }, []);

  useEffect(() => {
    const confirmExit = (e) => {
      // Display a confirmation message
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
    console.log("called");
    // window.confirm("Hello")

    const handlePopstate = (e) => {
      console.log("treig")
      // Display a confirmation message
      window.confirm()
      const confirmationMessage = "Are you sure you want to leave this page?";
      if (!window.confirm(confirmationMessage)) {
        // Prevent navigation if the user cancels
        window.history.pushState(null, "", window.location.href);
      }
    };
  
    // Add event listener when the component mounts
    window.addEventListener("popstate", handlePopstate);
  
    // Remove event listener when the component unmounts
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [location]); // Empty dependency array to run effect only once on mount
   // Empty dependency array to run effect only once on mount
  
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
    const date = new Date().toJSON();
    link.download = `data_${date}.csv`;
    link.click();
    toast.success("Downloaded the corrected csv file", {
      position: "bottom-left",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return (
    <>
      <div
        className={`flex lg:flex-row md:flex-col justify-between animate-slide-left-to-right ${classes.correction} `}
      >
        {state.length !== 0 && (
          <div className="w-full pt-20">
            <div className={`flex justify-center w-full ${classes.imgdiv}`}>
              <h1
                className={`font-bold lg:text-2xl md:text-xl sm:text-lg ${classes.imgHead}`}
              >
                Image Name : {state[currIndex].img.imgName}
              </h1>
              <Tooltip
                title="Use mouse scroll wheel to zoom in and zoom out"
                className="cursor-pointer float-right ml-3"
                arrow
              >
                <InfoRoundedIcon />
              </Tooltip>
            </div>
            <div className="overflow-hidden flex justify-center pt-2 ">
              <TransformWrapper defaultScale={1}>
                <TransformComponent>
                  <img
                    // key={state[currIndex].img.imgUrl}
                    src={state[currIndex].img.imgUrl}
                    className={`w-full object-contain p-1 ${classes.imgContainer} zoomable-image   rounded`}
                    alt="omr sheet"
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>
        )}
        {state.length !== 0 && (
          <div className="w-full pt-20 pr-5">
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
