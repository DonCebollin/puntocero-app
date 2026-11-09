# puntocero-app

Aplicación móvil (APK) para la gestión de ventas, mesas y pedidos del restobar Punto Cero.

## Stack tecnológico

- **App móvil:** Capacitor + TypeScript + Tailwind CSS, compilada a APK para Android
- **Backend:** Node + Express + TypeScript
- **Comunicación en tiempo real:** Socket.io
- **Base de datos:** MySQL
- **Autenticación:** JWT, con roles (garzón, cocina, barra, administrador)
- **Pruebas:** Vitest y Supertest (unitarias e integración), Cypress (E2E)

## Estrategia de ramas

Github Flow: `main` siempre estable + una rama corta por funcionalidad, integradas vía Pull Request.

## Funcionalidades comprometidas

- Gestión de mesas (`feature/gestion-mesas`)
- Toma de pedidos (`feature/toma-pedidos`)
- Diferenciación de pedidos cocina/barra (`feature/diferenciacion-cocina-barra`)
- Sincronización en tiempo real (`feature/sincronizacion-tiempo-real`)

## Funcionalidades de alcance completo

- Cierre de cuentas y métodos de pago (`feature/cierre-cuenta`)
- Reporte de ventas (`feature/reportes`)

## Estado actual

### Implementado

- Plano de salón con mesas agrupadas por zona (Terraza, Interior, Salón Trasero). Cada zona tiene su color y el estado de la mesa (libre, ocupada, por cobrar) se indica con un aro y una etiqueta.
- Inicio de sesión y registro, con pantallas según el rol: el garzón ve el salón y los pedidos; cocina y barra ven su cola de pendientes.
- Toma de pedidos por mesa, con productos separados por estación (cocina y barra).
- Cola de cocina y barra: cada producto se marca como listo, con indicador de tiempo de espera.
- Cierre de cuenta con cálculo del total. No se permite cerrar la cuenta mientras haya productos sin entregar.
- Notificaciones en tiempo real:
  - Cocina y barra reciben sonido, vibración y un aviso en pantalla cuando llega un pedido nuevo.
  - El garzón recibe un aviso cuando un producto de su pedido queda listo.
- Sincronización en tiempo real entre dispositivos mediante Socket.io.
- Tema claro/oscuro y Modo fácil.

### Eventos de Socket.io

| Evento | Cuándo se emite | Datos principales |
|---|---|---|
| `mesa:actualizada` | Cambia el estado de una mesa | La mesa actualizada |
| `pedido:nuevo:cocina` | Se envía un pedido con productos de cocina | `pedidoId`, `mesaId`, `mesaNumero`, `items` |
| `pedido:nuevo:barra` | Se envía un pedido con productos de barra | `pedidoId`, `mesaId`, `mesaNumero`, `items` |
| `item:listo` | Cocina o barra marca un producto como listo | `itemId`, `mesaNumero`, `producto`, `cantidad`, `garzonId` |

### Pendiente

- Registro del método de pago al cerrar la cuenta (efectivo, débito, crédito o transferencia).
- Reporte de ventas.
- Integración con el terminal de cobro, sujeta a la habilitación del proveedor.
- Notificaciones push con la app cerrada (hoy los avisos solo funcionan con la app abierta).

## Pruebas

- **Backend** (unitarias e integración): dentro de `backend`, `npm test`.
- **E2E con Cypress:** dentro de `frontend`, `npx cypress run`. Las pruebas están en `frontend/cypress/e2e` (`pedido-cocina.cy.ts` y `pedido-total.cy.ts`).

Los tests de integración usan una base de datos local. Nunca se ejecutan contra la base de producción.

## Configuración

Las variables de entorno van en un archivo `.env`, que no se sube al repositorio.

