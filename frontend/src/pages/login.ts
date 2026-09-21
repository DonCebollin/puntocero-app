import { guardarSesion } from "../services/auth";
import { BACKEND_URL } from "../services/config";

export function renderPantallaLogin(
  contenedor: HTMLElement,
  alLoguear: () => void,
  alQuererRegistrarse: () => void
): void {
  contenedor.innerHTML = `
    <div class="min-h-screen bg-superficie flex items-center justify-center p-4">
      <div class="bg-tarjeta rounded-lg p-6 w-full max-w-sm">
         <img src="/logo.png" alt="Punto Cero" class="w-24 h-24 mx-auto mb-4" />

        <div id="error-login" class="hidden bg-red-500/20 text-red-400 text-sm rounded p-2 mb-4"></div>

        <label class="block text-xs text-gray-400 mb-1">Usuario</label>
        <input id="input-usuario" type="text" class="bg-superficie text-white rounded px-3 py-2 w-full mb-4" />

        <label class="block text-xs text-gray-400 mb-1">Contraseña</label>
        <input id="input-password" type="password" class="bg-superficie text-white rounded px-3 py-2 w-full mb-6" />

        <button id="btn-login" class="bg-libre text-white font-semibold w-full py-2 rounded-lg hover:opacity-90 transition mb-3">
          Iniciar sesión
        </button>

        <button id="btn-ir-registro" class="text-gray-400 text-sm w-full text-center hover:text-white transition">
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </div>
  `;

  const inputUsuario = contenedor.querySelector("#input-usuario") as HTMLInputElement;
  const inputPassword = contenedor.querySelector("#input-password") as HTMLInputElement;
  const btnLogin = contenedor.querySelector("#btn-login") as HTMLButtonElement;
  const btnIrRegistro = contenedor.querySelector("#btn-ir-registro") as HTMLButtonElement;
  const errorDiv = contenedor.querySelector("#error-login") as HTMLElement;

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