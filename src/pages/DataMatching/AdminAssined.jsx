import React, { useEffect, useState } from "react";
import {
  onGetTaskHandler,
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
  REACT_APP_IP,
} from "../../services/common";
import axios from "axios";

const AdminAssined = () => {
  const [compareTask, setCompareTask] = useState([]);
  const [matchingTask, setMatchingTask] = useState([]);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          `http://${REACT_APP_IP}:4000/assignedTasks`,
          {
            headers: {
              token: token,
            },
          }
        );
        const AssignedData = response.data.assignedData;

        console.log(response.data.assignedData);
        // const verifiedUser = await onGetVerifiedUserHandler();
        // const tasks = await onGetTaskHandler(verifiedUser.user.id);
        // const templateData = await onGetTemplateHandler();

        const uploadTask = AssignedData.filter((task) => {
          return task.TemplateType === "Data Entry";
        });
        const comTask = AssignedData.filter((task) => {
          return task.TemplateType === "CSVCompare";
        });

        // const updatedCompareTasks = comTask.map((task) => {
        //   const matchedTemplate = templateData.find(
        //     (template) => template.id === parseInt(task.templeteId)
        //   );
        //   if (matchedTemplate) {
        //     return {
        //       ...task,
        //       templateName: matchedTemplate.name,
        //     };
        //   }
        //   return task;
        // });
        // const updatedTasks = uploadTask.map((task) => {
        //   const matchedTemplate = templateData.find(
        //     (template) => template.id === parseInt(task.templeteId)
        //   );
        //   if (matchedTemplate) {
        //     return {
        //       ...task,
        //       templateName: matchedTemplate.name,
        //     };
        //   }
        //   return task;
        // });
        // setAllTasks(updatedTasks);
        setMatchingTask(uploadTask);
        setCompareTask(comTask);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrentUser();
  }, []);
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
  const onCompareTaskStartHandler = (taskData) => {
    const sendReq = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("userData"));
        const response = await axios.get(
          `http://${REACT_APP_IP}:4000/download_error_file/${taskData.id}`,
          {
            headers: {
              token: token,
            },
            // responseType: "blob", // Set the response type to blob to receive binary data
          }
        );
        console.log(response.data);
        const jsonObj = response.data.csvFile;
        const csvData = convertToCsv(jsonObj);
        const blob = new Blob([csvData], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        const date = new Date().toJSON();
        link.download = `data_${date}.csv`;
        link.click();
        // Create a blob from the response data
        // const blob = new Blob([response.data], { type: "text/csv" });

        // // Create a temporary URL for the blob
        // const url = window.URL.createObjectURL(blob);

        // // Create a link element
        // const link = document.createElement("a");

        // // Set the href attribute of the link to the temporary URL
        // link.href = url;

        // // Set the download attribute to specify the file name
        // link.download = "error_file.csv";

        // // Append the link to the document body
        // document.body.appendChild(link);

        // // Programmatically click on the link to trigger the download
        // link.click();

        // // Remove the link from the document body after the download is initiated
        // document.body.removeChild(link);

        // Display the message
        // console.log(response.data.message); // or handle the message as required
      } catch (err) {
        console.log(err);
      }
    };
    sendReq();
    console.log(taskData);
  };
  return (
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
                          <span>Template</span>
                        </div>
                        <div className="px-12 py-3.5 text-left  text-xl font-semibold text-gray-700">
                          Assigned Operator
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
                          Download File
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
                                <div className=" px-2">{taskData.name}</div>
                              </div>
                            </div>
                          </div>
                          <div className="whitespace-nowrap px-4 py-4 ">
                            <div className="flex items-center">
                              <div className="ml-4 w-full font-semibold">
                                <div className=" px-2">{taskData.userName}</div>
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
                          <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                            <div className="flex">
                              <div className="w-full font-semibold">
                                <div className=" px-2">
                                  {taskData.TemplateType}
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
                          <div className="whitespace-nowrap px-4 py-4  text-right">
                            {/* <button
                              // onClick={() =>
                              //   onCompareTaskStartHandler(taskData)
                              // }
                              className="rounded border border-indigo-500 bg-indigo-500 px-10 py-1 font-semibold text-white mr-2"
                            >
                              Download
                            </button> */}
                            <button
                              onClick={() =>
                                onCompareTaskStartHandler(taskData)
                              }
                              className="rounded border border-indigo-500 bg-indigo-500 px-2 py-1 font-semibold text-white ml-2"
                            >
                              Download Corrected Data
                            </button>
                          </div>
                        </div>
                      ))}
                      {matchingTask?.map((taskData) => (
                        <div
                          key={taskData.id}
                          className="flex justify-between items-center"
                        >
                          <div className="whitespace-nowrap px-4 py-4 ">
                            <div className="flex items-center">
                              <div className="ml-4 w-full font-semibold">
                                <div className=" px-2">{taskData.name}</div>
                              </div>
                            </div>
                          </div>
                          <div className="whitespace-nowrap px-4 py-4 ">
                            <div className="flex items-center">
                              <div className="ml-4 w-full font-semibold">
                                <div className=" px-2">{taskData.userName}</div>
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
                          <div className="whitespace-nowrap flex justify-center itemCe px-2 py-2 border-2">
                            <div className="flex">
                              <div className="w-full font-semibold">
                                <div className=" px-2">
                                  {taskData.TemplateType}
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
                              // onClick={() =>
                              //   onCompareTaskStartHandler(taskData)
                              // }
                              className="rounded border border-indigo-500 bg-indigo-500 px-10 py-1 font-semibold text-white"
                            >
                              Download
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
  );
};

export default AdminAssined;
