import React from "react";
import { useMap, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { encode } from "polyline";
import L from "leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
import ReactDOMServer from "react-dom/server";

const pinpointIconHtml = ReactDOMServer.renderToString(
  <FaMapMarkerAlt style={{ color: "red", fontSize: "16px" }} />
);

const pinpointIcon = new L.DivIcon({
  html: pinpointIconHtml,
  iconSize: [16, 16], // Ukuran ikon
  className: "leaflet-pinpoint-icon", // Kelas CSS khusus jika diperlukan
});

const DrawTools = ({ setPolyline, setModalIsOpen, setLengthRoad }) => {
  const map = useMap();

  const updatePolyline = (layer) => {
    const latLngs = layer.getLatLngs();
    console.log("LatLngs from layer:", latLngs);

    if (latLngs && latLngs.length > 0) {
      const flatLatLngs = latLngs
        .flat(Infinity)
        .filter(
          (latlng) => latlng.lat !== undefined && latlng.lng !== undefined
        );
      console.log("Flattened LatLngs:", flatLatLngs);

      flatLatLngs.forEach((latlng, index) => {
        console.log(
          `Coordinate ${index}: lat=${latlng.lat}, lng=${latlng.lng}`
        );
      });

      const encodedPolyline = encode(
        flatLatLngs.map((latlng) => [latlng.lat, latlng.lng])
      );
      const lengthRoad = calculateLength(flatLatLngs).toFixed(2);
      setLengthRoad(lengthRoad);
      console.log("Length of road:", lengthRoad);
      setPolyline(encodedPolyline);

      console.log("Encoded Polyline:", encodedPolyline);

      setModalIsOpen(true);
    } else {
      console.error("No valid LatLngs found in the layer");
    }
  };

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

  const _onCreated = (e) => {
    const { layerType, layer } = e;
    if (layerType === "polyline") {
      console.log("Polyline created:", layer);
      updatePolyline(layer);
    }
  };

  const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
  };

  const calculateLength = (latLngs) => {
    let length = 0;
    for (let i = 0; i < latLngs.length - 1; i++) {
      const latlng1 = latLngs[i];
      const latlng2 = latLngs[i + 1];

      console.log(`latlng1: lat=${latlng1.lat}, lng=${latlng1.lng}`);
      console.log(`latlng2: lat=${latlng2.lat}, lng=${latlng2.lng}`);

      const segmentLength = haversineDistance(latlng1, latlng2);
      console.log(`Segment ${i}: length=${segmentLength}`);
      length += segmentLength;
    }
    return length; // Sudah dalam kilometer
  };

  const calculateDistance = (positions) => {
    let total = 0;
    for (let i = 0; i < positions.length - 1; i++) {
      const marker = L.latLng(positions[i]);
      const nextMarker = L.latLng(positions[i + 1]);
      total += marker.distanceTo(nextMarker);
    }
    return total;
  };

  const _onDeleted = (e) => {
    let numDeleted = 0;
    e.layers.eachLayer(() => {
      numDeleted += 1;
    });
    console.log(`_onDeleted: removed ${numDeleted} layers`, e);
  };

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
            icon: pinpointIcon,
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
