import React, { useContext, useEffect, useRef, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import dataContext from "../Store/DataContext";
import { toast } from "react-toastify";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const TableCol = (props) => {
  const [resultObj, setResultObj] = useState([]);
  const inputRef = useRef();
  const dataCtx = useContext(dataContext);

  useEffect(() => {
    inputRef.current.value = props.data.corrected;
  }, [dataCtx.imageMappedData, props.data]);
  useEffect(() => {
    setResultObj(props.data);
  }, [props.data]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === "s") {
        const btn = document.getElementById("saveBtn");
        btn.click();
      }
    };

    // Attach the event listener when the component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const rows = [
    createData(
      resultObj.PRIMARY,
      resultObj.COLUMN_NAME,
      resultObj.FILE_1_DATA,
      resultObj.FILE_2_DATA
    ),
  ];
  const save = () => {
    const csvFile = dataCtx.csvFile;
    for (let i = 0; i < csvFile.length; i++) {
      if (csvFile[i][dataCtx.primaryKey].trim() === resultObj.PRIMARY.trim()) {
        csvFile[i][resultObj.COLUMN_NAME] = inputRef.current.value;
      }
    }
    const mappedData = [...dataCtx.imageMappedData];
    for (let j = 0; j < mappedData.length; j++) {
      if (mappedData[j].data.PRIMARY.trim() === resultObj.PRIMARY.trim()) {
        mappedData[j].data.corrected = inputRef.current.value;
      }
    }
    dataCtx.setImageMappedData(mappedData);
    dataCtx.setCsvFile(csvFile);
  };
  const saveHandler = () => {
   
    if (
      typeof resultObj.FILE_1_DATA === "string" ||
      typeof resultObj.FILE_2_DATA === "string"
    ) {
      if (!isNaN(inputRef.current.value)) {
        var result = window.confirm("Please check the string");
        if (result) {
          save();
          toast.success("Saved file successfully", {
            position: "bottom-left",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        } else {
          toast.warning("File Not Saved", {
            position: "bottom-left",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        }
        return;
      } else {
        save();
        toast.success("Saved file successfully", {
          position: "bottom-left",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    } else if (
      typeof resultObj.FILE_1_DATA === "number" ||
      typeof resultObj.FILE_2_DATA === "number"
    ) {
      if (isNaN(inputRef.current.value)) {
        alert("Please check the string");
      }
    } else {
      save();
      toast.success("Saved file successfully", {
        position: "bottom-left",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="caption table">
        <caption>
          Match and correct the data According to above data table
        </caption>
        <TableHead>
          <TableRow>
            <TableCell>PRIMARY</TableCell>
            <TableCell align="right">COLUMN_NAME</TableCell>
            <TableCell align="right">FILE_1_DATA</TableCell>
            <TableCell align="right">FILE_2_DATA</TableCell>
            <TableCell align="right">ENTER CORRECTED DATA</TableCell>
            <TableCell align="right">SAVE BUTTON</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {dataCtx.primaryKey} : {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
              <TableCell align="right">
                <input
                  type="text"
                  placeholder="Enter correct answer"
                  className="border p-3 w-2/3"
                  ref={inputRef}
                  defaultValue={props.data.corrected}
                />
              </TableCell>
              <TableCell align="right">
                <Button
                  startIcon={<SaveIcon />}
                  variant="outlined"
                  color="success"
                  onClick={saveHandler}
                  id="saveBtn"
                >
                  SAVE
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableCol;
