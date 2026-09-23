import { guardarSesion } from "../services/auth";
import { BACKEND_URL } from "../services/config";

export function renderPantallaLogin(
  contenedor: HTMLElement,
  alLoguear: () => void,
  alQuererRegistrarse: () => void
): void {
  contenedor.innerHTML = `
    <div class="min-h-screen bg-superficie flex flex-col items-center justify-center p-4">
      <div class="bg-tarjeta border border-gray-700 rounded-lg p-8 w-full max-w-sm">
        <img src="/logo.png" alt="Punto Cero" class="w-28 h-28 mx-auto mb-6" />

        <div id="error-login" class="hidden bg-red-500/20 text-red-400 text-sm rounded p-2 mb-4"></div>

        <label class="block text-xs font-semibold text-gray-400 tracking-wide mb-1">USUARIO</label>
        <input id="input-usuario" type="text" class="bg-superficie border border-gray-700 text-white rounded px-3 py-2 w-full mb-4" />

        <label class="block text-xs font-semibold text-gray-400 tracking-wide mb-1">CONTRASEÑA</label>
    <div class="relative mb-6">
        <input id="input-password" type="password" class="bg-superficie border border-gray-700 text-white rounded px-3 py-2 w-full pr-10" />
        <button id="btn-ver-password" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
    <svg id="icono-ojo" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
        </button>
    </div>

        <button id="btn-login" class="bg-libre text-white font-semibold w-full py-2 rounded-lg hover:opacity-90 transition">
          Iniciar sesión
        </button>

        <div class="border-t border-gray-700 mt-6 pt-4 text-center">
          <span class="text-gray-400 text-sm">¿No tienes cuenta? </span>
        <button id="btn-ir-registro" class="text-libre text-sm font-semibold 
        hover:underline">Regístrate</button>
    </div>
      </div>
        <p class="text-gray-600 text-xs mt-4">Punto Cero Resto-Bar Management • v1.0</p>
    </div>
  `;

  const inputUsuario = contenedor.querySelector("#input-usuario") as HTMLInputElement;
  const inputPassword = contenedor.querySelector("#input-password") as HTMLInputElement;
  const btnLogin = contenedor.querySelector("#btn-login") as HTMLButtonElement;
  const btnIrRegistro = contenedor.querySelector("#btn-ir-registro") as HTMLButtonElement;
  const errorDiv = contenedor.querySelector("#error-login") as HTMLElement;
  const btnVerPassword = contenedor.querySelector("#btn-ver-password") as HTMLButtonElement;

  btnVerPassword.addEventListener("click", () => {
    const oculto = inputPassword.type === "password";
    inputPassword.type = oculto ? "text" : "password";
    const icono = contenedor.querySelector("#icono-ojo") as SVGElement;
    icono.innerHTML = oculto
    ? `<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 4.22-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
    : `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle>`;
  });

  btnIrRegistro.addEventListener("click", alQuererRegistrarse);
  btnLogin.addEventListener("click", async () => {
    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value;

    if (!usuario || !password) {
      mostrarError("Completa usuario y contraseña.");
      return;
    }

    try {
      const respuesta = await fetch(`${BACKEND_URL}/api/empleados/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        mostrarError(data.error || "No se pudo iniciar sesión.");
        return;
      }

      guardarSesion(data.token, data.empleado);
      alLoguear();
    } catch (error) {
      mostrarError("Error de conexión con el servidor.");
    }
  });

  function mostrarError(mensaje: string) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove("hidden");
  }
}