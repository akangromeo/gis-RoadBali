import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import { decode } from "polyline";
import "leaflet/dist/leaflet.css";
import { Link, useNavigate } from "react-router-dom";
import EditRoadComponent from "../component/EditRoadComponent";
import ReactModal from "react-modal";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function Homepage() {
  const [ruasJalan, setRuasJalan] = useState([]);
  const [showEditRoadForm, setShowEditRoadForm] = useState(false);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [eksistingOptions, setEksistingOptions] = useState([]);
  const [kondisiOptions, setKondisiOptions] = useState([]);
  const [jenisJalanOptions, setJenisJalanOptions] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const mapRef = useRef(null);

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

  const decodePolyline = (encoded) => {
    return decode(encoded, 5).map(([lat, lng]) => [lat, lng]);
  };

  const navigate = useNavigate();

  const fetchRuasJalan = (token) => {
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
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://gisapis.manpits.xyz/api/meksisting", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Eksisting Options Data:", data); // Log data for debugging
        if (Array.isArray(data.eksisting)) {
          setEksistingOptions(
            data.eksisting.map((eksistingItem) => ({
              value: eksistingItem.id,
              label: eksistingItem.eksisting,
            }))
          );
        } else {
          console.error("Invalid data format for eksisting options");
        }
      })
      .catch((error) =>
        console.error("Error fetching eksisting options:", error)
      );

    fetch("https://gisapis.manpits.xyz/api/mkondisi", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Kondisi Options Data:", data); // Log data for debugging
        if (
          data &&
          data.status === "success" &&
          Array.isArray(data.eksisting)
        ) {
          setKondisiOptions(
            data.eksisting.map((kondisiItem) => ({
              value: kondisiItem.id,
              label: kondisiItem.kondisi,
            }))
          );
        } else {
          console.error(
            "Invalid data format for kondisi options or error fetching kondisi options"
          );
        }
      })
      .catch((error) =>
        console.error("Error fetching kondisi options:", error)
      );

    fetch("https://gisapis.manpits.xyz/api/mjenisjalan", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Jenis Jalan Options Data:", data); // Log data for debugging
        if (
          data &&
          data.status === "success" &&
          Array.isArray(data.eksisting)
        ) {
          setJenisJalanOptions(
            data.eksisting.map((jenisJalanItem) => ({
              value: jenisJalanItem.id,
              label: jenisJalanItem.jenisjalan,
            }))
          );
        } else {
          console.error(
            "Invalid data format for jenis jalan options or error fetching jenis jalan options"
          );
        }
      })
      .catch((error) =>
        console.error("Error fetching jenis jalan options:", error)
      );
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchRuasJalan(storedToken);
    }
  }, []);

  const handleEditRoadClick = (road) => {
    setSelectedRoad(road);
    navigate(`/edit-road/${road.id}`);
  };

  const handleEditRoadClose = () => {
    setShowEditRoadForm(false);
  };

  const handleEditRoadSubmit = (updatedData) => {
    const updatedIndex = ruasJalan.findIndex(
      (item) => item.id === updatedData.id
    );
    if (updatedIndex !== -1) {
      const newRuasJalan = [...ruasJalan];
      newRuasJalan[updatedIndex] = updatedData;
      setRuasJalan(newRuasJalan);
    }
  };

  const handleDeleteClick = (ruasId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Road?"
    );
    if (confirmDelete) {
      deleteRoad(ruasId);
    }
  };

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

  const tailwindColors = {
    "red-500": "#ef4444",
    "green-700": "#046C4E",
    "blue-500": "#3b82f6",
    black: "#000000",
  };

  const getRoadColor = (jenisJalanId) => {
    switch (jenisJalanId) {
      case 1:
        return tailwindColors["red-500"];
      case 2:
        return tailwindColors["green-700"];
      case 3:
        return tailwindColors["blue-500"];
      default:
        return tailwindColors["black"];
    }
  };

  const getEksistingLabel = (id) => {
    const option = eksistingOptions.find((opt) => opt.value === id);
    return option ? option.label : "Unknown";
  };

  const getKondisiLabel = (id) => {
    const option = kondisiOptions.find((opt) => opt.value === id);
    return option ? option.label : "Unknown";
  };

  const getJenisJalanLabel = (id) => {
    const option = jenisJalanOptions.find((opt) => opt.value === id);
    return option ? option.label : "Unknown";
  };

  return (
    <div className="pt-[73px] h-screen">
      <div className="h-full">
        <MapContainer
          className="map-container"
          center={[-8.4342, 115.1130646]}
          zoom={10.2}
          style={{ height: "100%" }}
          whenReady={(mapInstance) => {
            console.log("Map instance ready:", mapInstance);
            mapRef.current = mapInstance.target;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {ruasJalan.map((ruas) => {
            const path = decodePolyline(ruas.paths);
            const roadColor = getRoadColor(ruas.jenisjalan_id);
            const desa = desaDetails[ruas.desa_id]?.desa || "Loading...";
            const kecamatan =
              kecamatanDetails[ruas.desa_id]?.kecamatan || "Loading...";
            const kabupaten =
              kabupatenDetails[ruas.desa_id]?.kabupaten || "Loading...";
            return (
              <Polyline key={ruas.id} positions={path} color={roadColor}>
                <div className="popup mt-[200px]">
                  <Popup>
                    <div className="popup-container w-full ">
                      <div className="popup-content">
                        <h5 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                          {ruas.nama_ruas}
                        </h5>
                        <div className="flex flex-col space-y-2 my-4">
                          <div className="flex items-center">
                            <strong className="w-24">Village</strong>
                            <span>: {desa}</span>
                          </div>
                          <div className="flex items-center">
                            <strong className="w-24">Subdistrict</strong>
                            <span>: {kecamatan}</span>
                          </div>
                          <div className="flex items-center">
                            <strong className="w-24">District</strong>
                            <span>: {kabupaten}</span>
                          </div>
                          <div className="flex items-center">
                            <strong className="w-24">Length</strong>
                            <span>: {ruas.panjang} Km</span>
                          </div>
                          <div className="flex items-center">
                            <strong className="w-24">Wide</strong>
                            <span>: {ruas.lebar} M</span>
                          </div>
                          <div className="flex items-center">
                            <strong className="w-24">Material</strong>
                            <span>
                              : {getEksistingLabel(ruas.eksisting_id)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <strong className="w-24">Condition</strong>
                            <span>: {getKondisiLabel(ruas.kondisi_id)}</span>
                          </div>
                          <div className="flex items-center">
                            <strong className="w-24">Road Type</strong>
                            <span>
                              : {getJenisJalanLabel(ruas.jenisjalan_id)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <strong className="w-24">Information</strong>
                            <span>: {ruas.keterangan}</span>
                          </div>
                        </div>

                        <div className="flex justify-center items-center w-full">
                          <button
                            type="button"
                            className="flex w-full justify-center text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900"
                            onClick={() => handleEditRoadClick(ruas)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="flex w-full justify-center text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                            onClick={() => handleDeleteClick(ruas.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </div>
              </Polyline>
            );
          })}
        </MapContainer>
        <ReactModal
          className={"mx-6/12 my-1/2 self-center"}
          isOpen={showEditRoadForm}
          onRequestClose={handleEditRoadClose}
          style={{ overlay: { zIndex: 20, padding: 100 } }}
          ariaHideApp={false}
        >
          {selectedRoad && (
            <EditRoadComponent
              data={selectedRoad}
              onSubmit={handleEditRoadSubmit}
              onClose={handleEditRoadClose}
            />
          )}
        </ReactModal>
        <Link to="/add-road">
          <button
            type="button"
            className="button-over-map text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Add New Road
          </button>
        </Link>
        <Link to="/road-data">
          <button
            type="button"
            className="button-over-map-left text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Road Data
          </button>
        </Link>
        <div className="information-box bg-white p-4 rounded-lg shadow-lg">
          <h4 className="font-semibold mb-2">Legend:</h4>
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-blue-500 inline-block mr-2"></span>
              <span>Jalan Provinsi</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-700 inline-block mr-2"></span>
              <span>Jalan Kabupaten</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-red-500 inline-block mr-2"></span>
              <span>Jalan Desa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
