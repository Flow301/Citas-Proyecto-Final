# Centro de Tutorías Académicas

Aplicación web para administrar servicios de tutoría, empleados, horarios, restricciones de disponibilidad y citas. El frontend consume la API suministrada para el proyecto y presenta funcionalidades diferentes según el rol del usuario.

## Tecnologías

* React 19
* React Router
* Vite
* Tailwind CSS
* shadcn/ui
* Base UI
* Lucide React
* ESLint

## Funcionalidades

* Inicio y cierre de sesión.
* Registro público de clientes.
* Consulta del perfil autenticado.
* Gestión de servicios y sus imágenes.
* Gestión de servicios adicionales.
* Gestión de empleados y servicios asignados.
* Consulta de horarios de atención.
* Gestión de restricciones generales e individuales.
* Creación, edición, cancelación y cambio de estado de citas.
* Validación de disponibilidad.
* Cálculo automático de duración, hora final y costo.
* Agenda individual del empleado.
* Agenda diaria del establecimiento.
* Control de acceso según el rol.
* Carga diferida de páginas para optimizar el tamaño inicial.

## Roles

### Administrador

Puede administrar servicios, adicionales, empleados, horarios, restricciones y citas. También puede consultar la agenda diaria completa del establecimiento.

### Empleado

Puede consultar información general, revisar su agenda y administrar únicamente las citas que le han sido asignadas.

### Cliente

Puede consultar servicios, información general y sus propias citas. Solo puede cancelar una cita cuando su estado lo permita.

## Requisitos previos

Antes de iniciar el frontend se necesita:

* Node.js instalado.
* npm instalado.
* MySQL funcionando.
* API de citas instalada y ejecutándose.
* Base de datos y catálogos iniciales de la API configurados.

Repositorio de la API:

https://github.com/npaniagua26/api-citas

La API debe estar disponible en:

```text
http://localhost:3000
```

La documentación Swagger normalmente estará disponible en:

```text
http://localhost:3000/api-docs
```

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Flow301/Citas-Proyecto-Final.git
```

Entrar en la carpeta:

```bash
cd Citas-Proyecto-Final
```

Instalar las dependencias:

```bash
npm install
```

## Variables de entorno del frontend

Crear un archivo llamado `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000
```

El archivo `.env` está excluido de Git y debe crearse nuevamente después de clonar el repositorio.

Después de modificar `.env`, se debe reiniciar Vite.

## Variables de entorno del seed

Crear un archivo llamado `.env.seed` en la raíz del proyecto:

```env
SEED_API_URL=http://localhost:3000
SEED_ADMIN_EMAIL=admin@citas.com
SEED_ADMIN_PASSWORD=CONTRASENA_DEL_ADMINISTRADOR
SEED_USER_PASSWORD=CONTRASENA_PARA_USUARIOS_DE_PRUEBA
```

Descripción:

* `SEED_API_URL`: dirección de la API.
* `SEED_ADMIN_EMAIL`: correo del administrador inicial proporcionado por la API.
* `SEED_ADMIN_PASSWORD`: contraseña del administrador inicial.
* `SEED_USER_PASSWORD`: contraseña que tendrán los clientes y empleados creados por el seed.

No se debe subir `.env.seed` a GitHub porque contiene credenciales.

## Ejecutar el proyecto

Primero se deben iniciar MySQL y la API.

Después, desde la raíz del frontend:

```bash
npm run dev
```

Vite mostrará una dirección parecida a:

```text
http://localhost:5173
```

## Generar datos de prueba

El seed se ejecuta desde la raíz del frontend, no desde la carpeta de la API.

### Preparar las especialidades

La API solamente permite consultar las especialidades, por lo que estas deben cargarse directamente en MySQL antes de ejecutar el seed principal.

Abrir y ejecutar en MySQL Workbench el archivo:

```text
scripts/seed-specialties.sql

Antes de ejecutarlo:

1. Iniciar MySQL.
2. Iniciar la API.
3. Comprobar que la API responda en `http://localhost:3000`.
4. Configurar `.env.seed`.
5. Instalar las dependencias con `npm install`.

### Generar todos los datos

Para una base de datos vacía, ejecutar:

```bash
npm run seed -- todos
```

El script procesa las secciones en el orden necesario:

1. Usuarios.
2. Servicios.
3. Servicios adicionales.
4. Empleados.
5. Horarios.
6. Restricciones.
7. Citas.

### Generar datos por sección

También se puede ejecutar cada sección por separado:

```bash
npm run seed -- usuarios
npm run seed -- servicios
npm run seed -- adicionales
npm run seed -- empleados
npm run seed -- horarios
npm run seed -- restricciones
npm run seed -- citas
```

Se recomienda respetar ese orden porque algunas entidades dependen de otras.

### Imágenes de servicios

Las imágenes utilizadas por el seed se encuentran en:

```text
scripts/seed-images
```

Al ejecutar:

```bash
npm run seed -- servicios
```

el script:

1. Lee las imágenes locales.
2. Las sube a la API.
3. Obtiene el nombre generado por la API.
4. Guarda ese nombre en el servicio.
5. Actualiza los servicios existentes cuya imagen sea `null`.
6. Evita volver a cargar imágenes cuando el servicio ya tiene una.

Las imágenes de esta carpeta deben mantenerse dentro del repositorio.

### Consideraciones del seed

* La API debe tener sus catálogos básicos: roles, estados de cita, días de la semana, tipos de restricción y especialidades.
* El administrador inicial debe existir antes de ejecutar el seed.
* Si las fechas configuradas quedaron en el pasado, deben actualizarse en `scripts/seed-data.js`.
* Si aparece `La fecha no puede ser pasada`, se deben cambiar las fechas del seed por fechas futuras.
* Si aparece `El establecimiento no atiende en la fecha seleccionada`, se debe comprobar que exista un horario activo para ese día.
* Si aparece un error de traslape, se debe revisar que no exista otra cita, restricción u horario ocupando el mismo intervalo.
* Ejecutar el seed varias veces puede producir mensajes indicando que los registros ya existen. El script evita duplicar los datos que puede identificar.

## Usuarios de prueba

Después de ejecutar el seed se pueden utilizar estas cuentas.

### Administrador

```text
Correo: valor configurado en SEED_ADMIN_EMAIL
Contraseña: valor configurado en SEED_ADMIN_PASSWORD
```

### Empleado

```text
Correo: andrea.empleada@tutorias.test
Contraseña: valor configurado en SEED_USER_PASSWORD
```

También se generan:

```text
carlos.empleado@tutorias.test
mariana.empleada@tutorias.test
luis.empleado@tutorias.test
```

### Cliente

```text
Correo: daniela.cliente@tutorias.test
Contraseña: Pruebas123
```

También se genera:

```text
sebastian.cliente@tutorias.test
```

## Comandos disponibles

Iniciar el entorno de desarrollo:

```bash
npm run dev
```

Revisar el código con ESLint:

```bash
npm run lint
```

Generar la versión de producción:

```bash
npm run build
```

Previsualizar la compilación:

```bash
npm run preview
```

Generar datos de prueba:

```bash
npm run seed -- todos
```

## Compilación de producción

Antes de entregar o desplegar el proyecto:

```bash
npm run lint
npm run build
```

La compilación se genera en:

```text
dist
```

Las páginas utilizan carga diferida, por lo que Vite genera archivos separados para reducir el tamaño inicial de la aplicación.

## Estructura principal

```text
src
├── components
│   ├── appointments
│   ├── auth
│   ├── common
│   ├── employees
│   ├── layout
│   └── ui
├── context
├── lib
├── pages
├── services
├── App.jsx
├── index.css
└── main.jsx

scripts
├── seed-data.js
└── seed-images
```

## Reglas principales

* Solo los clientes pueden registrarse públicamente.
* Solo los usuarios activos pueden utilizar el sistema.
* Solo los empleados activos pueden recibir citas.
* Un empleado únicamente puede atender servicios asignados.
* Solo se pueden seleccionar servicios y adicionales activos.
* Las citas deben estar dentro del horario de atención.
* Las restricciones generales afectan a todos los empleados.
* Las restricciones individuales afectan únicamente al empleado correspondiente.
* No se permiten traslapes entre citas del mismo empleado.
* Las citas canceladas no bloquean disponibilidad.
* Los adicionales aumentan el costo, pero no la duración.
* La duración de la cita depende del servicio principal.
* Los clientes no pueden crear citas.
* El acceso directo a rutas también está protegido por rol.

## Estado del proyecto

El proyecto incluye las funcionalidades obligatorias descritas en el enunciado, validaciones visibles, control de acceso por roles, datos iniciales, carga de imágenes, agendas y compilación de producción.
