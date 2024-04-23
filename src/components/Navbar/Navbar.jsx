import React, { useContext } from "react";
import { TiThMenu } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import logo from "../../assets/images/image.png";
import { FaCircleUser } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import dataContext from "../../Store/DataContext";

const menuItems = [
  {
    name: "Create Template",
    href: "/imageuploader",
  },
  {
    name: "User Editor",
    permission: "userEditor",
    href: "#",
  },
  {
    name: "CSV Compare",
    permission: "csvCompare",
    href: "/comparecsv",
  },
  {
    name: "Result Generator",
    permission: "resultGenerator",
    href: "#",
  },
];

export default function Navbar(props) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const naviagte = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const userData = JSON.parse(localStorage.getItem("userData"));

  const { state } = props;

  const datactx = useContext(dataContext)


  const userMenuItems = [
    {
      name: "Create User",
      onClick: () => {
        naviagte("/create-user");
        setIsUserMenuOpen(false);
      },
    },
    {
      name: "All Users",
      onClick: () => {
        naviagte("/all-user");
        setIsUserMenuOpen(false);
      },
    },
    {
      name: "Logout",
      onClick: () => {
        localStorage.clear();
        datactx.modifyIslogin(false)
        naviagte("/");

        setIsUserMenuOpen(false);
      },
    },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const filteredMenuItems = menuItems?.filter(
    (item) => userData?.permissions[item.permission]
  );

  return (
    <div className="relative w-full bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <div className="inline-flex items-center space-x-2">
          <img className="h-14 w-auto" src={logo} alt="Your Company" />
        </div>
        <div className="hidden lg:block">
          <ul className="flex justify-center items-center space-x-2">
            {userData?.role === "Admin"
              ? menuItems?.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-lg px-2 rounded-md py-1 font-semibold text-gray-700 no-underline hover:text-black hover:bg-gray-300 "
                    >
                      {item.name}
                    </Link>
                  </li>
                ))
              : filteredMenuItems?.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-lg px-2 rounded-md py-1 font-semibold text-gray-700 hover:text-black hover:bg-gray-300 "
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
        <div className="relative">
          <button
            type="button"
            className="rounded-full"
            onClick={toggleUserMenu}
          >
            <FaCircleUser className="w-7 h-7 text- mt-1 text-indigo-700" />
          </button>
          {userData?.role === "Admin"
            ? isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {userMenuItems?.map((item) => (
                      <button
                        key={item.name}
                        onClick={item.onClick}
                        className="block px-4 py-2 text-md font-medium text-gray-600 hover:bg-gray-300 w-full text-left"
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            : isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {userMenuItems?.map(
                      (item) =>
                        item.name === "Logout" && (
                          <button
                            key={item.name}
                            onClick={item.onClick}
                            className="block px-4 py-2 text-md font-medium text-gray-600 hover:bg-gray-300 w-full text-left"
                          >
                            {item.name}
                          </button>
                        )
                    )}
                  </div>
                </div>
              )}
        </div>
        <div className="lg:hidden order-first">
          <TiThMenu
            onClick={toggleMenu}
            className="h-6 w-6 cursor-pointer text-blue-700"
          />
        </div>
        {isMenuOpen && (
          <div className="absolute inset-x-0 top-0 z-50  origin-top-right transform p-2 transition lg:hidden">
            <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-5 pb-6 pt-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center space-x-2">
                    <img
                      className="h-14 w-auto"
                      src={logo}
                      alt="Your Company"
                    />
                  </div>
                  <div className="">
                    <nav className="grid gap-y-4">
                      <ul className="inline-flex space-x-8">
                        {userData?.role === "Admin"
                          ? menuItems?.map((item) => (
                              <p key={item.name}>
                                <a
                                  href={item.href}
                                  className="text-sm px-2 no-underline rounded-md py-1 font-semibold text-gray-700 hover:text-black hover:bg-gray-300 "
                                >
                                  {item.name}
                                </a>
                              </p>
                            ))
                          : filteredMenuItems?.map((item) => (
                              <p key={item.name}>
                                <a
                                  href={item.href}
                                  className="text-sm px-2 rounded-md py-1 font-semibold text-gray-700 hover:text-black hover:bg-gray-300 "
                                >
                                  {item.name}
                                </a>
                              </p>
                            ))}
                      </ul>
                    </nav>
                  </div>
                  <div className="-mr-2">
                    <button
                      type="button"
                      onClick={toggleMenu}
                      className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      <span className="sr-only">Close menu</span>
                      <RxCross2
                        className="h-8 w-8 text-gray-700"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
