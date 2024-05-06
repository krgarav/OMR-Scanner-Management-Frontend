import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { toast } from "react-toastify";
import {
  onGetTaskHandler,
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
} from "../../services/common";
import { REACT_APP_IP } from "../../services/common";
import { useNavigate } from "react-router-dom";

const DataMatching = () => {
  const [popUp, setPopUp] = useState(true);
  const [image, setImage] = useState();
  const [templateHeaders, setTemplateHeaders] = useState();
  const [csvCurrentData, setCsvCurrentData] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [imageName, setImageName] = useState("");
  const [currentTaskData, setCurrentTaskData] = useState({});
  const [selectedCoordintes, setSelectedCoordinates] = useState(false);
  const [imageNotFound, setImageNotFound] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [csvData, setCsvData] = useState([]);
  const [compareTask, setCompareTask] = useState([]);
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const token = JSON.parse(localStorage.getItem("userData"));
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const verifiedUser = await onGetVerifiedUserHandler();
        const tasks = await onGetTaskHandler(verifiedUser.user.id);
        const templateData = await onGetTemplateHandler();
        const uploadTask = tasks.filter((task) => {
          return task.moduleType !== "CSV Compare";
        });
        const comTask = tasks.filter((task) => {
          return task.moduleType === "CSV Compare";
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
        // console.log(tasks.moduleType);

        setAllTasks(updatedTasks);

        setCompareTask(comTask);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentUser();
  }, []);

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

  const onImageHandler = async (direction, csvData) => {
    const headers = csvData[0];
    const getKeyByValue = (object, value) => {
      return Object.keys(object).find((key) => object[key] === value);
    };

    const keyForImage = getKeyByValue(headers, "Image");
    setImageName(keyForImage);
    try {
      let imageName1;
      let newIndex = currentIndex;

      if (direction === "initial") {
        const objects = csvData[newIndex];
        imageName1 = objects[keyForImage];
        setCsvCurrentData(objects);
        newIndex = newIndex + 1;
      } else {
        newIndex = direction === "next" ? newIndex + 1 : newIndex - 1;
        console.log(newIndex);
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
        { imageName: imageName1 },
        {
          headers: {
            token: token,
          },
        }
      );
      const url = response.data?.base64Image;
      setImage(url);
      setImageNotFound(true);
      setPopUp(false);
    } catch (error) {
      toast.error("Image not found!.",error);
      setImageNotFound(false);
    }
  };

  const onCsvUpdateHandler = async () => {
    // const updatedData = [...csvData];
    // updatedData[currentIndex] = csvCurrentData;
    // setCsvData(updatedData);
    // console.log(csvCurrentData);
    // console.log(currentIndex);
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

  const changeCurrentCsvDataHandler = (key, value) => {
    if (!imageNotFound) {
      return;
    }

    setCsvCurrentData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const imageFocusHandler = (headerName) => {
    if (!imageNotFound) {
      return;
    }

    if (!image || !imageContainerRef || !imageRef) {
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

      onImageHandler("initial", response.data);
      setPopUp(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onCompareTaskStartHandler = (taskdata) => {
    console.log(taskdata);

    localStorage.setItem("taskdata", JSON.stringify(taskdata));
    navigate("/correct_compare_csv", { state: taskdata });
  };

  return (
    <>
      {popUp && (
        <div className=" min-h-[100vh] flex justify-center templatemapping">
          <div className=" mt-40 flex flex-col gap-10">
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
                                    <div className=" px-2">{taskData.min}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                                <div className="flex">
                                  <div className="w-full font-semibold">
                                    <div className=" px-2">{taskData.max}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="whitespace-nowrap px-4 py-4 text-right">
                                <button
                                  onClick={() => onTaskStartHandler(taskData)}
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
            <section className="mx-auto w-full max-w-7xl  px-12 py-10 bg-white rounded-xl">
              <div className="flex flex-col space-y-4  md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                  <h2 className="text-3xl ">
                    <strong>Assigned Tasks </strong>: <em> CSV Compare</em>
                  </h2>
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
                              Start Task
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-200 bg-white overflow-y-auto max-h-[300px]">
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
                                    <div className=" px-2">{taskData.min}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                                <div className="flex">
                                  <div className="w-full font-semibold">
                                    <div className=" px-2">{taskData.max}</div>
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
        <div className=" flex flex-col lg:flex-row md:flex-col-reverse">
          {/* LEFT SECTION */}
          <div className=" border-e lg:w-3/12 order-lg-1 second">
            <div className=" flex flex-col overflow-hidden w-[100%]">
              <article className="p-3 shadow transition pt-28 hover:shadow-lg overflow-auto h-[100vh] bg-gradient-to-r from-[rgb(255,195,36)] to-orange-500">
                {csvCurrentData &&
                  Object.entries({ ...csvData[0] }).map(([key, value], i) => {
                    const templateData = templateHeaders?.templetedata.find(
                      (data) =>
                        data.attribute === value &&
                        data.fieldType === "formField"
                    );
                    if (key !== imageName && templateData) {
                      return (
                        <div
                          key={i}
                          className="w-5/6 lg:w-full px-3 py-1 flex justify-between items-center overflow-x font-bold"
                        >
                          <label className="flex w-full gap-2 justify-between items-center overflow-hidden  rounded-md border-2 font-semibold  border-white px-3  py-2 shadow-sm focus-within:ring-1 ">
                            <span className="text-md text-gray-700 font-bold">
                              {key?.toUpperCase()}
                            </span>

                            <input
                              type="email"
                              className="mt-1 border-none p-2 focus:border-transparent text-center rounded focus:outline-none focus:ring-0 sm:text-sm"
                              placeholder={value}
                              value={csvCurrentData[key]}
                              onChange={(e) =>
                                changeCurrentCsvDataHandler(key, e.target.value)
                              }
                              onFocus={() => imageFocusHandler(key)}
                            />
                          </label>
                        </div>
                      );
                    }
                  })}
                <div className="w-full py-2">
                  <div className=" mb-1">
                    <div className="flex">
                      <label
                        className="text-xl mx-3 font-semibold py-2 mt-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        htmlFor="questions"
                      >
                        Questions:
                      </label>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex flex-wrap justify-evenly">
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
                              key !== imageName
                            ) {
                              return (
                                <div
                                  key={i}
                                  className="gap-1 m-2 flex items-center"
                                >
                                  <label
                                    htmlFor={`Quantity${i}`}
                                    className="font-bold text-sm text-bold"
                                  >
                                    {key}
                                  </label>
                                  <div className="flex items-center rounded border border-gray-200">
                                    <input
                                      type="text"
                                      id={`Quantity${i}`}
                                      className="h-10 w-10 border-transparent text-center rounded text-sm"
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
              </article>
            </div>

            {/* View image */}
          </div>
          {/* RIGHT SECTION */}
          <div className="w-full lg:w-9/12 order-1 pt-32 order-lg-2 bg-gradient-to-r from-[rgb(255,195,36)] to-orange-300 matchingMain">
            {!image ? (
              <div className="flex justify-center items-center ">
                <div className="mt-64">
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
              <div className="mt-10">
                <div
                  ref={imageContainerRef}
                  className="mx-auto"
                  style={{
                    position: "relative",
                    border: "2px solid gray",
                    width: "50rem",
                    height: "30rem",
                    overflow: "auto",
                  }}
                >
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt="Selected"
                    ref={imageRef}
                    style={{
                      width: "48rem",
                      height: "50rem",
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
                <div className="flex float-right gap-4 py-6 lg:py-24 px-16 lg:px-24">
                  <button
                    onClick={onCsvUpdateHandler}
                    className="block w-full rounded  px-4 py-2 border-[red]  border-2 hover:bg-red-500 hover:text-white  font-bold text-xl sm:w-auto"
                  >
                    Update
                  </button>

                  <button
                    onClick={() => onImageHandler("prev", csvData)}
                    className="block w-full rounded  px-4 py-3 border-[red]  border-2 hover:bg-red-500 hover:text-white  font-bold text-xl sm:w-auto"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => onImageHandler("next", csvData)}
                    className="block w-full rounded  px-4 py-3 border-[red]  border-2 hover:bg-red-500 hover:text-white  font-bold text-xl sm:w-auto"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DataMatching;
