import React, { useState, useContext, useEffect, useRef, useId } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { toast } from "react-toastify";
import {
  onGetTaskHandler,
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
} from "../../services/common";

const DataMatching = () => {
  const [popUp, setPopUp] = useState(true);
  const [image, setImage] = useState();
  const [templateHeaders, setTemplateHeaders] = useState();
  const [csvCurrentData, setCsvCurrentData] = useState([]);
  const [imageName, setImageName] = useState("");
  const [selectedCoordintes, setSelectedCoordinates] = useState(false);
  const [userId, setUserId] = useState("");
  const [currentIndex, setCurrentIndex] = useState(1);
  const [csvData, setCsvData] = useState([]);
  const imageContainerRef = useRef(null);
  const imageRef = useRef(null);
  const { id } = useParams();
  const location = useLocation();
  const templateId = location.state;

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const response = await onGetVerifiedUserHandler();
        setUserId(response.user.id);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };
    getAllUsers();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await onGetTaskHandler(userId);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTasks();
  }, [userId]);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        const templateData = response.find((data) => data.id == templateId);
        setTemplateHeaders(templateData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://192.168.0.116:4000/get/csvdata/${id}`
        );
        setCsvData(response.data);
        const headers = response.data[0];
        const getKeyByValue = (object, value) => {
          return Object.keys(object).find((key) => object[key] === value);
        };
        if (currentIndex === 0) {
          setCurrentIndex(1);
        }
        if (currentIndex === 1) {
          const objects = { ...response.data[currentIndex] };
          setCsvCurrentData(objects);
        }
        const keyForImage = getKeyByValue(headers, "Image");
        setImageName(keyForImage);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [id, currentIndex]);

  const onImageHandler = async (direction) => {
    try {
      let imageName1;
      let newIndex;

      if (direction === "initial") {
        const objects = { ...csvData[currentIndex] };
        imageName1 = objects[imageName];
        setCsvCurrentData(objects);
        newIndex = currentIndex;
      } else {
        newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

        if (newIndex > 0 && newIndex < csvData.length) {
          setCurrentIndex(newIndex);

          const objects = { ...csvData[newIndex] };
          imageName1 = objects[imageName];
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

      const response = await axios.post(`http://192.168.0.116:4000/get/image`, {
        imageName: imageName1,
        id: templateId,
      });

      const url = response.data?.base64Image;
      setImage(url);
      setPopUp(false);
    } catch (error) {
      toast.error("An error occurred while processing the image.");
      console.log(error.message);
    }
  };

  const onCsvUpdateHandler = async () => {
    const updatedData = [...csvData];
    updatedData[currentIndex] = csvCurrentData;
    setCsvData(updatedData);

    try {
      await axios.post(
        `http://192.168.0.116:4000/updatecsvdata/${id}`,
        updatedData
      );
      toast.success("Data update successfully.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changeCurrentCsvDataHandler = (key, value) => {
    setCsvCurrentData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const imageFocusHandler = (headerName) => {
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

    const containerWidth = imageContainerRef.current.offsetWidth;
    const containerHeight = imageContainerRef.current.offsetHeight;

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

  return (
    <>
      {popUp && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 p-8 matchingMain  bg-white rounded-3xl shadow-2xl">
          <p className="text-center text-xl text-red-500 mb-6">
            Welcome to Your Application
          </p>
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Welcome to the OMR Data Entry Application
            </h2>
            <p className="mt-4 text-lg text-gray-700">
              This application allows you to efficiently process OMR data from
              image files containing CSV data of students.
            </p>
            <button
              className="mt-8 inline-block rounded-full bg-pink-600 py-3 px-6 text-2xl font-bold text-white shadow-xl"
              onClick={() => onImageHandler("initial")}
            >
              Begin Processing
            </button>
          </div>
        </div>
      )}
      {!popUp && (
        <div className=" flex flex-col lg:flex-row md:flex-col-reverse">
          {/* LEFT SECTION */}
          <div className=" border-e mx-auto lg:w-3/12 order-lg-1 second">
            <div className=" flex flex-col overflow-hidden w-[100%]">
              <article className="p-3 shadow transition hover:shadow-lg overflow-auto h-[100vh] bg-gradient-to-r from-[rgb(255,195,36)] to-orange-500">
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
                          <label className="flex w-full gap-2 justify-between items-center overflow-hidden  rounded-md border-2 font-semibold  border-white px-3  py-2 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
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
          <div className="w-full lg:w-9/12 order-1 order-lg-2 bg-gradient-to-r from-[rgb(255,195,36)] to-orange-300 matchingMain">
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
                    onClick={() => onImageHandler("prev")}
                    className="block w-full rounded  px-4 py-3 border-[red]  border-2 hover:bg-red-500 hover:text-white  font-bold text-xl sm:w-auto"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => onImageHandler("next")}
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
