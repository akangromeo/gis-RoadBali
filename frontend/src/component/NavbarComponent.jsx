import React, { useState, useEffect, Router } from "react";
import Modal from "react-modal";
import LoginComponent from "./LoginComponent";
import RegisterComponent from "./RegisterComponent"; // Import RegisterComponent

Modal.setAppElement("#root");

function NavbarComponent({ handleLogout }) {
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
    // Ambil token dari local storage atau dari state, sesuai dengan cara Anda menyimpannya saat login
    const token = localStorage.getItem("token"); // Ubah 'token' sesuai dengan key yang Anda gunakan saat menyimpan token
    console.log(token);
    // Kirim permintaan ke backend untuk logout
    fetch("https://gisapis.manpits.xyz/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          // Jika logout berhasil, atur isLoggedIn menjadi false
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

  return (
    <div>
      <nav className="navbar fixed w-full bg-white border-gray-200 dark:bg-gray-900">
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
                onClick={openLoginForm} // Panggil fungsi untuk membuka modal login
                className="me-3 text-white bg-black hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-black dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Sign In
              </button>
            )}
            {!isLoggedIn && (
              <button
                type="button"
                onClick={openRegisterForm} // Panggil fungsi untuk membuka modal register
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
                <a
                  href=""
                  className="block py-2 px-3 md:p-0 text-white bg-black rounded md:bg-transparent md:text-black md:dark:text-gray-300"
                  aria-current="page"
                >
                  Geographic Information System of Bali Roads
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* Modal untuk LoginComponent */}
      <Modal
        isOpen={isLoginFormOpen} // State untuk mengontrol visibilitas modal
        onRequestClose={closeLoginForm} // Fungsi untuk menutup modal saat tombol close atau di luar modal diklik
        className="modal" // Class untuk styling modal
        overlayClassName="overlay" // Class untuk styling overlay modal
      >
        <LoginComponent onClose={closeLoginForm} setLoggedIn={setLoggedIn} />{" "}
        {/* LoginComponent di dalam modal */}
      </Modal>
      {/* Modal untuk RegisterComponent */}
      <Modal
        isOpen={isRegisterFormOpen} // State untuk mengontrol visibilitas modal
        onRequestClose={closeRegisterForm} // Fungsi untuk menutup modal saat tombol close atau di luar modal diklik
        className="modal" // Class untuk styling modal
        overlayClassName="overlay" // Class untuk styling overlay modal
      >
        <RegisterComponent
          onClose={closeRegisterForm}
          setRegistered={isLoggedIn}
        />{" "}
        {/* RegisterComponent di dalam modal */}
      </Modal>
    </div>
  );
}

export default NavbarComponent;
