import React, { useState, useRef, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Dialog, Transition } from "@headlessui/react";
import { RxCross1 } from "react-icons/rx";
import { CiEdit } from "react-icons/ci";
import { REACT_APP_IP } from "../../services/common";

const ImageScanner = () => {
  const [selection, setSelection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [image, setImage] = useState(null);
  const [inputField, setInputField] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [removeModal, setRemoveModal] = useState(false);
  const [editId, setEditID] = useState("");
  const [removeId, setRemoveId] = useState("");
  const [editInput, setEditInput] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cancelButtonRef = useRef(null);
  const [templateData, setTemplateData] = useState({
    name: "",
    other: "",
    pageCount: "",
  });
  const [questionRange, setQuestionRange] = useState({
    min: "",
    max: "",
  });
  const token = JSON.parse(localStorage.getItem("userData"));
  const imageRef = useRef(null);
  const navigate = useNavigate();

  const imageURL = JSON.parse(localStorage.getItem("images"));

  useEffect(() => {
    if (imageURL && imageURL.length > 0) {
      setImage(imageURL[currentImageIndex]); // Set the first image from the array
    }
  }, [currentImageIndex]);

  useEffect(() => {
    const handlekeyDown = (e) => {
      if (e.key === "ArrowRight") {
        onNextImageHandler();
      } else if (e.key === "ArrowLeft") {
        onPreviousImageHandler();
      }
    };
    window.addEventListener("keydown", handlekeyDown);
    return () => {
      window.removeEventListener("keydown", handlekeyDown);
    };
  }, []);

  const onNextImageHandler = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex < imageURL.length - 1 ? prevIndex + 1 : prevIndex
    );
    setSelection(null);
  };

  const onPreviousImageHandler = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  // Function to handle mouse down event for drag selection
  const handleMouseDown = (e) => {
    const boundingRect = imageRef.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;
    setDragStart({ x: offsetX, y: offsetY });
  };
  // Function to handle mouse up event for drag selection
  const handleMouseUp = () => {
    if (dragStart) {
      setDragStart(null);
      setOpen(true);
      // Remove event listener for mousemove when dragging ends
    }
  };
  // Function to handle mouse move event for drag selection
  const handleMouseMove = (e) => {
    if (!e.buttons || !dragStart) {
      return;
    }
    const boundingRect = imageRef?.current.getBoundingClientRect();
    const offsetX = e.clientX - boundingRect.left;
    const offsetY = e.clientY - boundingRect.top;

    setSelection({
      coordinateX: Math.min(dragStart.x, offsetX),
      coordinateY: Math.min(dragStart.y, offsetY),
      width: Math.abs(offsetX - dragStart.x),
      height: Math.abs(offsetY - dragStart.y),
      pageNo: currentImageIndex,
    });
  };

  const onResetHandler = () => {
    setDragStart(null);
    setSelection(null);
    setOpen(false);
  };

  // Function to submit drag selection and name of options like -> Roll Number , or Subject
  const onSelectedHandler = () => {
    if (!fieldType) {
      toast.error("Please select a field type.");
      return;
    }

    if (fieldType === "questionsField") {
      if (!questionRange || !questionRange.min || !questionRange.max) {
        toast.warning("Please ensure all fields are properly filled out.");
        return;
      }

      if (Number(questionRange.min) > Number(questionRange.max)) {
        toast.warning(
          "Please ensure the minimum value is always less than the maximum value."
        );
        return;
      }
    } else {
      if (fieldType === "formField" && inputField.includes("-")) {
        toast.error("Please refrain from using hyphens (-) in this field.");
        return;
      }

      if (!inputField) {
        toast.error("Please ensure to add the coordinate name.");
        return;
      }
    }
    const newObj = {
      ...selection,
      fieldType,
      id: Math.random().toString(),
      attribute:
        fieldType === "formField"
          ? inputField
          : questionRange.min + "--" + questionRange.max,
    };
    setSelectedCoordinates((prev) => [...prev, newObj]);
    setInputField("");
    setFieldType("");
    setOpen(false);
    setQuestionRange({
      min: "",
      max: "",
    });
    toast.success("Coordinate successfully added.");
  };

  const onRemoveSelectedHandler = () => {
    const newArray = selectedCoordinates.filter((data) => data.id !== removeId);
    setSelectedCoordinates(newArray);
    toast.success("Successfully deleted coordinate.");
    setRemoveId("");
    setRemoveModal(false);
    setSelection(null);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (selectedCoordinates.length === 0) {
      toast.error("Please select the coordinates");
      return;
    }

    const data = {
      templateData: {
        name: templateData.name,
        other: templateData.other,
        pageCount: imageURL.length,
      },
      metaData: [...selectedCoordinates],
    };

    try {
      await axios.post(
        `http://${REACT_APP_IP}:4000/add/templete`,
        { data },
        {
          headers: {
            token: token,
          },
        }
      );
      toast.success("Template created successfully!");
      navigate("/imageuploader");
      console.log(data);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const onEditCoordinateHanlder = () => {
    if (!editInput) {
      toast.warning("Please enter the new name.");
      return;
    }

    const updatedData = selectedCoordinates.map((coordinate) => {
      if (editId === coordinate.id) {
        return { ...coordinate, attribute: editInput };
      }

      return coordinate;
    });
    setSelectedCoordinates(updatedData);
    setEditID("");
    setEditInput("");
    setEditModal(false);
    toast.success("Successfully updated coordinate name.");
  };

  return (
    <div className="flex scannerbg border-1 pt-16 ">
      {/* LEFT SECTION  */}
      <div className="flex w-[25%]">
        <div className="flex flex-1  flex-col justify-between border-e bg-teal-50">
          <div className="px-4 py-6">
            <div className="space-y-1">
              <div
                style={{ marginTop: "40px" }}
                className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium  mb-5"
              >
                <div className="overflow-x-auto">
                  <div className="my-3 table-auto  border-collapse border border-gray-400 min-w-full divide-y-2 divide-gray-200 bg-white text-sm rounded-lg">
                    <div className="ltr:text-left rtl:text-right flex justify-around text-gray-600">
                      <div className="text-center whitespace-nowrap py-2 w-1/3">
                        Name
                      </div>
                      <div className="text-center whitespace-nowrap py-2 w-1/3">
                        Edit
                      </div>
                      <div className="text-center whitespace-nowrap py-2 w-1/3">
                        Remove
                      </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                      {selectedCoordinates &&
                        selectedCoordinates?.map((data) => (
                          <div
                            key={data.id}
                            className="odd:bg-gray-50 flex justify-around"
                          >
                            <div className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900 text-ellipsis overflow-x-hidden w-1/3">
                              {data.attribute}
                            </div>
                            <div className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900 w-1/3">
                              <CiEdit
                                onClick={() => {
                                  setEditID(data.id);
                                  setEditModal(true);
                                }}
                                className="mx-auto text-red-500 text-xl cursor-pointer"
                              />
                            </div>
                            <div className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900 w-1/3">
                              <MdDelete
                                onClick={() => {
                                  setRemoveModal(true);
                                  setRemoveId(data.id);
                                }}
                                className="mx-auto text-red-500 text-xl cursor-pointer"
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {/* Form Field Area */}

                <div className=" bg-gradient-to-b from-white to-gray-100 rounded-3xl px-4 pt-1 pb-4 border-1 border-gray shadow-md mb-10">
                  <form onSubmit={onSubmitHandler}>
                    <input
                      required
                      className="input w-full font-semibold bg-white  border-none rounded-xl p-3 mt-6 shadow-xl   focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      type="text"
                      value={templateData.attribute}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          name: e.target.value,
                        })
                      }
                      placeholder="enter template name.."
                    />
                    <input
                      required
                      className="input w-full font-semibold bg-white border-none rounded-xl p-3 mt-6 shadow-xl   focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none focus:outline-none"
                      type="text"
                      value={templateData.other}
                      onChange={(e) =>
                        setTemplateData({
                          ...templateData,
                          other: e.target.value,
                        })
                      }
                      placeholder="enter other.."
                    />
                    <button className="ms-auto group  mt-4 flex items-center  rounded-lg bg-teal-600 hover:shadow-lg hover:shadow-blue-200  py-2 px-2 transition-colors hover:bg-teal-700 focus:outline-none focus:ring">
                      <span className="font-medium  flex text-white transition-colors group-hover:text-white  group-active:text-white mx-auto">
                        Save Template
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* EDIT MODAL  */}
      <div>
        {editModal && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* Modal content */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      {/* Your icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-6 w-6 text-green-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg font-medium text-gray-900"
                        id="modal-title"
                      >
                        Update coordinate name
                      </h3>
                      <div className="mt-2">
                        <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                          <input
                            type="text"
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            id="Username"
                            className="peer border-none py-2 bg-transparent placeholder-transparent focus:border-transparent focus:outline-none focus:ring-0"
                            placeholder="Username"
                          />
                          <span className="pointer-events-none absolute start-2.5 top-0 -translate-y-1/2 bg-white p-0.5 text-xs text-gray-700 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs">
                            Enter name here.....
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex float-right">
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={onEditCoordinateHanlder}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Save
                    </button>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={() => setEditModal(false)}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL  */}

      <div>
        {removeModal && (
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              {/* Modal content */}
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      {/* Your icon */}
                      <svg
                        onClick={() => setRemoveModal(false)}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-6 w-6 text-red-600 cursor-pointer"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3
                        className="text-lg font-medium text-gray-900 "
                        id="modal-title"
                      >
                        Remove Template
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to remove this coordinate?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end py-3 px-3">
                  <button
                    type="button cursor-pointer"
                    onClick={onRemoveSelectedHandler}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => setRemoveModal(false)}
                    type="button"
                    className="inline-flex justify-center cursor-pointer w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SECTION  */}
      {!image ? (
        <div className="flex w--[75%] h-[100vh] justify-center items-center ">
          <div className="">
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
        <div className=" pb-2 w-[75%] ">
          <div className="mx-auto max-w-screen-xl px-2 lg:pt-2 sm:px-6 lg:px-8">
             <h1 className="text-center my-4 pt-1 text-xl font-bold text-blue-700">{currentImageIndex + 1} out of {imageURL.length}</h1>
            <div className="mt-2 flex justify-center ">
              <div className="">
                {image && (
                  <div
                    style={{
                      position: "relative",
                      border: "3px solid purple",
                      height: "50rem",
                    }}
                    className="w-full overflow-y-auto"
                  >
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Selected"
                      style={{
                        width: "48rem",
                        // height: "50rem",
                        cursor: "crosshair",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      draggable={false}
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                    />
                    <>
                      {selectedCoordinates
                        .filter((data) => data.pageNo === currentImageIndex)
                        .map((data, index) => (
                          <div
                            key={index}
                            style={{
                              border: "3px solid #007bff",
                              position: "absolute",
                              backgroundColor: "rgba(0, 123, 255, 0.2)",
                              left: data.coordinateX,
                              top: data.coordinateY,
                              width: data.width,
                              height: data.height,
                            }}
                          ></div>
                        ))}
                      {selection && (
                        <div
                          style={{
                            border: "3px solid #007bff",
                            backgroundColor: "rgba(0, 123, 255, 0.2)",
                            position: "absolute",
                            left: selection.coordinateX,
                            top: selection.coordinateY,
                            width: selection.width,
                            height: selection.height,
                          }}
                        ></div>
                      )}
                      <Transition.Root show={open} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-10"
                          initialFocus={cancelButtonRef}
                          onClose={setOpen}
                        >
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                      <Transition.Root show={open} as={Fragment}>
                        <Dialog
                          as="div"
                          className="relative z-10"
                          initialFocus={cancelButtonRef}
                          onClose={setOpen}
                        >
                          <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                          </Transition.Child>

                          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                              <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                              >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex w-full justify-between items-center">
                                        <div>
                                          <Dialog.Title
                                            as="h1"
                                            className="text-xl font-semibold leading-6 text-gray-900"
                                          >
                                            Add Field Entity..{" "}
                                          </Dialog.Title>
                                        </div>

                                        <div className="mt-2">
                                          <button
                                            type="button"
                                            className=" text-red-600 w-[30px] h-[30px]  text-xl flex justify-center items-center"
                                            onClick={onResetHandler}
                                          >
                                            <RxCross1 className="font-extrabold" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-5 p-3 mt-3">
                                      <label
                                        htmlFor="formField"
                                        className="flex items-center font-semibold"
                                      >
                                        <input
                                          type="radio"
                                          id="formField"
                                          name="fieldType"
                                          value="formField"
                                          className="form-radio text-blue-500"
                                          required
                                          checked={fieldType === "formField"}
                                          onChange={(e) =>
                                            setFieldType(e.target.value)
                                          }
                                        />
                                        <span className="ml-2 text-lg text-gray-700">
                                          Form Field
                                        </span>
                                      </label>
                                      <label
                                        htmlFor="questionsField"
                                        className="flex items-center font-semibold"
                                      >
                                        <input
                                          type="radio"
                                          id="questionsField"
                                          name="fieldType"
                                          value="questionsField"
                                          className="form-radio text-blue-500"
                                          required
                                          checked={
                                            fieldType === "questionsField"
                                          }
                                          onChange={(e) =>
                                            setFieldType(e.target.value)
                                          }
                                        />
                                        <span className="ml-2 text-lg text-gray-700">
                                          Questions Field
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className=" px-4 pb-8 sm:flex sm:px-6 justify-between">
                                    {fieldType === "formField" ||
                                    fieldType === "" ? (
                                      <input
                                        required
                                        className="input w-[72%] border-2 font-semibold bg-white text-lg focus:border-1 rounded-xl px-3 py-2 shadow-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        type="text"
                                        name="field"
                                        placeholder="Field.."
                                        value={inputField}
                                        onChange={(e) =>
                                          setInputField(e.target.value)
                                        }
                                      />
                                    ) : (
                                      <div className="flex gap-5">
                                        <div className="flex items-center gap-4">
                                          <span className="font-bold">
                                            Start
                                          </span>
                                          <input
                                            type="number"
                                            id="Quantity"
                                            value={questionRange.min}
                                            onChange={(e) =>
                                              setQuestionRange({
                                                ...questionRange,
                                                min: e.target.value,
                                              })
                                            }
                                            className="h-10 w-16 rounded  border-2  border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                          />
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="font-bold">End</span>
                                          <input
                                            type="number"
                                            id="Quantity"
                                            value={questionRange.max}
                                            onChange={(e) =>
                                              setQuestionRange({
                                                ...questionRange,
                                                max: e.target.value,
                                              })
                                            }
                                            className="h-10 w-16 rounded  border-2  border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                          />
                                        </div>
                                      </div>
                                    )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex gap-5 p-3 mt-3">
                                      <label
                                        htmlFor="formField"
                                        className="flex items-center font-semibold"
                                      >
                                        <input
                                          type="radio"
                                          id="formField"
                                          name="fieldType"
                                          value="formField"
                                          className="form-radio text-blue-500"
                                          required
                                          checked={fieldType === "formField"}
                                          onChange={(e) =>
                                            setFieldType(e.target.value)
                                          }
                                        />
                                        <span className="ml-2 text-lg text-gray-700">
                                          Form Field
                                        </span>
                                      </label>
                                      <label
                                        htmlFor="questionsField"
                                        className="flex items-center font-semibold"
                                      >
                                        <input
                                          type="radio"
                                          id="questionsField"
                                          name="fieldType"
                                          value="questionsField"
                                          className="form-radio text-blue-500"
                                          required
                                          checked={
                                            fieldType === "questionsField"
                                          }
                                          onChange={(e) =>
                                            setFieldType(e.target.value)
                                          }
                                        />
                                        <span className="ml-2 text-lg text-gray-700">
                                          Questions Field
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                  <div className=" px-4 pb-8 sm:flex sm:px-6 justify-between">
                                    {fieldType === "formField" ||
                                    fieldType === "" ? (
                                      <input
                                        required
                                        className="input w-[72%] border-2 font-semibold bg-white text-lg focus:border-1 rounded-xl px-3 py-2 shadow-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        type="text"
                                        name="field"
                                        placeholder="Field.."
                                        value={inputField}
                                        onChange={(e) =>
                                          setInputField(e.target.value)
                                        }
                                      />
                                    ) : (
                                      <div className="flex gap-5">
                                        <div className="flex items-center gap-4">
                                          <span className="font-bold">
                                            Start
                                          </span>
                                          <input
                                            type="number"
                                            id="Quantity"
                                            value={questionRange.min}
                                            onChange={(e) =>
                                              setQuestionRange({
                                                ...questionRange,
                                                min: e.target.value,
                                              })
                                            }
                                            className="h-10 w-16 rounded  border-2  border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                          />
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="font-bold">End</span>
                                          <input
                                            type="number"
                                            id="Quantity"
                                            value={questionRange.max}
                                            onChange={(e) =>
                                              setQuestionRange({
                                                ...questionRange,
                                                max: e.target.value,
                                              })
                                            }
                                            className="h-10 w-16 rounded  border-2  border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      data-bs-dismiss="modal"
                                      className="bg-teal-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200  text-md font-medium px-3"
                                      onClick={onSelectedHandler}
                                    >
                                      Save Field
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition.Root>
                                    <button
                                      type="button"
                                      data-bs-dismiss="modal"
                                      className="bg-teal-600 hover:bg-indigo-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-200  text-md font-medium px-3"
                                      onClick={onSelectedHandler}
                                    >
                                      Save Field
                                    </button>
                                  </div>
                                </Dialog.Panel>
                              </Transition.Child>
                            </div>
                          </div>
                        </Dialog>
                      </Transition.Root>
                    </>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            {/* <button
              onClick={handleNext}
              className="ms-auto group  mt-2 flex items-center  rounded-lg bg-teal-600 hover:shadow-lg hover:shadow-blue-200  py-2 px-2 transition-colors hover:bg-teal-700 focus:outline-none focus:ring"
            >
              <span className="font-medium  flex text-white transition-colors group-hover:text-white  group-active:text-white mx-auto">
                Next
              </span>
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageScanner;