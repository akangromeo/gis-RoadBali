import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function DataRoad() {
  const [ruasJalan, setRuasJalan] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [selectedRoad, setSelectedRoad] = useState(null);

  const navigate = useNavigate();

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
        })
        .catch((error) => console.error("Error fetching ruas jalan:", error));
    }
  }, [token]);

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
        })
        .catch((error) => console.error("Error fetching ruas jalan:", error));
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

  return (
    <div className="container mx-auto mt-auto">
      <h2 className="text-xl font-semibold mb-4">Data Road</h2>
      <div className="overflow-x-auto mt-10">
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Nama Ruas</th>
              <th className="px-4 py-2">Panjang</th>
              <th className="px-4 py-2">Lebar</th>
              <th className="px-4 py-2">Keterangan</th>
              <th className="px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ruasJalan.map((ruas) => (
              <tr key={ruas.id}>
                <td className="border px-4 py-2">{ruas.nama_ruas}</td>
                <td className="border px-4 py-2">{ruas.panjang} km</td>
                <td className="border px-4 py-2">{ruas.lebar}</td>
                <td className="border px-4 py-2">{ruas.keterangan}</td>
                <td className="border px-4 py-2">
                  <button
                    type="button"
                    className="text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900"
                    onClick={() => handleEditRoadClick(ruas)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                    onClick={() => handleDeleteClick(ruas.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
