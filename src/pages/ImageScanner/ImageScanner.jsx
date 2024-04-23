import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ImageNotFound from "../../components/ImageNotFound/ImageNotFound";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

const ImageScanner = () => {
  const [selection, setSelection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState([]);
  const [image, setImage] = useState(null);
  const [inputField, setInputField] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [templateData, setTemplateData] = useState({
    name: "",
    other: "",
  });
  const imageRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { imageURL } = location.state ? location.state : "";

  useEffect(() => {
    setImage(imageURL);
  }, [imageURL]);

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
    });
  };

  const onResetHandler = () => {
    setDragStart(null);
    setSelection(null);
  };

  // Function to submit drag selection and name of options like -> Roll Number , or Subject
  const onSelectedHandler = () => {
    if (!fieldType) {
      toast.error("Please select a field type.");
      return;
    }

    if (!inputField) {
      toast.error("Please ensure to add the coordinate name.");
      return;
    }

    const newObj = {
      ...selection,
      fieldType,
      id: Math.random().toString(),
      attribute: inputField,
    };

    setSelectedCoordinates((prev) => [...prev, newObj]);
    setInputField("");
    setFieldType("");
    toast.success("Coordinate successfully added.");
  };

  const onRemoveSelectedHandler = (id) => {
    const newArray = selectedCoordinates.filter((data) => data.id !== id);
    setSelectedCoordinates(newArray);
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
      },
      metaData: [...selectedCoordinates],
    };

    try {
      const response = await axios.post(
        "http://192.168.0.116:4000/add/templete",
        data
      );
      // console.log(response);
      toast.success("Template created successfully!");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <div className="flex">
      {/* LEFT SECTION  */}

      <div className="flex">
        <div className="flex  w-16 flex-col justify-between border-e">
          <div>
            <div className="inline-flex size-16 items-center justify-center">
              <span className="grid size-10 place-content-center rounded-lg bg-gray-100 text-xs text-gray-600 font-bold">
                SCAN
              </span>
            </div>

            <div className="border-t border-gray-100">
              <div className="px-2">
                <div className="py-4">
                  <button className="t group relative flex justify-center rounded bg-blue-50 px-2 py-1.5 text-blue-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-5 opacity-75"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
                      General
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-purple-100 p-2">
            <form>
              <button
                type="button"
                className="group relative flex w-full justify-center rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 opacity-75"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>

                <span className="invisible absolute start-full top-1/2 ms-4 -translate-y-1/2 rounded bg-gray-900 px-2 py-1.5 text-xs font-medium text-white group-hover:visible">
                  Logout
                </span>
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between border-e bg-teal-50">
          <div className="px-4 py-6">
            <ul className="mt-14 space-y-1 ">
              <li
                style={{ marginTop: "40px" }}
                className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium  mb-5"
              >
                <div className="overflow-x-auto">
                  <table className="mt-3 table border-collapse border border-slate-400 min-w-full divide-y-2 divide-gray-200 bg-white text-sm rounded-lg">
                    <thead className="ltr:text-left rtl:text-right">
                      <tr>
                        <th className="text-center whitespace-nowrap  ">
                          Name
                        </th>
                        <th className="text-center whitespace-nowrap  ">
                          Remove
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {selectedCoordinates &&
                        selectedCoordinates?.map((data) => (
                          <tr key={data.id} className="odd:bg-gray-50">
                            <td className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900">
                              {data.attribute}
                            </td>
                            <td className="whitespace-nowrap px-4 py-2 text-center font-semibold text-md text-gray-900">
                              <MdDelete
                                onClick={() => onRemoveSelectedHandler(data.id)}
                                className="mx-auto text-red-500 text-xl"
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </li>
              <div>
                {/* Form Field Area */}

                <div className=" min-w-[350px] bg-gradient-to-b from-white to-gray-100 rounded-3xl px-4 pt-1 pb-4 border-1 border-gray shadow-md mb-10">
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
                    <button className="ms-auto group  mt-4 flex items-center  rounded-lg border border-indigo-600 bg-teal-600  py-2 px-2 transition-colors hover:bg-teal-700 focus:outline-none focus:ring">
                      <span className="font-medium  flex text-white transition-colors group-hover:text-indigo-600 group-active:text-indigo-500 mx-auto">
                        Save Template
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </ul>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION  */}
      {!image ? (
        <div className="flex w-full h-[100vh] justify-center items-center ">
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
        <div className="w-[70%] pb-2 ">
          <div className="mx-auto max-w-screen-xl px-2 lg:pt-2 sm:px-6 lg:px-8">
            <ul className="mt-2 flex justify-center pt-6 py-4">
              <li className="w-[65%]">
                {image && (
                  <div
                    style={{
                      position: "relative",
                      border: "1px solid purple",
                    }}
                  >
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Selected"
                      style={{
                        width: "50rem",
                        height: "50rem",
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
                      {selectedCoordinates?.map((data, index) => (
                        <div
                          key={index}
                          className="border-blue-500"
                          style={{
                            border: "2px solid #007bff",
                            position: "absolute",
                            left: data.coordinateX,
                            top: data.coordinateY,
                            width: data.width,
                            height: data.height,
                          }}
                        ></div>
                      ))}

                      {selection && (
                        <div
                          className="border-blue-500"
                          style={{
                            border: "2px solid #007bff",
                            position: "absolute",
                            left: selection.coordinateX,
                            top: selection.coordinateY,
                            width: selection.width,
                            height: selection.height,
                          }}
                        ></div>
                      )}
                      <div
                        className="modal fade"
                        id="exampleModal"
                        tabIndex="-1"
                        aria-labelledby="exampleModalLabel"
                        aria-hidden="true"
                      >
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content px-3 py-2">
                            <div className="modal-header">
                              <h1
                                className="modal-title fs-5 fw-semibold text-gray-600"
                                id="exampleModalLabel"
                              >
                                Add Field Entity..
                              </h1>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={onResetHandler}
                              ></button>
                            </div>
                            <div className="modal-body justify-between my-1">
                              <div className="flex gap-5 p-3">
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
                                    checked={fieldType === "questionsField"}
                                    onChange={(e) =>
                                      setFieldType(e.target.value)
                                    }
                                  />
                                  <span className="ml-2 text-lg text-gray-700">
                                    Questions Field
                                  </span>
                                </label>
                              </div>
                              <div className="flex justify-between my-2">
                                <input
                                  required
                                  className="input w-[72%] font-semibold bg-white text-lg focus:border-1 rounded-xl px-3 py-2 shadow-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                  type="text"
                                  name="field"
                                  placeholder="Field.."
                                  value={inputField}
                                  onChange={(e) =>
                                    setInputField(e.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  data-bs-dismiss="modal"
                                  className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-md px-3"
                                  onClick={onSelectedHandler}
                                >
                                  Save Field
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageScanner;
