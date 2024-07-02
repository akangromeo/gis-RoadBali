import React, { useEffect } from "react";
import { useMapEvent, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { encode } from "polyline";

const DrawToolsEdit = ({
  polyline,
  setPolyline,
  setLengthRoad,
  setModalIsOpen,
}) => {
  // Gunakan useMap untuk mendapatkan referensi ke objek map
  const map = useMap();

  // Fungsi untuk menghitung panjang polyline
  const calculateLength = (latLngs) => {
    let length = 0;
    for (let i = 0; i < latLngs.length - 1; i++) {
      const latlng1 = latLngs[i];
      const latlng2 = latLngs[i + 1];
      length += map.distance(latlng1, latlng2); // Gunakan map.distance untuk menghitung jarak antara dua titik
    }
    return length / 1000; // Konversi meter ke kilometer
  };

  // Event handler ketika layer diedit
  const _onEdited = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const latLngs = layer.getLatLngs();
      if (latLngs.length > 0) {
        const encodedPolyline = encode(
          latLngs.map((latlng) => [latlng.lat, latlng.lng])
        );
        console.log("Encoded Polyline:", encodedPolyline);
        const lengthRoad = calculateLength(latLngs).toFixed(2);
        setLengthRoad(lengthRoad);
        setPolyline(encodedPolyline);
        setModalIsOpen(true);
      }
    });
  };

  // Event handler ketika layer dihapus
  const _onDeleted = () => {
    setPolyline(""); // Reset polyline jika layer dihapus
  };

  // Gunakan useMapEvent untuk menangani event draw:edited
  useMapEvent("draw:edited", (e) => {
    _onEdited(e);
  });

  return (
    <FeatureGroup>
      <EditControl
        position="topleft"
        onEdited={_onEdited}
        onDeleted={_onDeleted}
        draw={{
          polyline: false,
          rectangle: false,
          circlemarker: false,
          circle: false,
          polygon: false,
          marker: false,
        }}
        edit={{
          polyline: {
            shapeOptions: {
              color: "blue", // warna polyline saat diedit
            },
          },
        }}
      />
    </FeatureGroup>
  );
};

export default DrawToolsEdit;
