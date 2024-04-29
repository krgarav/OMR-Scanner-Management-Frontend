import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { REACT_APP_IP } from "../../services/common";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    userName: "",
    mobile: "",
    email: "",
    password: "",
    role: "",
    permissions: {
      dataEntry: false,
      csvCompare: false,
      resultGenerator: false,
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        permissions: {
          ...formData.permissions,
          [name]: checked,
        },
      });
    } else {
      if (name === "mobile") {
        // Allow only numbers
        const formattedValue = value.replace(/\D/g, "");
        setFormData({
          ...formData,
          [name]: formattedValue,
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  const validateMobile = (value) => {
    const regex = /^\d{10}$/;
    return regex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.role ||
      !formData.permissions ||
      !formData.userName ||
      !formData.mobile ||
      !formData.email ||
      !formData.password
    ) {
      return toast.error("plzz select role and permission");
    }

    if (!validateMobile(formData.mobile)) {
      return toast.error("Invalid mobile number:", formData.mobile);
    }

    const { permissions } = formData;
    const isAnyPermissionTrue = Object.values(permissions).some(
      (permission) => permission === true
    );

    if (!isAnyPermissionTrue) {
      return toast.error("Please select at least one permission");
    }
    try {
      const response = await axios.post(
        `http://${REACT_APP_IP}:4000/users/createuser`,
        formData
      );
      console.log(response.data);
      setFormData({
        userName: "",
        mobile: "",
        email: "",
        password: "",
        role: "",
        permissions: {
          dataEntry: false,
          csvCompare: false,
          resultGenerator: false,
        },
      });
      toast.success("User Created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Email already exists");
    }
  };

  return (
    <div className="pt-28">
      <div className="max-w-2xl mx-auto mt-8 shadow-lg rounded-xl py-10 px-16 bg-green-50">
        <div className="mb-10">
          <h2 className="text-center text-3xl font-bold leading-tight text-black">
            Create a New User
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:space-x-10 w-full">
            <div className="w-full">
              <label htmlFor="userName" className="block text-lg font-medium ">
                Username
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                autoComplete="userName"
                required
                value={formData?.userName}
                placeholder="Enter Username"
                onChange={handleChange}
                className="mt-2  focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-2 shadow-md shadow-blue-100 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="w-full mt-4 sm:mt-0">
              <label htmlFor="mobile" className="block text-lg font-medium ">
                Mobile
              </label>
              <input
                id="mobile"
                name="mobile"
                type="text"
                autoComplete="mobile"
                placeholder="Enter Mobile no."
                maxLength={10}
                required
                value={formData?.mobile}
                onChange={handleChange}
                className="mt-2  focus:ring-indigo-500 focus:border-indigo-500 block w-full px-4 py-2 shadow-md shadow-blue-100 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="w-full">
            <label htmlFor="email" className="block text-lg font-medium ">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter Email ID"
              required
              value={formData?.email}
              onChange={handleChange}
              className="mt-2  px-4 py-2 shadow-md shadow-blue-100 focus:ring-indigo-500 focus:border-indigo-500 block w-full  sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-10 w-full">
            <div className="w-full">
              <label htmlFor="password" className="block text-lg font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter Password"
                required
                value={formData?.password}
                onChange={handleChange}
                className="mt-2 px-4 py-2 shadow-md shadow-blue-100 focus:ring-indigo-500 focus:border-indigo-500 block w-full  sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="w-full mt-4  sm:mt-0">
              <label className="block text-lg font-medium">Role</label>
              <select
                id="role"
                name="role"
                required
                value={formData?.role}
                onChange={handleChange}
                className="mt-2 block w-full py-2 px-4 border  shadow-blue-100 bg-white rounded-md shadow-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option disabled value="">
                  Select role
                </option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="Operator">Operator</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-lg   font-medium">Permissions</label>
            <div className="flex flex-wrap justify-between gap-4 w-full mt-2 ">
              <div className="flex items-center">
                <input
                  id="dataEntry"
                  name="dataEntry"
                  type="checkbox"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={formData?.permissions?.dataEntry}
                  onChange={handleChange}
                />
                <label
                  htmlFor="dataEntry"
                  className="ml-2 block text-md text-gray-900 font-semibold"
                >
                  Data Entry
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="csvCompare"
                  name="csvCompare"
                  type="checkbox"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={formData?.permissions?.csvCompare}
                  onChange={handleChange}
                />
                <label
                  htmlFor="csvCompare"
                  className="ml-2 block text-md text-gray-900 font-semibold"
                >
                  CSV Compare
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="resultGenerator"
                  name="resultGenerator"
                  type="checkbox"
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  checked={formData?.permissions?.resultGenerator}
                  onChange={handleChange}
                />
                <label
                  htmlFor="resultGenerator"
                  className="ml-2 block text-md text-gray-900 font-semibold"
                >
                  Result Generator
                </label>
              </div>
            </div>
          </div>
          <div className="pt-1">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md shadow-indigo-200 text-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
