import { Outlet, NavLink, Link } from "react-router-dom";

export default function OperadorLayout() {
  return (
    <div className="pagina operador">
      <header className="header operador-header">
        <Link to="/" className="logo">ACME Salud</Link>
        <p className="tagline">Call Center – Agenda interoperable</p>
        <nav className="operador-tabs">
          <NavLink to="/operador/disponibilidad" end className={({ isActive }) => (isActive ? "tab active" : "tab")}>
            Disponibilidad
          </NavLink>
          <NavLink to="/operador/agendar" end={false} className={({ isActive }) => (isActive ? "tab active" : "tab")}>
            Registrar cita
          </NavLink>
          <NavLink to="/operador/cancelar" end={false} className={({ isActive }) => (isActive ? "tab active" : "tab")}>
            Cancelar cita
          </NavLink>
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
