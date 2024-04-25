import React, { useContext, useState } from "react";
import ResultGenerationContext from "../../Store/ResultGenerationContext";
import GenerateResultCsv from "./GenerateResultCsv";

const OutPutHeaders = () => {
  const ctx = useContext(ResultGenerationContext);
  const dataHeaders = ctx.dataHeaders;
  const subjectMArking = ctx.subjectMarkings.length;

  const [headers, setHeaders] = useState([]);
  const outPutHeadersHandler = (data) => {
    // headers.push(data);
    const findHeader = headers.includes(data);

    if (findHeader) {
      // if header will be present then we will remove it
      const filteredHEaders = headers.filter((current) => current !== data);
      setHeaders(filteredHEaders);
    } else {
      setHeaders((prev) => [...prev, data]);
    }
  };
  console.log(headers);
  return (
    //  {/* outputheaders */}
    <>
      {" "}
      <div className="h-auto border-2 flex w-[20vw] min-w-[300px] max-[1020px]:w-[100%] mb-[70px]">
        <div className="mx-2 w-[100%]">
          <div className="animate__animated animate__bounceInDown animate__delay-3s">
            {" "}
            <div className=" w-[100%] bg-gradient-to-r from-red-600 to-yellow-500 shadow-2xl flex justify-center text-2xl font-bold border-4 border-2 border-white my-4">
              <p className="bg-grey py-4 text-white "> OutPut Headers</p>
            </div>
            <div className="min-[816px]:max-h-[50vh] min-[816px]:min-h-[30vh] bg-gradient-to-r from-cyan-500 to-blue-500 border-2 overflow-y-scroll pb-[70px]">
              {dataHeaders &&
                dataHeaders[0].map((current, index) => {
                  return (
                    <div
                      className="    hover:bg-yellow-500"
                      key={index}
                      onClick={() => outPutHeadersHandler(current)}
                    >
                      <input
                        type="checkbox"
                        id={current}
                        name={current}
                        checked={headers.includes(current)}
                        className="mx-2 h-[20px] w-[20px] my-2"
                      />
                      <label
                        htmlFor="scales"
                        className="mx-4 text-[1.1rem] font-bold text-white"
                      >
                        {current}
                      </label>
                      <hr className="mt-2"></hr>
                    </div>
                  );
                })}
            </div>{" "}
          </div>  <GenerateResultCsv headers={headers}></GenerateResultCsv>
        </div>
      </div>
    
    </>
  );
};

export default OutPutHeaders;
