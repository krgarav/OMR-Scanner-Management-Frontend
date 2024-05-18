import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "../../assets/images/uploaderIcon.png";
import { toast } from "react-toastify";
import UTIF from "utif";
// import Tiff from "tiff.js";

const ImageUploader = () => {
  // const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState("tiff");
  const [newValue, setNewValue] = useState(1);
  const [openUpload, setOpenUpload] = useState(true);

  const navigate = useNavigate();

  // Function to handle image drop
  const handleDrop = (e, index) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleImages(file, index);
  };

  // Function to handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleImages(files);
  };
  // Function to handle both image selection and drop
  const handleImages = (files) => {
    if (!files || files.length === 0) return;

    const newImages = [];
    const newImageNames = [];
    let processedCount = 0;

    const handleFileLoad = (file, data) => {
      if (file.type === "image/tiff") {
        const arrayBuffer = data;
        const ifds = UTIF.decode(arrayBuffer);

        ifds.forEach((ifd, index) => {
          UTIF.decodeImage(arrayBuffer, ifds);
          const rgba = UTIF.toRGBA8(ifd);

          const blob = new Blob([new Uint8Array(rgba)], { type: "image/jpeg" });
          const reader = new FileReader();
          reader.onload = () => {
            const base64data = reader.result;
            newImages.push(base64data);
            newImageNames.push(`${file.name} - Page ${index + 1}`);
            processedCount++;
            if (processedCount === files.length) {
              setImages((prevImages) => [...prevImages, ...newImages]);
              setImageNames((prevImageNames) => [
                ...prevImageNames,
                ...newImageNames,
              ]);
              localStorage.setItem("images", JSON.stringify([...newImages]));
              toast.success("Images selected successfully.");
            }
          };
          reader.readAsDataURL(blob);
        });
      } else {
        newImages.push(data);
        newImageNames.push(file.name);
        processedCount++;
        if (processedCount === files.length) {
          setImages((prevImages) => [...prevImages, ...newImages]);
          setImageNames((prevImageNames) => [
            ...prevImageNames,
            ...newImageNames,
          ]);
          localStorage.setItem("images", JSON.stringify([...newImages]));
          toast.success("Images selected successfully.");
        }
      }
    };

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => handleFileLoad(file, reader.result);

      if (file.type === "image/tiff") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };


  // Prevent default behavior on drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFormatChange = (e) => {
    setSelectedFormat(e.target.value);
    setOpenUpload(!openUpload);
  };

  const handlePageValueChange = (e) => {
    e.preventDefault();
    setNewValue(e.target.value);
  };

  const handleSubmitNoPages = () => {
    setOpenUpload(!openUpload);
  };

  // const handleFinalSubmit = () => {
  //   if (images.every((image) => image)) {
  //     localStorage.setItem("images", JSON.stringify(images));
  //     navigate("/imageuploader/scanner");
  //   } else {
  //     toast.error("Please upload all required images.");
  //   }
  // };

  const handleFinalSubmit = () => {
    if (images.every((image) => image)) {
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
        </div>
      </section>
    </div>
  );
};

export default ImageUploader;
