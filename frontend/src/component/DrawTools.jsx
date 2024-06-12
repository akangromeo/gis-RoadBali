import React from "react";
import { useMap, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { encode } from "polyline";
import L from "leaflet";

const DrawTools = ({ setPolyline, setModalIsOpen, setLengthRoad }) => {
  const map = useMap();

  // Fungsi untuk memperbarui polyline
  const updatePolyline = (layer) => {
    const latLngs = layer.getLatLngs();
    if (Array.isArray(latLngs) && latLngs.length > 0) {
      const encodedPolyline = encode(
        latLngs.map((latlng) => [latlng.lat, latlng.lng])
      );
      const lengthRoad = calculateLength(latLngs).toFixed(2);
      setLengthRoad(lengthRoad);
      setPolyline(encodedPolyline);

      console.log("Encoded Polyline:", encodedPolyline);
      console.log("Length of road:", lengthRoad);

      setModalIsOpen(true);
    } else {
      console.error("No valid LatLngs found in the layer");
    }
  };

  // Event handler ketika layer diedit
  const _onEdited = (e) => {
    let numEdited = 0;
    e.layers.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        console.log("Polyline edited:", layer);
        updatePolyline(layer);
        numEdited += 1;
      }
    });
    console.log(`_onEdited: edited ${numEdited} layers`, e);
  };

  // Event handler ketika layer dibuat
  const _onCreated = (e) => {
    const { layerType: type, layer } = e;
    if (type === "polyline" && layer) {
      updatePolyline(layer);
    }
  };

  // Fungsi untuk menghitung panjang polyline
  const calculateLength = (latLngs) => {
    let length = 0;
    for (let i = 0; i < latLngs.length - 1; i++) {
      const latlng1 = latLngs[i];
      const latlng2 = latLngs[i + 1];
      length += latlng1.distanceTo(latlng2);
    }
    return length / 1000; // Konversi meter ke kilometer
  };

  // Event handler ketika layer dihapus
  const _onDeleted = (e) => {
    let numDeleted = 0;
    e.layers.eachLayer(() => {
      numDeleted += 1;
    });
    console.log(`_onDeleted: removed ${numDeleted} layers`, e);
  };

  // Event handler ketika mulai menggambar
  const _onDrawStart = (e) => {
    console.log("_onDrawStart", e);
  };

  return (
    <FeatureGroup>
      <EditControl
        position="topleft"
        onEdited={_onEdited}
        onCreated={_onCreated}
        onDeleted={_onDeleted}
        onDrawStart={_onDrawStart}
        draw={{
          polyline: {
            icon: new L.DivIcon({
              iconSize: new L.Point(8, 8),
              className: "leaflet-div-icon leaflet-editing-icon",
            }),
            shapeOptions: {
              guidelineDistance: 10,
              color: "blue",
              weight: 3,
            },
          },
          rectangle: false,
          circlemarker: false,
          circle: false,
          polygon: false,
          marker: false,
        }}
      />
    </FeatureGroup>
  );
};

export default DrawTools;
