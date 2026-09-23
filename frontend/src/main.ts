import "./style.css";
import { renderPantallaSalon } from "./pages/salon";
import { renderPantallaLogin } from "./pages/login";
import { renderPantallaRegistro } from "./pages/registro";
import { renderPantallaCola } from "./pages/cola";
import { haySesionActiva, obtenerEmpleadoActual } from "./services/auth";

const app = document.getElementById("app");

function mostrarPantallaPrincipal() {
  const empleado = obtenerEmpleadoActual();
  if (!app) return;

  if (empleado?.rol === "cocina" || empleado?.rol === "barra") {
    renderPantallaCola(app, empleado.rol);
  } else {
    renderPantallaSalon(app);
  }
}

function mostrarSalon() {
  if (app) renderPantallaSalon(app);
}

function mostrarLogin() {
  if(app) renderPantallaLogin(app, mostrarPantallaPrincipal, mostrarRegistro);
}

function mostrarRegistro() {
  if(app) renderPantallaRegistro(app, mostrarLogin, mostrarLogin);
}

if(app) {
  if(haySesionActiva()) {
    mostrarPantallaPrincipal();
  }else {
    mostrarLogin();
  }
}

