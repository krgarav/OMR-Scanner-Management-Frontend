import React, { useState } from "react";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import CommentIcon from "@mui/icons-material/Comment";
import { useContext } from "react";
import dataContext from "../Store/DataContext";

function RenderRow(props) {
  const { index, style, checked, handleToggle } = props;
  const dataCtx = useContext(dataContext);
  const value = index % 4;
  const labelId = `checkbox-list-label-${value}`;

  return (
    <ListItem
      key={value}
      style={style}
      secondaryAction={
        <IconButton edge="end" aria-label="comments">
          <CommentIcon />
        </IconButton>
      }
      disablePadding
    >
      <ListItemButton
        role={undefined}
        onClick={() => handleToggle(value)}
        dense
      >
        <ListItemIcon>
          <Checkbox
            edge="start"
            checked={checked.indexOf(value) !== -1}
            tabIndex={-1}
            disableRipple
            inputProps={{ "aria-labelledby": labelId }}
          />
        </ListItemIcon>
        <ListItemText id={labelId} primary={`Line item ${value + 1}`} />
      </ListItemButton>
    </ListItem>
  );
}

const OptimisedList = () => {
  const [checked, setChecked] = useState([]);
  const dataCtx = useContext(dataContext);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    dataCtx.addToSkippingKey(newChecked);
    setChecked(newChecked);
  };
  const headerList = dataCtx.csvHeader.map((item, index) => {
    const labelId = `checkbox-list-label-${item}`;
    return (
      <ListItem
        key={index}
        secondaryAction={
          <IconButton edge="end" aria-label="comments">
            <CommentIcon />
          </IconButton>
        }
        disablePadding
      >
        <ListItemButton role={undefined} onClick={handleToggle(item)} dense>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={checked.indexOf(item) !== -1}
              tabIndex={-1}
              disableRipple
              inputProps={{ "aria-labelledby": labelId }}
            />
          </ListItemIcon>
          <ListItemText id={labelId} primary={`${item} `} />
        </ListItemButton>
      </ListItem>
    );
  });

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "40dvh",
        maxHeight: "40dvh",
        // bgcolor: "background.paper",
        overflowY: "scroll",
        display: "flex",
        flexDirection: "column",
        // backgroundColor: "transparent",
        bgcolor: "transparent"
      }}
    >
      {dataCtx.csvHeader.length === 0 && (
        <div className="mt-20">
          <h1 className="flex justify-center align-middle">
            <strong>No Header Present</strong>
          </h1>
          <h2 className="flex justify-center align-middle">
            Please select CSV files
          </h2>
        </div>
      )}
      {dataCtx.csvHeader.length !== 0 && headerList}
    </Box>
  );
};

export default OptimisedList;
