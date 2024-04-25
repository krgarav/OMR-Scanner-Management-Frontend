import axios from "axios";
import React, { useContext, useState } from "react";
import { ImFolderUpload } from "react-icons/im";
import MarksApply from "./MarksApply";
import SubjectWiseMarkApply from "./SubjectWiseMarkApply";
import OutPutHeaders from "./OutPutHeaders";
import UploadStatus from "./uploadStatus";
import PaperkeyMap from "./PaperKeyMap";
import PaperQueMapper from "./PaperQueMapper";
// import ResultGenerationContext from "../store/ResultGenerationContext";

import { toast } from "react-toastify";
import ResultGenerationContext from "../../Store/ResultGenerationContext";
import { REACT_APP_IP } from "../../services/common";
const UploadDataFile = () => {
  const [csvFile, setCsvFile] = useState(null);
  const ctx = useContext(ResultGenerationContext);

  const [uploadFiles, setUploadFiles] = useState([]);

  const keyHEaders = ctx.keyHeaders;
  const dataHeaders = ctx.dataHeaders;

  const csvfileUploader = (e) => {
    const formData = new FormData();
    formData.append("dataFile", e.target.files[0]);
    axios
      .post(`http://${REACT_APP_IP}:4000/upload/data`, formData)
      .then((res) => {
        setUploadFiles((prev) => {
          return [...prev, e.target.files[0].name];
        });
        ctx.uploadFilesHandler(e.target.files[0].name);

        ctx.uploadDataHeaders(res.data.data);
      })
      .catch((err) =>
        toast.error(
          "some problem while uploading data file ....check (.csv) file and try again later "
        )
      );
  };
  const keyfileUploader = (e) => {
    const formData = new FormData();
    formData.append("keyFile", e.target.files[0]);

    axios
      .post(`http://${REACT_APP_IP}:4000/upload/key`, formData)
      .then((res) => {
        setUploadFiles((prev) => {
          return [...prev, e.target.files[0].name];
        });
        ctx.uploadFilesHandler(e.target.files[0].name);

        ctx.uploadKeyHeaders(res.data.data);
      })
      .catch((err) =>
        toast.error(
          "some problem while uploading key file ....check (.csv) file and try again later "
        )
      );
  };
  return (
    <div className="h-[100vh] w-[100%] flex  pt-[70px] overflow-y-hidden">
      {uploadFiles.length > 0 && (
        <div className="h-[100%] border-2 flex flex-col min-w-[300px] w-[20vw] max-w-[900px]:min-w-[280px] overflow-y-scroll">
          <UploadStatus />
          <PaperkeyMap></PaperkeyMap>
          <PaperQueMapper></PaperQueMapper>
        </div>
      )}

      <div className=" w-[100%] flex max-[1020px]:flex-col overflow-y-scroll">
        <div className="h-[100%]  flex w-[100%] ">
          {!keyHEaders && (
            <div className=" flex flex-col items-center justify-center h-auto w-[100%]">
              {!dataHeaders && (
                <div
                  className="animate__animated animate__bounceInLeft bg-gradient-to-r from-green-400 to-blue-300 hover:from-pink-400 hover:to-yellow-600 w-[500px] rounded-lg py-4 font-semibold hover:font-bold shadow-2xl shadow-black"
                  onChange={csvfileUploader}
                >
                  <label
                    htmlFor="dataFile1"
                    className="block cursor-pointer mx-4 p-16 border-dashed border-white-500 border-4 hover:border-8"
                  >
                    <input type="file" id="dataFile1" className="hidden" />
                    <div className="flex flex-col justify-center items-center text-3xl">
                      <ImFolderUpload className="w-[80px] h-[80px] text-white" />{" "}
                      <p className="flex items-center mx-2  text-white ">
                        upload data file
                      </p>{" "}
                    </div>
                  </label>
                </div>
              )}
              {dataHeaders && !keyHEaders && (
                <div
                  className="animate__animated animate__bounceInRight animate__slow bg-gradient-to-r from-green-400 to-blue-300 hover:from-pink-400 hover:to-yellow-600 w-[500px] rounded-lg py-4 font-semibold hover:font-bold shadow-2xl shadow-black"
                  onChange={keyfileUploader}
                >
                  <label
                    htmlFor="dataFile2"
                    className="block cursor-pointer mx-4 p-16 border-dashed border-white-500 border-4 hover:border-8"
                  >
                    <input type="file" id="dataFile2" className="hidden" />
                    <div className="flex flex-col justify-center items-center text-3xl text-white">
                      <ImFolderUpload className="w-[80px] h-[80px]" />{" "}
                      <p className="flex items-center mx-2 ">upload key file</p>{" "}
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}
          {/* marks apply  */}
          {dataHeaders && keyHEaders && (
            <div className="w-[100%]">
              {dataHeaders && keyHEaders && <MarksApply></MarksApply>}
              {dataHeaders && keyHEaders && (
                <SubjectWiseMarkApply></SubjectWiseMarkApply>
              )}
            </div>
          )}
        </div>
        {dataHeaders && keyHEaders && (
          <OutPutHeaders></OutPutHeaders>

          // <div className="h-auto border-2 flex w-[20vw] min-w-[300px] max-[1020px]:w-[100%] mb-[70px]">
          //   <div className="mx-2 w-[100%]">
          //   </div>
          // </div>
        )}
      </div>
    </div>
  );
};

export default UploadDataFile;
