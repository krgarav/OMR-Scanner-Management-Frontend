import React, { useContext, useEffect, useState } from "react";
import axios, { all } from "axios";
import UploadFile from "../../assets/images/CsvUploaderImg copy.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import dataContext from "../../Store/DataContext";
import {
  onGetTemplateHandler,
  onGetVerifiedUserHandler,
} from "../../services/common";
import { REACT_APP_IP } from "../../services/common";

const CsvUploader = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [imageFolder, setImageFolder] = useState(null);
  const [selectedId, setSelectedId] = useState();
  const [allTemplates, setAllTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [imageNames, setImageNames] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const dataCtx = useContext(dataContext);
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("userData"));

  const data = allTemplates?.find((item) => item.id === selectedId);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        const user = await onGetVerifiedUserHandler();
        setCurrentUser(user.user);
        const csvTemplates = response.filter(
          (data) => data.TempleteType === "Data Entry"
        );
        setAllTemplates(csvTemplates);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, []);

  const filteredTemplates = allTemplates?.filter((template) =>
    template.name.toLowerCase().includes(templateName.toLowerCase())
  );

  const onCsvFileHandler = (event) => {
    const fileInput = event.target.files[0];
    handleFileUpload(
      fileInput,
      ["csv", "xlsx"],
      "Please upload a CSV or Excel file.",
      setCsvFile
    );
  };

  const handleImageNameChange = (index, value) => {
    setImageNames((prevNames) => {
      const updatedNames = [...prevNames];
      updatedNames[index] = value;
      return updatedNames;
    });
  };

  const onImageFolderHandler = (event) => {
    const fileInput = event.target.files[0];
    handleFileUpload(
      fileInput,
      ["zip", "folder"],
      "Please upload a ZIP file or a folder.",
      setImageFolder
    );
  };

  const handleFileUpload = (
    file,
    allowedExtensions,
    errorMessage,
    setFileState
  ) => {
    if (file) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        toast.error(errorMessage);
        return;
      }
      setFileState(file);
    }
  };

  const onSaveFilesHandler = async () => {
    if (!selectedId) {
      toast.error("Please select the template name.");
      return;
    }

    if (currentUser.role !== "Admin") {
      toast.warning("Access denied. Admins only.");
      return;
    }

    if (imageNames.length !== data.pageCount) {
      toast.error("Please fill in all image fields.");
      return;
    }

    if (!csvFile) {
      toast.error("Please upload the CSV file.");
      return;
    }

    if (!imageFolder) {
      toast.error("Please upload the image folder.");
      return;
    }
    dataCtx.modifyIsLoading(true);
    const formData = new FormData();
    formData.append("csvFile", csvFile);
    formData.append("zipFile", imageFolder);

    const imageNamesString = imageNames.join(",");

    if (selectedId) {
      try {
        const response = await axios.post(
          `http://${REACT_APP_IP}:4000/upload/${selectedId}?imageNames=${imageNamesString}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              token: token,
            },
          }
        );
        const fileId = response.data;
        toast.success("Files uploaded successfully!");
        dataCtx.modifyIsLoading(false);
        navigate(`/csvuploader/duplicatedetector/${selectedId}`);
        localStorage.setItem("fileId", JSON.stringify(fileId));
        localStorage.setItem("pageCount", JSON.stringify(data.pageCount));
        localStorage.setItem("imageName", JSON.stringify(imageNamesString));
      } catch (error) {
        console.error("Error uploading files: ", error);
        // toast.error("Something went wrong please refresh the page.");
        dataCtx.modifyIsLoading(false);
        toast.error(error.response?.data?.error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-auto w-full">
      {dataCtx?.isLoading ? (
        <Loader />
      ) : (
        <div className="csvuploader xl:h-[100vh] w-full flex flex-col justify-center items-center">
          <div className="pt-4 xl:pt-0">
            <div className="xl:flex justify-center items-center gap-5  mx-5 pt-20 ">
              <div
                className="mx-auto max-w-xl  min-h-[300px] bg-white px-8 py-4  text-center shadow-lg"
                style={{ borderRadius: "20px" }}
              >
                <h1 className="pb-2 text-xl font-semibold text-center">
                  Template Name
                </h1>
                <div className="form relative pb-3">
                  <button className="absolute" style={{ top: "10px" }}>
                    <svg
                      className="w-5 h-5 text-gray-700"
                      aria-labelledby="search"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      height="16"
                      width="17"
                    >
                      <path
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="1.333"
                        stroke="currentColor"
                        d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                      ></path>
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    required
                    placeholder="Search..."
                    className="input rounded-full ps-5 py-1 border-2 rounded-4 border-transparent  focus:outline-none focus:border-blue-500 placeholder-gray-400"
                  />
                </div>
                <div className="overflow-y-scroll h-[20vh] px-2 bg-white">
                  {filteredTemplates?.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedId(template.id)}
                      className={`group flex items-center justify-between w-full mt-2 rounded-lg hover:bg-gray-300 bg-gray-100 px-4 py-2 text-gray-700 ${
                        selectedId === template.id
                          ? "bg-gray-500 text-white"
                          : "text-gray-500  hover:text-gray-700"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {template.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    <div className="rounded-lg">
                      {data &&
                        Array.from({ length: data.pageCount }).map(
                          (_, index) => (
                            <div key={index} className="flex gap-3">
                              <input
                                type="text"
                                value={imageNames[index] || ""}
                                onChange={(e) =>
                                  handleImageNameChange(index, e.target.value)
                                }
                                required
                                placeholder={
                                  data.pageCount === 1
                                    ? "image name"
                                    : `enter ${
                                        index === 0 ? "first" : "second"
                                      } image name`
                                }
                                className="input rounded-full px-3 mb-5 py-1  border-1 border-gray-200 rounded-3 border-transparent shadow focus:outline-none focus:border-blue-500 placeholder-gray-400"
                              />
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="mx-auto max-w-xl border-4 border-dashed px-28 mt-5 text-center shadow-md shadow-teal-400 pb-5"
                style={{ borderColor: "skyblue", borderRadius: "60px" }}
              >
                <img
                  src={UploadFile}
                  alt="uploadIcon"
                  width={"25%"}
                  className=" mx-auto mt-5 pt-3 mb-4"
                />
                <h2 className=" text-xl font-semibold text-white mb-4 mt-5">
                  Drag and Drop file to upload <br /> or{" "}
                </h2>
                <div className="relative flex justify-center">
                  <label
                    className="flex items-center font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl shadow-md cursor-pointer select-none text-lg px-6 py-2 hover:shadow-xl active:shadow-md"
                    htmlFor="file-upload"
                  >
                    <span>Upload CSV File : {csvFile?.name}</span>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx"
                    name="file"
                    onChange={onCsvFileHandler}
                    className="absolute -top-full opacity-0"
                  />
                </div>
                <p className="text-white font-medium my-3">
                  Supported files: xlsx
                </p>
              </div>
              {/* 2nd section */}
              <div
                className="mx-auto max-w-xl border-4 border-dashed px-28 mt-5 text-center shadow-md pb-5"
                style={{ borderColor: "skyblue", borderRadius: "60px" }}
              >
                <img
                  src={UploadFile}
                  alt="uploadIcon"
                  width={"25%"}
                  className=" mx-auto mt-5 pt-3 mb-4"
                />

                <h2 className=" text-xl font-semibold text-white mb-4 mt-5">
                  Drag and Drop file to upload <br /> or{" "}
                </h2>
                <div className="relative flex justify-center">
                  <label
                    className="flex items-center font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl shadow-md cursor-pointer select-none text-lg px-6 py-2 hover:shadow-xl active:shadow-md"
                    htmlFor="image-folder-upload"
                  >
                    <span>Upload Zip file : {imageFolder?.name}</span>

                    <input
                      id="image-folder-upload"
                      type="file"
                      accept=".zip,.folder"
                      multiple
                      name="file"
                      onChange={onImageFolderHandler}
                      className="absolute -top-full opacity-0"
                    />
                  </label>
                </div>
                <p className="text-white font-medium my-3">
                  Supported files: .zip
                </p>
              </div>
            </div>
            <div className="mt-4 mb-4 w-full flex justify-center">
              <button
                type="submit"
                onClick={onSaveFilesHandler}
                className="bg-teal-600 px-5 text-white py-3 text-xl font-medium rounded-xl"
              >
                Save Files
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
