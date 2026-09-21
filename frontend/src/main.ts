import "./style.css";
import { renderPantallaSalon } from "./pages/salon";
import { renderPantallaLogin } from "./pages/login";
import { renderPantallaRegistro } from "./pages/registro";
import { haySesionActiva } from "./services/auth";

const app = document.getElementById("app");

function mostrarSalon() {
  if (app) renderPantallaSalon(app);
}

function mostrarLogin() {
  if(app) renderPantallaLogin(app, mostrarSalon, mostrarRegistro);
}

function mostrarRegistro() {
  if(app) renderPantallaRegistro(app, mostrarLogin, mostrarLogin);
}

if(app) {
  if(haySesionActiva()) {
    mostrarSalon();
  }else {
    mostrarLogin();
  }
}

