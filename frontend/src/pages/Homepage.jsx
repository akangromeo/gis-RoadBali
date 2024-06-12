import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import { decode } from "polyline";
import "leaflet/dist/leaflet.css";
import { Link, useNavigate } from "react-router-dom";
import EditRoadComponent from "../component/EditRoadComponent";
import ReactModal from "react-modal";

export default function Homepage() {
  const [ruasJalan, setRuasJalan] = useState([]);
  const [showEditRoadForm, setShowEditRoadForm] = useState(false);
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const mapRef = useRef(null);

  const decodePolyline = (encoded) => {
    return decode(encoded, 5).map(([lat, lng]) => [lat, lng]);
  };

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

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

  return (
    <div>
      <div style={{ height: "400px" }}>
        <MapContainer
          className="map-container"
          center={[-8.4342, 115.1130646]}
          zoom={10.2}
          style={{ height: "100vh" }}
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
            return (
              <Polyline key={ruas.id} positions={path} color="red">
                <Popup>
                  <div className="popup-container w-full">
                    <div className="popup-content">
                      <h5 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                        {ruas.nama_ruas}
                      </h5>
                      <p>Panjang Jalan : {ruas.panjang} km</p>
                      <p>Lebar Jalan : {ruas.lebar} </p>
                      <p>Eksisting ID : {ruas.eksisting_id}</p>
                      <p>Kondisi ID : {ruas.kondisi_id}</p>
                      <p>Jenis Jalan ID : {ruas.jenisjalan_id}</p>
                      <p>Keterangan : {ruas.keterangan}</p>

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
                    </div>
                  </div>
                </Popup>
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
            className=" button-over-map text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Add New Road
          </button>
        </Link>
        <Link to="/road-data">
          <button
            type="button"
            className=" button-over-map-left text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Road Data
          </button>
        </Link>
      </div>
    </div>
  );
}
