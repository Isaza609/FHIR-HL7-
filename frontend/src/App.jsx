import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Servicios from "./pages/Servicios";
import Disponibilidad from "./pages/Disponibilidad";
import DatosPaciente from "./pages/DatosPaciente";
import Confirmacion from "./pages/Confirmacion";
import MisCitas from "./pages/MisCitas";
import CancelarCita from "./pages/CancelarCita";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/disponibilidad" element={<Disponibilidad />} />
        <Route path="/datos-paciente" element={<DatosPaciente />} />
        <Route path="/confirmacion" element={<Confirmacion />} />
        <Route path="/mis-citas" element={<MisCitas />} />
        <Route path="/cancelar-cita" element={<CancelarCita />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
