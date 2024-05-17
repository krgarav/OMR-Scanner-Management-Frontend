import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "../../assets/images/uploaderIcon.png";
import { toast } from "react-toastify";

const ImageUploader = () => {
  // const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("tiff");
  const [newValue, setNewValue] = useState(1);
  const [openUpload, setOpenUpload] = useState(true);

  const navigate = useNavigate();

  // Function to handle image selection
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    handleImage(file, index);
  };

  // Function to handle image drop
  const handleDrop = (e, index) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImage(file, index);
  };

  // Function to handle both image selection and drop
  const handleImage = (file, index) => {
    if (file) {
      const imageTypes = ["image/jpeg", "image/jpeg", "image/jpeg "];
      if (imageTypes.includes(file.type)) {
        const reader = new FileReader();

        reader.onload = () => {
          toast.success("Image selected successfully.");
          const newImages = [...images];
          const newImageNames = [...imageNames];
          newImages[index] = reader.result;
          newImageNames[index] = file.name;
          setImages(newImages);
          setImageNames(newImageNames);
        };

        reader.readAsDataURL(file);
      } else {
        toast.error("Please select a valid image file (jpg, png, etc).");
      }
    }
  };

  // Prevent default behavior on drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
  };

  const handlePageValueChange = (e) => {
    e.preventDefault();
    setNewValue(e.target.value);
  };

  const handleSubmitNoPages = () => {
    setOpenUpload(!openUpload);
  };

  const handleFinalSubmit = () => {
    if (
      images.length === parseInt(newValue) &&
      images.every((image) => image)
    ) {
      localStorage.setItem("images", JSON.stringify(images));
      navigate("/imageuploader/scanner");
    } else {
      toast.error("Please upload all required images.");
    }
  };

  return (
    <div>
      <section className="bgImage h-[100vh]">
        <div className="mx-auto max-w-screen-sm px-4 py-12 lg:flex lg:h-screen lg:items-center flex-col">
          {!openUpload && (
            <>
              <div className="mt-40">
                <h1 className="text-white text-center text-4xl mb-8 font-bold">
                  OMR India Outsources
                </h1>
              </div>
              <div>
                {imageNames.map((name, index) => (
                  <div key={index} className="text-white text-lg mb-2">
                    {name}
                  </div>
                ))}
              </div>

                         
              <div className="relative flex justify-center">
                {[...Array(parseInt(newValue))].map((_, index) => (
                  <div key={index} className="mt-4">
                    <label
                      className="flex items-center font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg shadow-md cursor-pointer select-none text-lg px-6 py-3 hover:shadow-xl active:shadow-md"
                      htmlFor={`file-upload-${index}`}
                    >
                      <img src={uploadIcon} alt="uploadIcon" className="mr-2" />
                      <span>{imageNames[index] || "Upload Image"}</span>
                    </label>
                    <input
                      onChange={(e) => handleImageChange(e, index)}
                      id={`file-upload-${index}`}
                      type="file"
                      className="absolute -top-full opacity-0"
                    />
                  </div>  
                ))}
              </div>

              <div className="relative flex justify-center mt-8">
                <label
                  className="flex items-center font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg shadow-md cursor-pointer select-none text-lg px-6 py-3 hover:shadow-xl active:shadow-md"
                  htmlFor="file-upload"
                >
                  <img src={uploadIcon} alt="uploadIcon" className="mr-2" />
                  <span>Upload Images</span>
                </label>
                <input
                  onChange={handleImageChange}
                  id="file-upload"
                  type="file"
                  className="absolute -top-full opacity-0"
                  multiple
                />
              </div>
              <button
                onClick={handleFinalSubmit}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit All Images
              </button>
            </>
          )}

          {openUpload && (
            <div className="mt-96">
              <div className="flex m-4 items-center">
                <div>
                  <label htmlFor="tiff" className="text-white cursor-pointer">
                    Tiff
                    <input
                      type="radio"
                      name="imageFormat"
                      id="tiff"
                      className="size-6 cursor-pointer"
                      value="tiff"
                      checked={selectedFormat === "tiff"}
                      onChange={handleFormatChange}
                    />
                  </label>
                </div>
                <div>
                  <label htmlFor="jpeg" className="text-white cursor-pointer">
                    JPEG
                    <input
                      type="radio"
                      name="imageFormat"
                      id="jpeg"
                      className="size-6 cursor-pointer"
                      value="jpeg"
                      checked={selectedFormat === "jpeg"}
                      onChange={handleFormatChange}
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="bg-black">
                  <label className="text-white text-lg">
                    Enter Number of Pages:{" "}
                  </label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={handlePageValueChange}
                  />
                </div>
                <button onClick={handleSubmitNoPages}>Submit</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ImageUploader;
