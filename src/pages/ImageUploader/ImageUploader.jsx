import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "../../assets/images/uploaderIcon.png";
import { toast } from "react-toastify";

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  // Function to handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleImage(file);
  };

  // Function to handle image drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImage(file);
  };

  // Function to handle both image selection and drop
  const handleImage = (file) => {
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        toast.success("Image selected successfully.");
        setImage(reader.result);
        navigate("/scanner", { state: { imageURL: reader.result } });
      };

      // Read the file as data URL regardless of the file type
      reader.readAsDataURL(file);
    }
  };

  // Prevent default behavior on drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <section
        className="bgImage"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="mx-auto max-w-screen-sm px-4 py-12 lg:flex lg:h-screen lg:items-center flex-col">
          <div className="mt-40">
            <h1 className="text-white text-4xl mb-8 font-bold">
              OMR India Outsources{" "}
            </h1>
          </div>
          <div className="mx-auto max-w-xxl border-2 border-dashed  border-white h-[35%] w-[90%] rounded-lg p-8 text-center ">
            <svg
              className="mx-auto h-20 w-20 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <h2 className="mt-1 text-lg font-large text-white mb-6">
              Create Template
            </h2>
            <div className="relative flex justify-center">
              <label
                className="flex items-center font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg shadow-md cursor-pointer select-none text-lg px-6 py-3 hover:shadow-xl active:shadow-md"
                htmlFor="file-upload"
              >
                <img src={uploadIcon} alt="uploadIcon" className="mr-2" />
                <span>Upload Image</span>
              </label>
              <input
                onChange={handleImageChange}
                id="file-upload"
                type="file"
                className="absolute -top-full opacity-0"
              />
            </div>
            <p className="mt-4 text-sm text-gray-400">
              or drag and drop an image here
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImageUploader;
