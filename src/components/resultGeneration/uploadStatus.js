import React, { useContext, useState } from "react";
import { FaRegCircleCheck } from "react-icons/fa6";
import ResultGenerationContext from "../../Store/ResultGenerationContext";

const UploadStatus = () => {


  const ctx=useContext(ResultGenerationContext)
  const selectedKEyOptionOpen = () => {
    // setSelectedKeyOpen(true);
  };
  const uploadFiles=ctx.uploadFiles
  return (
    
    <>
      {" "}
      {uploadFiles.map((current) => (
        <div
          className="m-2 animate__animated animate__backInDown"
          key={current}
        >
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-[100%] h-[150px] flex items-center  rounded-lg text-white font-bold text-[1.5rem] shadow-2xl shadow-grey-500">
            <div className="my-2">
              <FaRegCircleCheck className="w-[80px] h-[80px] mx-2" />
            </div>
            <p className="my-2 h-[100%] w-[100%] flex items-center overflow-y-hidden p-2 font-bolder">
              {current}
            </p>
          </div>
        </div>
      ))}
      
    </>
  );
};

export default UploadStatus;
