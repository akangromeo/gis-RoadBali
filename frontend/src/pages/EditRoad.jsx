import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, FeatureGroup } from "react-leaflet";
import { useParams, useNavigate } from "react-router-dom";
import { EditControl } from "react-leaflet-draw";
import { decode, encode } from "polyline";
import EditRoadComponent from "../component/EditRoadComponent";

const EditRoad = () => {
  const { roadId } = useParams();
  const [polyline, setPolyline] = useState([]);
  const [lengthRoad, setLengthRoad] = useState("");
  const [roadData, setRoadData] = useState(null);
  const mapRef = useRef(null);
  const editableFG = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`https://gisapis.manpits.xyz/api/ruasjalan/${roadId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setRoadData(data.ruasjalan);
        if (data.ruasjalan.paths) {
          const decodedPath = decodePolyline(data.ruasjalan.paths);
          setPolyline(decodedPath);
          calculateLength(decodedPath);
        }
      })
      .catch((error) => console.error("Error fetching road data:", error));
  }, [roadId]);

  const handleFormSubmit = (updatedData) => {
    const token = localStorage.getItem("token");
    const updatedRoadData = {
      ...updatedData,

      paths: encode(polyline),
    };

    console.log(updatedRoadData);
    fetch(`https://gisapis.manpits.xyz/api/ruasjalan/${roadId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedRoadData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update road data");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Road data updated successfully:", data);
        navigate(`/`);
      })
      .catch((error) => {
        console.error("Error updating road data:", error);
      });
  };

  const decodePolyline = (encoded) => {
    return decode(encoded).map(([lat, lng]) => [lat, lng]);
  };

  const _onEdited = (e) => {
    e.layers.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        const editedLatLngs = layer
          .getLatLngs()
          .map((latLng) => [latLng.lat, latLng.lng]);

        // Update polyline state
        setPolyline(editedLatLngs);

        // Calculate road length for edited polyline
        const lengthNew = calculateLength(editedLatLngs);
        console.log(lengthNew);
        // Encode edited polyline
        const encodedPolyline = encode(editedLatLngs);
        console.log(encodedPolyline);

        // Update roadData with edited path and calculated length
        setRoadData((prevData) => ({
          ...prevData,
          panjang: lengthNew,
          paths: encodedPolyline,
        }));
      }
    });
  };

  const calculateLength = (latLngs) => {
    let length = 0;
    for (let i = 0; i < latLngs.length - 1; i++) {
      // Convert each coordinate to L.LatLng object
      const latlng1 = L.latLng(latLngs[i][0], latLngs[i][1]);
      const latlng2 = L.latLng(latLngs[i + 1][0], latLngs[i + 1][1]);
      length += latlng1.distanceTo(latlng2);
    }
    return (length / 1000).toFixed(2); // Return length in kilometers, formatted to 2 decimal places
  };

  if (!roadData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 h-full">
        <MapContainer
          center={[-8.4342, 115.1130646]}
          zoom={10.2}
          style={{ height: "100%" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FeatureGroup
            ref={(featureGroup) => {
              editableFG.current = featureGroup;
            }}
          >
            <Polyline positions={polyline} color="blue" />
            <EditControl
              position="topleft"
              onEdited={_onEdited}
              draw={{
                polyline: false,
                circle: false,
                rectangle: false,
                marker: false,
                circlemarker: false,
                polygon: false,
              }}
              edit={{
                remove: false,
                featureGroup: editableFG.current,
              }}
            />
          </FeatureGroup>
        </MapContainer>
      </div>
      <div className="w-1/2 h-full p-4 overflow-y-auto">
        <EditRoadComponent
          data={{
            nama_ruas: roadData.nama_ruas,
            panjang: roadData.panjang,
            lebar: roadData.lebar,
            eksisting_id: roadData.eksisting_id,
            kondisi_id: roadData.kondisi_id,
            jenisjalan_id: roadData.jenisjalan_id,
            keterangan: roadData.keterangan,
            paths: roadData.paths,
          }}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
};

export default EditRoad;
