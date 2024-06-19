import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Modal from "react-modal";
import LoginComponent from "./LoginComponent";
import RegisterComponent from "./RegisterComponent"; // Import RegisterComponent

Modal.setAppElement("#root");

function NavbarComponent({ handleLogout }) {
  const location = useLocation(); // Get current route
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false);
  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggedIn(true);
    }
  }, []);

  const openLoginForm = () => {
    setIsLoginFormOpen(true);
  };

  const closeLoginForm = () => {
    setIsLoginFormOpen(false);
  };

  const openRegisterForm = () => {
    setIsRegisterFormOpen(true);
  };

  const closeRegisterForm = () => {
    setIsRegisterFormOpen(false);
  };

  function handleLogout() {
    const token = localStorage.getItem("token");
    console.log(token);

    fetch("https://gisapis.manpits.xyz/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          setLoggedIn(false);
          alert("Logout Successful");
          console.log("Logout successful");
          const token = localStorage.removeItem("token");
          console.log(token);
          window.location.reload();
        } else {
          console.error("Logout failed");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Determine the text based on the current route
  const getHeaderText = () => {
    if (location.pathname === "/") {
      return "Geographic Information System of Bali Roads";
    } else if (location.pathname === "/add-road") {
      return "Add Road Menu";
    } else if (location.pathname.startsWith("/edit-road")) {
      const roadId = location.pathname.split("/")[2];
      return `Edit Road ${roadId}`;
    } else if (location.pathname === "/road-data") {
      return "Road Data";
    } else {
      return "Geographic Information System of Bali Roads";
    }
  };

  return (
    <div>
      <nav className="navbar fixed w-full bg-white border-gray-200 dark:bg-gray-900 mb-2 shadow-sm">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            className="flex items-center space-x-3 rtl:space-x-reverse"
            href="/"
          >
            <img
              src="src/assets/da-logo.jpeg"
              className="h-10"
              alt="Image Failed"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              FindWay
            </span>
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {!isLoggedIn && (
              <button
                type="button"
                onClick={openLoginForm}
                className="me-3 text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-black dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Sign In
              </button>
            )}
            {!isLoggedIn && (
              <button
                type="button"
                onClick={openRegisterForm}
                className="text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-black dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Sign Up
              </button>
            )}
            {isLoggedIn && (
              <button
                type="button"
                className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                onClick={handleLogout}
              >
                Log Out
              </button>
            )}
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-cta"
          >
            <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <span
                  className="block py-2 px-3 md:p-0 text-white bg-black rounded md:bg-transparent md:text-black md:dark:text-gray-300"
                  aria-current="page"
                >
                  {getHeaderText()}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Modal untuk LoginComponent */}
      <Modal
        isOpen={isLoginFormOpen}
        onRequestClose={closeLoginForm}
        className="modal"
        overlayClassName="overlay"
      >
        <LoginComponent onClose={closeLoginForm} setLoggedIn={setLoggedIn} />
      </Modal>
      {/* Modal untuk RegisterComponent */}
      <Modal
        isOpen={isRegisterFormOpen}
        onRequestClose={closeRegisterForm}
        className="modal"
        overlayClassName="overlay"
      >
        <RegisterComponent
          onClose={closeRegisterForm}
          setRegistered={isLoggedIn}
        />
      </Modal>
    </div>
  );
}

export default NavbarComponent;
