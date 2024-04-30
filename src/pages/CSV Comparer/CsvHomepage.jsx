import Customselect from "../../UI/Customselect";
import Input from "../../UI/Input";
import Fab from "@mui/material/Fab";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import OptimisedList from "../../UI/OptimisedList";
import Button from "@mui/material/Button";
import { useContext, useEffect } from "react";
import dataContext from "../../Store/DataContext";
import axios from "axios";
import { useNavigate } from "react-router";
import classes from "./CSVHompage.module.css";
import { REACT_APP_IP } from "../../services/common";

const CsvHomepage = () => {
  const navigate = useNavigate();
  const dataCtx = useContext(dataContext);

  const token = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    dataCtx.addToCsvHeader([]);
  }, []);
  useEffect(() => {
    document.body.style.userSelect = "none";
    return () => {
      // Cleanup function to reset the style when the component unmounts
      document.body.style.userSelect = "auto";
    };
  }, []);
  const compareHandler = () => {
    const {
      primaryKey,
      skippingKey,
      firstInputFileName,
      secondInputFileName,
      firstInputCsvFiles,
      secondInputCsvFiles,
      imageColName,
      zipImageFile,
    } = dataCtx;
    if (firstInputCsvFiles.length === 0) {
      alert("Choose first CSV file");
      return;
    } else if (secondInputCsvFiles.length === 0) {
      alert("Choose second CSV file");
      return;
    } else if (zipImageFile.length === 0) {
      alert("Please select image zip file");
    } else if (primaryKey === "") {
      alert("Please select primary key");
      return;
    } else if (imageColName === "") {
      alert("Please select image column name");
    }

    const sendRequest = async () => {
      // Create a FormData object
      try {
        const formData = new FormData();
        // Append file data to FormData
        formData.append("firstInputCsvFile", firstInputCsvFiles);
        formData.append("secondInputCsvFile", secondInputCsvFiles);

        // Append other parameters to FormData
        formData.append("firstInputFileName", firstInputFileName);
        formData.append("secondInputFileName", secondInputFileName);
        formData.append("primaryKey", primaryKey);
        formData.append("skippingKey", skippingKey);
        formData.append("imageColName", imageColName);

        // Make the POST request with Axios
        const response = await axios.post(
          `http://${REACT_APP_IP}:4000/compareData`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              token: token,
            },
          }
        );
        console.log(response.data.csvFile);
        dataCtx.setCsvFile(response.data.csvFile);
        const modifiedRes = response.data.data.map((item) => {
          return { ...item, corrected: "" };
        });
        dataCtx.addToCorrectedCsv(modifiedRes);
        // const csvData = response.data;
        // const blob = new Blob([csvData], { type: "text/csv" });

        // // Create a temporary URL for the Blob
        // const url = URL.createObjectURL(blob);

        // // Create a link element
        // const link = document.createElement("a");
        // link.href = url;
        // link.download = "data.csv"; // Set the filename for the downloaded file
        // document.body.appendChild(link);

        // //  link to trigger the download
        // link.click();

        // // Cleanup: Remove the link and revoke the URL
        // document.body.removeChild(link);
        // URL.revokeObjectURL(url);
        // Handle response

        const imgFile = dataCtx.zipImageFile;
        const allRes = response.data.data;
        const objArr = [];

        for (let i = 0; i < allRes.length; i++) {
          for (let j = 0; j < imgFile.length; j++) {
            if (
              allRes[i]["IMAGE_NAME"].replace(/^0+/, "") ===
              imgFile[j].imgName.replace(/^0+/, "")
            ) {
              const obj = {
                data: { ...allRes[i], corrected: "" },
                img: imgFile[j],
              };
              objArr.push(obj);
            }
          }
        }
        dataCtx.setImageMappedData(objArr);
        navigate("/comparecsv/correct_compare_csv", { state: objArr });
      } catch (err) {
        alert("Error Occured : ", err);
        console.log(err);
      }
    };
    sendRequest();
  };
  return (
    <>
      <main
        className={`flex flex-col gap-5 bg-white rounded-md ${classes.homepage}`}
      >
        <div
          className={`border-dashed pt-24 px-5 rounded-md  ${classes.innerBox}`}
        >
          <h1 className="text-center mb-6 text-black-300 text-2xl font-bold">
            MATCH AND COMPARE DATA
          </h1>
          <div className="flex flex-row justify-between  gap-10 mb-6">
            <Input label="Select Paper 1" state="first" type="text/csv" />
            <Input label="Select Paper 2" state="second" type="text/csv" />
            <Input
              label="Select Image Zipfile"
              state="third"
              type="application/zip,application/x-zip-compressed"
            />
          </div>
          <div className="flex flex-row justify-between  gap-10 mb-6">
            <div className="w-1/2">
              <Customselect label="Select Primary Key" />
            </div>
            <div className="w-1/2">
              <Customselect label="Select Image Column" />
            </div>
          </div>

          <div className="flex justify-between ">
            <div className="bg-opacity-60 border pl-2 pb-2  bg-slate-100 rounded lg:w-1/3  ">
              <div className="flex flex-row pt-2 pb-2 justify-between self-center ">
                <p className="text-sm font-semibold align-bottom self-center ">
                  Select Key For Skipping Comparison
                </p>
                <Button>Clear All</Button>
              </div>
              <OptimisedList />
            </div>
            <div></div>

            <div className="flex self-end">
              <Fab variant="extended" color="primary" onClick={compareHandler}>
                <CompareArrowsIcon sx={{ mr: 1 }} />
                Compare And Match
              </Fab>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CsvHomepage;
