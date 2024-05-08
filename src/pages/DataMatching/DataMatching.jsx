import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { toast } from "react-toastify";
import {
  onGetTaskHandler,
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
  REACT_APP_IP,
} from "../../services/common";
import Button from "@mui/material/Button";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate } from "react-router-dom";
import AdminAssined from "./AdminAssined";

const DataMatching = () => {
  const [popUp, setPopUp] = useState(true);
  const [imageUrl, setImageUrl] = useState();
  const [templateHeaders, setTemplateHeaders] = useState();
  const [csvCurrentData, setCsvCurrentData] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [imageColName, setImageColName] = useState("");
  const [currentTaskData, setCurrentTaskData] = useState({});
  const [selectedCoordintes, setSelectedCoordinates] = useState(false);
  const [currImageName, setCurrImageName] = useState("");
  const [imageNotFound, setImageNotFound] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [compareTask, setCompareTask] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [userRole, setUserRole] = useState();
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const token = JSON.parse(localStorage.getItem("userData"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const verifiedUser = await onGetVerifiedUserHandler();

        setUserRole(verifiedUser.user.role);
        const tasks = await onGetTaskHandler(verifiedUser.user.id);
        const templateData = await onGetTemplateHandler();

        const uploadTask = tasks.filter((task) => {
          return task.moduleType === "Data Entry";
        });
        const comTask = tasks.filter((task) => {
          return task.moduleType === "CSV Compare";
        });

        const updatedCompareTasks = comTask.map((task) => {
          const matchedTemplate = templateData.find(
            (template) => template.id === parseInt(task.templeteId)
          );
          if (matchedTemplate) {
            return {
              ...task,
              templateName: matchedTemplate.name,
            };
          }
          return task;
        });
        const updatedTasks = uploadTask.map((task) => {
          const matchedTemplate = templateData.find(
            (template) => template.id === parseInt(task.templeteId)
          );
          if (matchedTemplate) {
            return {
              ...task,
              templateName: matchedTemplate.name,
            };
          }
          return task;
        });
        setAllTasks(updatedTasks);
        setCompareTask(updatedCompareTasks);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentUser();
  }, [popUp]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        const templateData = response.find(
          (data) => data.id === parseInt(currentTaskData.templeteId)
        );
        setTemplateHeaders(templateData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, [currentTaskData]);

  const onCsvUpdateHandler = async () => {
    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/updatecsvdata/${parseInt(
          currentTaskData?.fileId
        )}`,
        {
          data: csvCurrentData,
          index: currentIndex + Number(currentTaskData.min),
        },
        {
          headers: {
            token: token,
          },
        }
      );

      setCsvData((prevCsvData) => {
        const newCsvData = [...prevCsvData];
        newCsvData[currentIndex] = csvCurrentData;
        return newCsvData;
      });

      toast.success("Data update successfully.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        onImageHandler("prev", csvData, currentTaskData);
      } else if (event.key === "ArrowRight") {
        onImageHandler("next", csvData, currentTaskData);
      } else if (event.altKey && event.key === "s") {
        setCsvCurrentData((prevData) => ({
          ...prevData,
        }));
        onCsvUpdateHandler();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [csvData, currentTaskData, setCsvCurrentData, onCsvUpdateHandler]);

  const onImageHandler = async (direction, csvData, taskData) => {
    const headers = csvData[0];
    const getKeyByValue = (object, value) => {
      return Object.keys(object).find((key) => object[key] === value);
    };

    const keyForImage = getKeyByValue(headers, "Image");
    setImageColName(keyForImage);
    try {
      let imageName1;
      let newIndex = Number(taskData.currentIndex) - Number(taskData.min) + 1;
      // let newIndex = currentIndex;

      if (direction === "initial") {
        const objects = csvData[newIndex];
        imageName1 = objects[keyForImage];
        setCsvCurrentData(objects);
        // newIndex = newIndex + 1;
      } else {
        newIndex = direction === "next" ? newIndex + 1 : newIndex - 1;
        if (newIndex > 0 && newIndex < csvData.length) {
          setCurrentIndex(newIndex);
          const objects = csvData[newIndex];
          imageName1 = objects[keyForImage];
          setCsvCurrentData(objects);
        } else {
          toast.warning(
            direction === "next"
              ? "All images have been processed."
              : "You are already at the first image."
          );
          return;
        }
      }

      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/get/image`,
        {
          imageName: imageName1,
          currentIndex: newIndex + Number(taskData.min) - 1,
          id: taskData.id,
        },
        {
          headers: {
            token: token,
          },
        }
      );
      const url = response.data?.base64Image;
      const pathParts = imageName1?.split("/");
      setCurrImageName(pathParts[pathParts.length - 1]);
      setCurrentTaskData((prevData) => {
        if (direction === "next") {
          return {
            ...prevData,
            currentIndex: parseInt(prevData.currentIndex) + 1,
          };
        } else if (direction === "prev") {
          return {
            ...prevData,
            currentIndex: parseInt(prevData.currentIndex) - 1,
          };
        } else {
          console.error("Invalid direction:", direction);
          return prevData;
        }
      });

      setImageUrl(url);
      setImageNotFound(true);
      setPopUp(false);
    } catch (error) {
      toast.error("Image not found!.");
      setImageNotFound(false);
    }
  };

  const changeCurrentCsvDataHandler = (key, value) => {
    if (!imageNotFound) {
      return;
    }

    setCsvCurrentData((prevData) => ({
      ...prevData,
      [key]: value,
    }));

    console.log(csvCurrentData);
  };

  //   const onCsvUpdateHandler = async () => {
  //     // const updatedData = [...csvData];
  //     // updatedData[currentIndex] = csvCurrentData;
  //     // setCsvData(updatedData);
  //     // console.log(csvCurrentData);
  //     try {
  //       await axios.post(
  //         `http://${REACT_APP_IP}:4000/updatecsvdata/${parseInt(
  //           currentTaskData?.fileId
  //         )}`,
  //         {
  //           data: csvCurrentData,
  //           index: currentIndex + Number(currentTaskData.min),
  //         },
  //         {
  //           headers: {
  //             token: token,
  //           },
  //         }
  //       );

  //       setCsvData((prevCsvData) => {
  //         const newCsvData = [...prevCsvData];
  //         newCsvData[currentIndex] = csvCurrentData;
  //         return newCsvData;
  //       });

  //       toast.success("Data update successfully.");
  //     } catch (error) {
  //       toast.error(error.message);
  //     }
  //   };

  const imageFocusHandler = (headerName) => {
    if (!imageNotFound) {
      return;
    }

    if (!imageUrl || !imageContainerRef || !imageRef) {
      setPopUp(true);
    }

    if (!csvData[0].hasOwnProperty(headerName)) {
      toast.error("Header not found: " + headerName);
      return;
    }

    const metaDataEntry = templateHeaders.templetedata.find(
      (entry) => entry.attribute === csvData[0][headerName]
    );

    if (!metaDataEntry) {
      toast.warning("Metadata entry not found for " + headerName);
      return;
    }

    const { coordinateX, coordinateY, width, height } = metaDataEntry;

    const containerWidth = imageContainerRef?.current?.offsetWidth;
    const containerHeight = imageContainerRef?.current?.offsetHeight;

    // Calculate the zoom level based on the container size and the selected area size
    const zoomLevel = Math.min(
      containerWidth / width,
      containerHeight / height
    );

    // Calculate the scroll position to center the selected area
    const scrollX =
      coordinateX * zoomLevel - containerWidth / 2 + (width / 2) * zoomLevel;
    const scrollY =
      coordinateY * zoomLevel - containerHeight / 2 + (height / 2) * zoomLevel;

    // Update the img element's style property to apply the zoom transformation
    imageRef.current.style.transform = `scale(${zoomLevel})`;
    imageRef.current.style.transformOrigin = `0 0`;

    // Scroll to the calculated position
    imageContainerRef.current.scrollTo({
      left: scrollX,
      top: scrollY,
      behavior: "smooth",
    });
    setSelectedCoordinates(true);
  };

  const onTaskStartHandler = async (taskData) => {
    setCurrentTaskData(taskData);
    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/get/csvdata`,
        { taskData },
        {
          headers: {
            token: token,
          },
        }
      );
      setCsvData(response.data);
      onImageHandler("initial", response.data, taskData);
      setPopUp(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const taskUpdationHandler = async () => {
    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/taskupdation/${currentTaskData.id}`,
        {},
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Task completed successfully.");
      setPopUp(true);
    } catch (error) {}
  };
  const onCompareTaskStartHandler = (taskdata) => {
    console.log(taskdata);

    localStorage.setItem("taskdata", JSON.stringify(taskdata));
    navigate("/datamatching/correct_compare_csv", { state: taskdata });
  };
  console.log(userRole);
  return (
    <>
      {userRole === "Operator" && (
        <div>
          {popUp && (
            <div className=" min-h-[100vh] flex justify-center templatemapping">
              <div className=" mt-40">
                {/* MAIN SECTION  */}
                <section className="mx-auto w-full max-w-7xl  px-12 py-10 bg-white rounded-xl">
                  <div className="flex flex-col space-y-4  md:flex-row md:items-center md:justify-between md:space-y-0">
                    <div>
                      <h2 className="text-3xl font-semibold">Assigned Tasks</h2>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-col">
                    <div className="-mx-4 -my-2  sm:-mx-6 lg:-mx-8">
                      <div className="inline-block  py-2 align-middle md:px-6 lg:px-8">
                        <div className=" border border-gray-200 md:rounded-lg">
                          <div className="divide-y divide-gray-200 ">
                            <div className="bg-gray-50">
                              <div className="flex justify-between items-center">
                                <div className="px-8 py-3.5 text-left text-xl font-semibold text-gray-700">
                                  <span>Templates</span>
                                </div>

                                <div className="px-12 py-3.5 text-left  text-xl font-semibold text-gray-700">
                                  Min
                                </div>

                                <div className="px-12 py-3.5 text-left text-xl font-semibold text-gray-700">
                                  Max
                                </div>
                                <div className="px-16 py-3.5 text-left text-xl font-semibold text-gray-700">
                                  Module Type
                                </div>
                                <div className="px-16 py-3.5 text-left text-xl font-semibold text-gray-700">
                                  Status
                                </div>
                                <div className="px-16 py-3.5 text-left text-xl font-semibold text-gray-700">
                                  Start Task
                                </div>
                              </div>
                            </div>
                            <div className="divide-y divide-gray-200 bg-white overflow-y-auto max-h-[300px]">
                              {allTasks?.map((taskData) => (
                                <div
                                  key={taskData.id}
                                  className="flex justify-between items-center"
                                >
                                  <div className="whitespace-nowrap px-4 py-4 ">
                                    <div className="flex items-center">
                                      <div className="ml-4 w-full font-semibold">
                                        <div className=" px-2">
                                          {taskData.templateName}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                                    <div className="flex">
                                      <div className="w-full font-semibold">
                                        <div className=" px-2">
                                          {taskData.min}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                                    <div className="flex">
                                      <div className="w-full font-semibold">
                                        <div className=" px-2">
                                          {taskData.max}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                                    <div className="flex">
                                      <div className="w-full font-semibold">
                                        <div className=" px-2">
                                          {taskData.moduleType}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 ">
                                    <div className="flex">
                                      <div className="w-full font-semibold">
                                        <div className=" px-2">
                                          <span
                                            className={`inline-flex items-center justify-center rounded-full ${
                                              !taskData.taskStatus
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-emerald-100 text-emerald-700"
                                            } px-2.5 py-0.5 `}
                                          >
                                            {!taskData.taskStatus ? (
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="-ms-1 me-1.5 h-4 w-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                                />
                                              </svg>
                                            ) : (
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="-ms-1 me-1.5 h-4 w-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                              </svg>
                                            )}

                                            <p className="whitespace-nowrap text-sm">
                                              {taskData.taskStatus
                                                ? "Completed"
                                                : "Pending"}
                                            </p>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap px-4 py-4 text-right">
                                    <button
                                      onClick={() =>
                                        onTaskStartHandler(taskData)
                                      }
                                      className="rounded border border-indigo-500 bg-indigo-500 px-10 py-1 font-semibold text-white"
                                    >
                                      Start
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {compareTask?.map((taskData) => (
                                <div
                                  key={taskData.id}
                                  className="flex justify-between items-center"
                                >
                                  <div className="whitespace-nowrap px-4 py-4 ">
                                    <div className="flex items-center">
                                      <div className="ml-4 w-full font-semibold">
                                        <div className=" px-2">
                                          {taskData.templateName}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                                    <div className="flex">
                                      <div className="w-full font-semibold">
                                        <div className=" px-2">
                                          {taskData.min}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                                    <div className="flex">
                                      <div className="w-full font-semibold">
                                        <div className=" px-2">
                                          {taskData.max}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                                    <div className="flex">
                                      <div className="w-full font-semibold">
                                        <div className=" px-2">
                                          {taskData.moduleType}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 ">
                                    <div className="flex">
                                      <div className="w-full font-semibold">
                                        <div className=" px-2">
                                          <span
                                            className={`inline-flex items-center justify-center rounded-full ${
                                              !taskData.taskStatus
                                                ? "bg-amber-100 text-amber-700"
                                                : "bg-emerald-100 text-emerald-700"
                                            } px-2.5 py-0.5 `}
                                          >
                                            {!taskData.taskStatus ? (
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="-ms-1 me-1.5 h-4 w-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                                />
                                              </svg>
                                            ) : (
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="-ms-1 me-1.5 h-4 w-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                              </svg>
                                            )}

                                            <p className="whitespace-nowrap text-sm">
                                              {taskData.taskStatus
                                                ? "Completed"
                                                : "Pending"}
                                            </p>
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="whitespace-nowrap px-4 py-4 text-right">
                                    <button
                                      onClick={() =>
                                        onCompareTaskStartHandler(taskData)
                                      }
                                      className="rounded border border-indigo-500 bg-indigo-500 px-10 py-1 font-semibold text-white"
                                    >
                                      Start
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
          {!popUp && (
            <div className=" flex flex-col lg:flex-row md:flex-col-reverse  bg-gradient-to-r from-[rgb(255,195,36)] to-orange-500">
              {/* LEFT SECTION */}
              <div className=" border-e lg:w-3/12 xl:w-2/12 order-lg-1 second">
                <div className=" flex flex-col overflow-hidden w-[100%]">
                  <article className="p-3 shadow transition pt-28 hover:shadow-lg overflow-auto h-[100vh]">
                    {csvCurrentData &&
                      Object.entries({ ...csvData[0] }).map(
                        ([key, value], i) => {
                          const templateData =
                            templateHeaders?.templetedata.find(
                              (data) =>
                                data.attribute === value &&
                                data.fieldType === "formField"
                            );
                          if (key !== imageColName && templateData) {
                            return (
                              <div
                                key={i}
                                className="w-5/6 px-3 py-1  overflow-x font-bold"
                              >
                                <label className=" w-full overflow-hidden  rounded-md  font-semibold  py-2 shadow-sm  ">
                                  <span className="text-sm text-gray-700 font-bold">
                                    {key?.toUpperCase()}
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  className="mt-1 border-none p-2 focus:border-transparent text-center rounded focus:outline-none focus:ring-0 sm:text-sm w-48"
                                  placeholder={value}
                                  value={csvCurrentData[key]}
                                  onChange={(e) =>
                                    changeCurrentCsvDataHandler(
                                      key,
                                      e.target.value
                                    )
                                  }
                                  onFocus={() => imageFocusHandler(key)}
                                />
                              </div>
                            );
                          }
                        }
                      )}
                  </article>
                </div>

                {/* View image */}
              </div>
              {/* RIGHT SECTION */}
              <div className="w-full lg:w-9/12 xl:w-10/12 order-1 pt-20 order-lg-2 bg-gradient-to-r from-[rgb(255,195,36)] to-orange-300 matchingMain">
                {!imageUrl ? (
                  <div className="flex justify-center items-center ">
                    <div className="mt-10">
                      <ImageNotFound />

                      <h1 className="mt-8 text-2xl font-bold tracking-tight text-gray-700 sm:text-4xl">
                        Please Select Image...
                      </h1>

                      <p className="mt-4 text-gray-600 text-center">
                        We can't find that page!!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-col">
                    <div className="flex float-right gap-4 mt-2 mr-4 ">
                      <Button
                        onClick={onCsvUpdateHandler}
                        variant="contained"
                        color="info"
                      >
                        update
                      </Button>

                      <Button
                        onClick={() =>
                          onImageHandler("prev", csvData, currentTaskData)
                        }
                        variant="contained"
                        endIcon={<ArrowBackIosIcon />}
                      >
                        Prev
                      </Button>

                      <Button
                        onClick={() =>
                          onImageHandler("next", csvData, currentTaskData)
                        }
                        variant="contained"
                        endIcon={<ArrowForwardIosIcon />}
                      >
                        Next
                      </Button>
                      <Button
                        onClick={taskUpdationHandler}
                        variant="contained"
                        color="success"
                        endIcon={<CheckIcon />}
                      >
                        Task Completed
                      </Button>
                    </div>
                    <h3 className="text-center pt-12 text-lg font-semibold pb-1">
                      Image Name : {currImageName}
                    </h3>
                    <div
                      ref={imageContainerRef}
                      className="mx-auto bg-white"
                      style={{
                        position: "relative",
                        border: "2px solid gray",
                        width: "50rem",
                        height: "23rem",
                        overflow: "auto",
                      }}
                    >
                      <img
                        src={`data:image/jpeg;base64,${imageUrl}`}
                        alt="Selected"
                        ref={imageRef}
                        style={{
                          width: "48rem",
                        }}
                        draggable={false}
                      />

                      {!selectedCoordintes &&
                        templateHeaders?.templetedata?.map((data, index) => (
                          <>
                            <div
                              key={index}
                              style={{
                                border: "2px solid #007bff",
                                position: "absolute",
                                left: `${data.coordinateX}px`,
                                top: `${data.coordinateY}px`,
                                width: `${data.width}px`,
                                height: `${data.height}px`,
                              }}
                            ></div>
                          </>
                        ))}
                    </div>
                    <div className=" py-3 px-3 w-full xl:w-2/3  mx-auto">
                      <div className="">
                        <label
                          className="text-xl font-semibold py-2 mt-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          htmlFor="questions"
                        >
                          Questions:
                        </label>
                      </div>
                      <div className="flex overflow-auto h-[360px]">
                        <div className="flex flex-wrap">
                          {csvCurrentData &&
                            Object.entries(csvCurrentData).map(
                              ([key, value], i) => {
                                const csvHeader = csvData[0][key];
                                const templateData =
                                  templateHeaders?.templetedata.find(
                                    (data) => data.attribute === csvHeader
                                  );
                                if (
                                  templateData &&
                                  templateData.fieldType === "questionsField" &&
                                  key !== imageColName
                                ) {
                                  return (
                                    <div
                                      key={i}
                                      className="gap-1 mx-2 my-1 flex"
                                    >
                                      <label
                                        htmlFor={`Quantity${i}`}
                                        className="font-bold text-sm w-9 text-bold my-1"
                                      >
                                        {key}
                                      </label>
                                      <div className="flex rounded">
                                        <input
                                          type="text"
                                          id={`Quantity${i}`}
                                          className="h-7 w-7 border-transparent text-center rounded text-sm"
                                          placeholder={value}
                                          value={csvCurrentData[key]}
                                          onChange={(e) =>
                                            changeCurrentCsvDataHandler(
                                              key,
                                              e.target.value
                                            )
                                          }
                                          onFocus={() => imageFocusHandler(key)}
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                              }
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {userRole === "Admin" && <AdminAssined />}
    </>
  );
};

export default DataMatching;
