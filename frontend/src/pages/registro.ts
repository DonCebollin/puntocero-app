import { BACKEND_URL } from "../services/config";

export function renderPantallaRegistro(contenedor: HTMLElement, alRegistrar: () => void): void {
  contenedor.innerHTML = `
    <div class="min-h-screen bg-superficie flex items-center justify-center p-4">
      <div class="bg-tarjeta rounded-lg p-6 w-full max-w-sm">
        <h1 class="text-2xl font-bold text-white mb-6 text-center">Crear cuenta</h1>

        <div id="error-registro" class="hidden bg-red-500/20 text-red-400 text-sm rounded p-2 mb-4"></div>

        <label class="block text-xs text-gray-400 mb-1">Nombre completo</label>
        <input id="input-nombre" type="text" class="bg-superficie text-white rounded px-3 py-2 w-full mb-3" />

        <label class="block text-xs text-gray-400 mb-1">Usuario</label>
        <input id="input-usuario" type="text" class="bg-superficie text-white rounded px-3 py-2 w-full mb-3" />

        <label class="block text-xs text-gray-400 mb-1">Contraseña</label>
        <input id="input-password" type="password" class="bg-superficie text-white rounded px-3 py-2 w-full mb-3" />

        <label class="block text-xs text-gray-400 mb-1">Rol</label>
        <select id="select-rol" class="bg-superficie text-white rounded px-3 py-2 w-full mb-6">
          <option value="garzon">Garzón</option>
          <option value="cocina">Cocina</option>
          <option value="barra">Barra</option>
        </select>

        <button id="btn-registrar" class="bg-libre text-white font-semibold w-full py-2 rounded-lg hover:opacity-90 transition mb-3">
          Registrarme
        </button>

        <button id="btn-ir-login" class="text-gray-400 text-sm w-full text-center hover:text-white transition">
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </div>
  `;

  const inputNombre = contenedor.querySelector("#input-nombre") as HTMLInputElement;
  const inputUsuario = contenedor.querySelector("#input-usuario") as HTMLInputElement;
  const inputPassword = contenedor.querySelector("#input-password") as HTMLInputElement;
  const selectRol = contenedor.querySelector("#select-rol") as HTMLSelectElement;
  const btnRegistrar = contenedor.querySelector("#btn-registrar") as HTMLButtonElement;
  const errorDiv = contenedor.querySelector("#error-registro") as HTMLElement;

  btnRegistrar.addEventListener("click", async () => {
    const nombre = inputNombre.value.trim();
    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value.trim();
    const rol = selectRol.value;

    if (!nombre || !usuario || !password) {
      mostrarError("Completa todos los campos.");
      return;
    }

    try {
      const respuesta = await fetch(`${BACKEND_URL}/api/empleados/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, usuario, password, rol }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        mostrarError(data.error?.[0]?.message || data.error || "No se pudo registrar.");
        return;
      }

      alRegistrar();
    } catch (error) {
      mostrarError("Error de conexión con el servidor.");
    }
  });

  function mostrarError(mensaje: string) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove("hidden");
  }
}