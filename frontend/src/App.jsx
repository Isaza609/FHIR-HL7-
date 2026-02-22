import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Servicios from "./pages/Servicios";
import Disponibilidad from "./pages/Disponibilidad";
import DatosPaciente from "./pages/DatosPaciente";
import Confirmacion from "./pages/Confirmacion";
import MisCitas from "./pages/MisCitas";
import CancelarCita from "./pages/CancelarCita";
import OperadorLayout from "./pages/operador/OperadorLayout";
import OperadorDisponibilidad from "./pages/operador/OperadorDisponibilidad";
import OperadorAgendar from "./pages/operador/OperadorAgendar";
import OperadorConfirmacion from "./pages/operador/OperadorConfirmacion";
import OperadorCancelar from "./pages/operador/OperadorCancelar";
import OperadorCancelarCita from "./pages/operador/OperadorCancelarCita";
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
        <Route path="/operador" element={<OperadorLayout />}>
          <Route index element={<Navigate to="disponibilidad" replace />} />
          <Route path="disponibilidad" element={<OperadorDisponibilidad />} />
          <Route path="agendar" element={<OperadorAgendar />} />
          <Route path="agendar/confirmacion" element={<OperadorConfirmacion />} />
          <Route path="cancelar" element={<OperadorCancelar />} />
          <Route path="cancelar-cita" element={<OperadorCancelarCita />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
