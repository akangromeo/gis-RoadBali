import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import DrawTools from "../component/DrawTools";
import ReactModal from "react-modal";
import RoadModalComponent from "../component/RoadModalComponent";
import { Link } from "react-router-dom";
import { decode } from "polyline";
import ReactDOMServer from "react-dom/server";

const AddRoad = () => {
  const [polyline, setPolyline] = useState("");
  const [modalData, setModalData] = useState({ paths: "" });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [lengthRoad, setLengthRoad] = useState("");
  const [ruasJalan, setRuasJalan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (polyline && lengthRoad) {
      setModalData({ paths: polyline, panjang: lengthRoad });
      setModalIsOpen(true);
    }
  }, [polyline]);

  useEffect(() => {
    const fetchRuasJalan = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://gisapis.manpits.xyz/api/ruasjalan",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch ruas jalan data");
        }
        const data = await response.json();
        setRuasJalan(data.ruasjalan);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ruas jalan data:", error);
        setLoading(false);
      }
    };

    fetchRuasJalan();
  }, []);

  const decodePolyline = (encoded) => {
    return decode(encoded, 5).map(([lat, lng]) => [lat, lng]);
  };

  const handleCloseModal = () => {
    setModalData({ paths: "" });
    setModalIsOpen(false);
  };

  return (
    <div>
      <div style={{ height: "400px" }}>
        <MapContainer
          className="map-container"
          center={[-8.4342, 115.1130646]}
          zoom={10.2}
          style={{ height: "100vh" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {ruasJalan.map((ruas) => {
            const path = decodePolyline(ruas.paths);
            return (
              <Polyline key={ruas.id} positions={path} color="red"></Polyline>
            );
          })}

          <DrawTools
            setPolyline={setPolyline}
            setLengthRoad={setLengthRoad}
            openModal={() => {}}
          />
        </MapContainer>
      </div>
      <ReactModal
        className={"mx-6/12 my-1/2 self-center"}
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        style={{ overlay: { zIndex: 20, padding: 100 } }}
        ariaHideApp={false}
      >
        <RoadModalComponent formData={modalData} onClose={handleCloseModal} />
      </ReactModal>

      <Link to="/">
        <button
          type="button"
          className=" button-over-map text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Go to Home
        </button>
      </Link>
    </div>
  );
};

export default AddRoad;
