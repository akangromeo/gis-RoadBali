import { useEffect } from "react";
import "./App.css";
import NavbarComponent from "./component/NavbarComponent";
import "leaflet/dist/leaflet.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Modal from "react-modal";
import AddRoad from "./pages/AddRoad";
import "leaflet-draw/dist/leaflet.draw.css";
import EditRoad from "./pages/EditRoad";
import DataRoad from "./pages/DataRoad";

function App() {
  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  return (
    <>
      <Router>
        <div>
          <NavbarComponent />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/add-road" element={<AddRoad />} />
            <Route path="/edit-road/:roadId" element={<EditRoad />} />
            <Route path="/road-data" element={<DataRoad />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
