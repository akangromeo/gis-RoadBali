import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import PieChartComponent from "../component/PieChartComponent";

export default function DataRoad() {
  const [ruasJalan, setRuasJalan] = useState([]);
  const [jenisJalanOptions, setJenisJalanOptions] = useState({});
  const [eksistingOptions, setEksistingOptions] = useState({});
  const [kondisiOptions, setKondisiOptions] = useState({});
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const [desaDetails, setDesaDetails] = useState({});
  const [kecamatanDetails, setKecamatanDetails] = useState({});
  const [kabupatenDetails, setKabupatenDetails] = useState({});

  let counter = 0;

  // Function to fetch desa, kecamatan, kabupaten details
  const fetchLocationDetails = (desaId) => {
    const token = localStorage.getItem("token");
    fetch(`https://gisapis.manpits.xyz/api/kecamatanbydesaid/${desaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Location Details:", data);
        setDesaDetails((prevDetails) => ({
          ...prevDetails,
          [desaId]: data.desa,
        }));
        setKecamatanDetails((prevDetails) => ({
          ...prevDetails,
          [desaId]: data.kecamatan,
        }));
        setKabupatenDetails((prevDetails) => ({
          ...prevDetails,
          [desaId]: data.kabupaten,
        }));
        console.log(counter++);
      })
      .catch((error) =>
        console.error("Error fetching location details:", error)
      );
  };

  useEffect(() => {
    if (token) {
      console.log("Fetching ruas jalan...");
      fetch("https://gisapis.manpits.xyz/api/ruasjalan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Ruas Jalan Data:", data.ruasjalan);
          setRuasJalan(data.ruasjalan);

          data.ruasjalan.forEach((ruas) => {
            fetchLocationDetails(ruas.desa_id);
          });
        })
        .catch((error) => console.error("Error fetching ruas jalan:", error));

      fetch("https://gisapis.manpits.xyz/api/mjenisjalan", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const options = data.eksisting.reduce((acc, curr) => {
            acc[curr.id] = curr.jenisjalan;
            return acc;
          }, {});
          setJenisJalanOptions(options);
        })
        .catch((error) =>
          console.error("Error fetching jenis jalan options:", error)
        );

      fetch("https://gisapis.manpits.xyz/api/meksisting", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const options = data.eksisting.reduce((acc, curr) => {
            acc[curr.id] = curr.eksisting;
            return acc;
          }, {});
          setEksistingOptions(options);
        })
        .catch((error) =>
          console.error("Error fetching eksisting options:", error)
        );

      fetch("https://gisapis.manpits.xyz/api/mkondisi", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const options = data.eksisting.reduce((acc, curr) => {
            acc[curr.id] = curr.kondisi;
            return acc;
          }, {});
          setKondisiOptions(options);
        })
        .catch((error) =>
          console.error("Error fetching kondisi options:", error)
        );
    }
  }, [token]);

  const deleteRoad = (ruasId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage");
      return;
    }

    fetch(`https://gisapis.manpits.xyz/api/ruasjalan/${ruasId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete Road");
        }
        setRuasJalan(ruasJalan.filter((ruas) => ruas.id !== ruasId));
        console.log("Road successfully deleted.");
      })
      .catch((err) => {
        console.error(err);
        console.error("Failed to delete Road.");
      });
  };

  const handleDeleteClick = (ruasId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Road?"
    );
    if (confirmDelete) {
      deleteRoad(ruasId);
    }
  };

  const handleEditRoadClick = (road) => {
    setSelectedRoad(road);
    navigate(`/edit-road/${road.id}`);
  };

  const getJenisJalan = (id) => jenisJalanOptions[id] || "Unknown";
  const getEksisting = (id) => eksistingOptions[id] || "Unknown";
  const getKondisi = (id) => kondisiOptions[id] || "Unknown";

  // Calculate statistics for pie chart
  const calculateStatistics = () => {
    let kondisiCount = {};
    let eksistingCount = {};
    let jenisJalanCount = {};

    ruasJalan.forEach((ruas) => {
      // Count kondisi
      if (ruas.kondisi_id in kondisiCount) {
        kondisiCount[ruas.kondisi_id]++;
      } else {
        kondisiCount[ruas.kondisi_id] = 1;
      }

      // Count eksisting
      if (ruas.eksisting_id in eksistingCount) {
        eksistingCount[ruas.eksisting_id]++;
      } else {
        eksistingCount[ruas.eksisting_id] = 1;
      }

      // Count jenis jalan
      if (ruas.jenisjalan_id in jenisJalanCount) {
        jenisJalanCount[ruas.jenisjalan_id]++;
      } else {
        jenisJalanCount[ruas.jenisjalan_id] = 1;
      }
    });

    // Prepare data for pie chart
    const kondisiData = Object.keys(kondisiCount).map((id) => ({
      label: getKondisi(id),
      value: kondisiCount[id],
    }));

    const eksistingData = Object.keys(eksistingCount).map((id) => ({
      label: getEksisting(id),
      value: eksistingCount[id],
    }));

    const jenisJalanData = Object.keys(jenisJalanCount).map((id) => ({
      label: getJenisJalan(id),
      value: jenisJalanCount[id],
    }));

    return { kondisiData, eksistingData, jenisJalanData };
  };

  const { kondisiData, eksistingData, jenisJalanData } = calculateStatistics();

  const filteredRuasJalan = ruasJalan.filter((ruas) =>
    ruas.nama_ruas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // filter

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRuasJalan.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredRuasJalan.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4 pt-20 py-4">
        <div className="h-auto max-w-full rounded-lg">
          <h2 className="flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
            Road Condition
          </h2>
          <PieChartComponent
            id={`pie-chart-kondisi-1`}
            series={kondisiData.map((data) => data.value)}
            labels={kondisiData.map((data) => data.label)}
            colors={["#1C64F2", "#16BDCA", "#9061F9", "#FF6384", "#36A2EB"]}
          />
        </div>
        <div className="h-auto max-w-full rounded-lg">
          <h2 className="flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
            Road Material
          </h2>
          <PieChartComponent
            id={`pie-chart-eksisting-1`}
            series={eksistingData.map((data) => data.value)}
            labels={eksistingData.map((data) => data.label)}
            colors={["#1C64F2", "#16BDCA", "#9061F9", "#FF6384", "#36A2EB"]}
          />
        </div>
        <div className="h-auto max-w-full rounded-lg">
          <h2 className="flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
            Road Type
          </h2>
          <PieChartComponent
            id={`pie-chart-jenisjalan-1`}
            series={jenisJalanData.map((data) => data.value)}
            labels={jenisJalanData.map((data) => data.label)}
            colors={["#1C64F2", "#16BDCA", "#9061F9", "#FF6384", "#36A2EB"]}
          />
        </div>
      </div>

      <div className="container mx-auto ">
        <div className="flex justify-end mx-auto">
          <form className="flex items-center w-full max-w-xs">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
            </label>
            <div className="relative w-full max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="default-search"
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search by Road Name"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full mt-4">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2">Road Name</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Length (KM)</th>
                <th className="px-4 py-2">Wide (M)</th>
                <th className="px-4 py-2">Road Type</th>
                <th className="px-4 py-2">Material</th>
                <th className="px-4 py-2">Condition</th>
                <th className="px-4 py-2">Information</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ruas, index) => (
                <tr
                  className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700"
                  key={ruas.id}
                >
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {(currentPage - 1) * itemsPerPage + index++ + 1}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {ruas.nama_ruas}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {desaDetails[ruas.desa_id] &&
                      `${desaDetails[ruas.desa_id].desa}, `}
                    {kecamatanDetails[ruas.desa_id] &&
                      `${kecamatanDetails[ruas.desa_id].kecamatan}, `}
                    {kabupatenDetails[ruas.desa_id] &&
                      `${kabupatenDetails[ruas.desa_id].kabupaten}`}
                  </td>
                  <td className="px-4 py-2 text-sm text-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {ruas.panjang}
                  </td>
                  <td className="px-4 py-2 text-sm text-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {ruas.lebar}
                  </td>
                  <td className="px-4 py-2 text-sm text-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {getJenisJalan(ruas.jenisjalan_id)}
                  </td>
                  <td className="px-4 py-2 text-sm text-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {getEksisting(ruas.eksisting_id)}
                  </td>
                  <td className="px-4 py-2 text-sm text-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {getKondisi(ruas.kondisi_id)}
                  </td>
                  <td className="px-4 py-2 text-sm text-center font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {ruas.keterangan}
                  </td>

                  <td className="px-4 py-2 text-sm text-center font-medium text-gray-900 whitespace-nowrap dark:text-white ">
                    <button
                      type="button"
                      className="text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900"
                      onClick={() => handleEditRoadClick(ruas)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                      onClick={() => handleDeleteClick(ruas.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Previous
            </button>
            <span className="flex justify-center items-center text-sm font-medium text-gray-700 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Next
            </button>
          </div>
          <div className="flex items-center justify-center">
            <Link to="/">
              <button
                type="button"
                className="text-white mb-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Go to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
