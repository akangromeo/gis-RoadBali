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

  const navigate = useNavigate();

  const [desaDetails, setDesaDetails] = useState({});
  const [kecamatanDetails, setKecamatanDetails] = useState({});
  const [kabupatenDetails, setKabupatenDetails] = useState({});

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
        console.log("Location Details:", data); // Log data for debugging
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

          // Fetch location details for each ruas jalan
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ruasJalan.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(ruasJalan.length / itemsPerPage);

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

  return (
    <>
      <div className="grid grid-cols-3 gap-4 pt-20">
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
        <div className="overflow-x-auto">
          <table className="table-auto w-full mt-4">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                <th className="px-4 py-2">Road Name</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Length (KM)</th>
                <th className="px-4 py-2">Wide (M)</th>
                <th className="px-4 py-2">Road Tyoe</th>
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
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
