import React, { Fragment, useContext, useEffect, useState } from "react";
import axios from "axios";
import UploadFile from "../../assets/images/CsvUploaderImg copy.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/Loader";
import dataContext from "../../Store/DataContext";
import { onGetTemplateHandler } from "../../services/common";

const CsvUploader = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [imageFolder, setImageFolder] = useState(null);
  const [selectedId, setSelectedId] = useState();
  const [allTemplates, setAllTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [imageName, setImageName] = useState("");
  const dataCtx = useContext(dataContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        setAllTemplates(response);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dataCtx.modifyIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [dataCtx]);

  const filteredTemplates = allTemplates?.filter((template) =>
    template.name.toLowerCase().includes(templateName.toLowerCase())
  );

  const onCsvFileHandler = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const allowedExtensions = ["csv", "xlsx"];
      const extension = file?.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        toast.error("Please upload a CSV or Excel file.");
        return;
      }

      setCsvFile(file);
    }
  };

  const onImageFolderHandler = (event) => {
    if (event.target.files[0]) {
      const file = event.target.files[0];
      const allowedExtensions = ["zip", "folder"];
      const extension = file?.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(extension)) {
        toast.error("Please upload a ZIP file or a folder.");
        return;
      }

      setImageFolder(file);
    }
  };

  const onSaveFilesHandler = async () => {
    if (!selectedId) {
      toast.error("Please select the name.");
      return;
    }

    if (!imageName) {
      toast.error("Please enter the image name.");
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
    dataCtx.modifyIsLoading(false);
    const formData = new FormData();
    formData.append("csvFile", csvFile);
    formData.append("zipFile", imageFolder);

    if (selectedId) {
      try {
        const response = await axios.post(
          `http://192.168.0.116:4000/upload/${selectedId}?imageColName=${imageName}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const fileId = response.data;
        toast.success("Files uploaded successfully!");
        dataCtx.modifyIsLoading(false);

        navigate(`templatemap/${selectedId}`, { state: fileId });
      } catch (error) {
        console.error("Error uploading files: ", error);
        toast.error(error.message);
      }
    }
  };

  return (
    <div  className="csvuploader h-[100vh]">
      {dataCtx.isLoading ? (
        <Loader />
      ) : (
        <div>
          <div className="xl:flex justify-center items-center  gap-5 mb-5 pt-5 mx-5 mt-10">
            <div
              className="mx-auto max-w-xl  h-[50%] bg-white px-8 py-4 mt-5 text-center shadow-lg"
              style={{ borderRadius: "20px" }}
            >
              <h1 className="pb-2 text-xl font-semibold text-center">
                Template Name
              </h1>
              <div className="form relative pb-3">
                <button className="absolute ps-3" style={{ top: "10px" }}>
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
              <div className="overflow-y-scroll h-[240px] px-2">
                {filteredTemplates?.map((template) => (
                  <div key={template.id}>
                    <button
                      onClick={() => setSelectedId(template.id)}
                      className={`block rounded-lg px-4 py-1 text-md font-medium ${
                        selectedId === template.id
                          ? "bg-teal-500 text-white"
                          : "text-gray-500  hover:text-gray-700"
                      }`}
                    >
                      {template.name}
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-center">
                  <div className="rounded-lg">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={imageName}
                        onChange={(e) => setImageName(e.target.value)}
                        required
                        placeholder="enter image name..."
                        className="input rounded-full ps-3 py-1 mr-6 border-1 border-gray-200 rounded-3 border-transparent shadow  focus:outline-none focus:border-blue-500 placeholder-gray-400"
                      />
                    </div>
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
                  <span>Upload CSV File</span>
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
                  <span>Upload Zip file</span>

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
          <div className="flex justify-center py-5">
            <button
              type="submit"
              onClick={onSaveFilesHandler}
              className="btn btn-lg btn-success text-gray px-4 py-2 text-xl font-medium rounded-3xl"
            >
              Save Files{" "}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
