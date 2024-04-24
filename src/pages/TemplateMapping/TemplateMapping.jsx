import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { onGetTemplateHandler } from "../../services/common";

const TemplateMapping = () => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [templateHeaders, setTemplateHeaders] = useState();
  const [selectedAssociations, setSelectedAssociations] = useState({});
  const { id } = useParams();

  const location = useLocation();
  const navigate = useNavigate();
  let fileId = location.state?.fileId;

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await onGetTemplateHandler();
        const templateData = response?.find((data) => data.id == id);
        templateData.templetedata.push({ attribute: "Image" });
        setTemplateHeaders(templateData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTemplate();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://192.168.0.116:4000/get/headerdata/${fileId}`
        );
        setCsvHeaders(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [fileId]);

  const handleCsvHeaderChange = (csvHeader, index) => {
    const updatedAssociations = { ...selectedAssociations };
    updatedAssociations[csvHeader] = index;
    setSelectedAssociations(updatedAssociations);

    csvHeaders.forEach((header) => {
      if (!(header in updatedAssociations)) {
        updatedAssociations[header] = "";
      }
    });

    setSelectedAssociations(updatedAssociations);
  };

  const handleTemplateHeaderChange = (csvHeader, templateHeader) => {
    const updatedAssociations = { ...selectedAssociations };
    updatedAssociations[csvHeader] = templateHeader;

    csvHeaders.forEach((header) => {
      if (!(header in updatedAssociations)) {
        updatedAssociations[header] = "";
      }
    });

    setSelectedAssociations(updatedAssociations);
  };

  const onMapSubmitHandler = async () => {
    const mappedvalues = Object.values(selectedAssociations);
    // if (Object.keys(selectedAssociations).length !== csvHeaders.length) {
    //   toast.error("please map all fields. ");
    //   return;
    // }
    // console.log(selectedAssociations);
    if (!mappedvalues.includes("Image")) {
      toast.error("Please select all the field properly.");
      return;
    }

    const newObj = {
      ...selectedAssociations,
      fileId: fileId,
    };

    try {
      const response = await axios.post(
        `http://192.168.0.116:4000/data`,
        newObj
      );
      // console.log(response);
      toast.success("Mapping successfully done.");
      // navigate(`/datamatching/${fileId}`, { state: id });
      navigate(`/datamatching/${fileId}`, { state: id });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className="py-12 min-h-[100vh] overflow-y overflow-x-auto flex justify-center"
      style={{ backgroundColor: "#180C2E" }}
    >
      <div className="w-[700px]">
        <h1 className="text-white text-4xl text-center mb-5">Mapping</h1>
        {csvHeaders &&
          csvHeaders.map((csvHeader, index) => (
            <div key={index} className="flex w-full">
              <select
                className="form-select form-select-lg mb-3 text-2xl font-semibold text-center"
                aria-label="Large select example"
                onChange={(e) =>
                  handleCsvHeaderChange(csvHeader, e.target.value)
                }
                value={csvHeader}
              >
                <option disabled>Csv Header Name</option>
                {csvHeaders.map((csvData, idx) => (
                  <option key={idx} value={csvData}>
                    {csvData}
                  </option>
                ))}
              </select>
              {/* User Typed field */}

              <select
                className="form-select form-select-lg mb-3 text-2xl offset-3 font-semibold text-center"
                aria-label="Large select example"
                onChange={(e) =>
                  handleTemplateHeaderChange(csvHeader, e.target.value)
                }
                value={selectedAssociations[csvHeader] || "User Field Name"}
              >
                <option disabled>User Field Name</option>
                {templateHeaders &&
                  templateHeaders?.templetedata?.map((template, idx) => (
                    <option key={idx} value={template.attribute}>
                      {template.attribute}
                    </option>
                  ))}
              </select>
            </div>
          ))}

        <div className="text-center mt-5 pt-5">
          <label
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
            className="font-medium  text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl
           shadow-md cursor-pointer select-none text-xl px-12 py-2 hover:shadow-xl active:shadow-md"
          >
            <span>Save</span>
          </label>
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog-centered ">
              <div className="modal-content px-3 py-2 bg-white">
                <div className="modal-header ">
                  <h1
                    className="modal-title fs-5 fw-bold text-gray-500 ms-4"
                    id="exampleModalLabel"
                  >
                    Mapped Data..
                  </h1>
                  <button
                    type="button"
                    className="btn-close text-xl"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body text-lg text-gray-600 font-semibold my-2 overflow-y-auto h-[300px]">
                  <dl className="-my-3 divide-y divide-gray-100 text-sm">
                    {Object.entries(selectedAssociations).map(
                      ([csvHeader, templateHeader], index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 gap-1 py-3 even:bg-gray-50 sm:grid-cols-3 sm:gap-4"
                        >
                          <dt className="font-medium text-gray-900">
                            {csvHeader}
                          </dt>
                          <dd className="text-gray-700 sm:col-span-2">
                            {templateHeader}
                          </dd>
                        </div>
                      )
                    )}
                  </dl>
                </div>
                <label
                  onClick={onMapSubmitHandler}
                  className="font-medium my-3 ms-auto me-3 text-white bg-teal-600 hover:bg-teal-500 rounded-xl
                shadow-md cursor-pointer select-none text-xl px-8 py-1 hover:shadow-xl active:shadow-md"
                >
                  <button data-bs-dismiss="modal" aria-label="Close">
                    Submit
                  </button>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TemplateMapping;
