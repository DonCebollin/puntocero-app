import "./style.css";
import { renderPantallaSalon } from "./pages/salon";

const app = document.getElementById("app");

if (app) {
  renderPantallaSalon(app);
}