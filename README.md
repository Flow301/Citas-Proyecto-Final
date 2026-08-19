# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




## Generar datos de prueba

Antes de generar datos:

1. Iniciar MySQL.
2. Iniciar la API en `http://localhost:3000`.
3. Configurar el archivo `.env` del frontend.
4. Instalar las dependencias:

```bash
npm install


npm run seed -- usuarios
npm run seed -- servicios
npm run seed -- adicionales
npm run seed -- empleados
npm run seed -- horarios
npm run seed -- restricciones
npm run seed -- citas


npm run seed -- todos


Crear un archivo `.env` en la raíz del frontend:
```env
VITE_API_URL=http://localhost:3000