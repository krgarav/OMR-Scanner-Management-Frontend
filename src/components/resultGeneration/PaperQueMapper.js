import React, { useContext, useRef, useState } from "react";
import ResultGenerationContext from "../../Store/ResultGenerationContext";

const PaperQueMapper = () => {
  const [selectedQueOpen, setSelectedQueOpen] = useState(false);
  const [mappedQue, setMappedQue] = useState(null);
  const totalQue = useRef();
  const ctx = useContext(ResultGenerationContext);
  const keyHEaders = ctx.keyHeaders;
  const dataHeaders = ctx.dataHeaders;

  return (
    <>
      {" "}
      {keyHEaders && dataHeaders && (
        <>
          <div className=" m-2 mt-5  animate__animated animate__backInDown animate__slower ">
            <div
              className=" w-[100%]   "
              onClick={() => {
                setSelectedQueOpen(false);
              }}
            >
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-[100%] rounded-lg flex flex-col items-center py-4">
                <div className="text-[1.2rem] font-bold">start Question :</div>
                <div
                  className="border w-[80%] ms-2 flex flex-col items-center"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedQueOpen(!selectedQueOpen); // open the dropdown after selecting the Question key
                  }}
                >
                  {!mappedQue ? (
                    <div
                      className="font-semibold py-1"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedQueOpen(true); // open the dropdown after selecting the Question key
                      }}
                    >
                      click here to select
                    </div>
                  ) : (
                    <div
                      className="font-semibold "
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedQueOpen(true); // open the dropdown after selecting the Question key
                      }}
                    >
                      {dataHeaders[0][mappedQue]}
                    </div>
                  )}
                  {selectedQueOpen && (
                    <div className="w-[200px] h-[100px] overflow-y-scroll">
                      {keyHEaders[0].map((currentKey, index) => (
                        <div
                          className="h-[50px]"
                          key={currentKey}
                          onClick={(event) => {
                            event.stopPropagation();
                            setMappedQue(index);
                            // mappedQuesHandler(index);
                            setSelectedQueOpen(false); // Close the dropdown after selecting the key
                            ctx.paperMarkHandler({ start: index });
                            console.log(
                              "selected key:",
                              keyHEaders[0][index],
                              keyHEaders[0][100 + index - 1],
                              index
                            );
                          }}
                        >
                          {currentKey}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>{" "}
          <div className=" m-2 mt-5  animate__animated animate__backInDown animate__slower ">
            <div className=" w-[100%]   " onClick={() => {}}>
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-[100%] rounded-lg flex flex-col items-center py-4">
                <div className="text-[1.2rem] font-bold">
                  total question in paper :
                </div>
                <input
                  ref={totalQue}
                  defaultValue={+100}
                  type="number"
                  min={0}
                  onBlur={() =>
                    ctx.paperMarkHandler({ end: +totalQue.current.value })
                  }
                ></input>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PaperQueMapper;
