USE citas;

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'General',
  'Especialidad base para servicios y empleados generales.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'General'
);

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'Ciencias Exactas',
  'Tutorías de matemática, cálculo, física y materias relacionadas.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'Ciencias Exactas'
);

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'Tecnología',
  'Tutorías de programación, informática y herramientas tecnológicas.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'Tecnología'
);

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'Idiomas',
  'Tutorías de inglés y otros idiomas.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'Idiomas'
);

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'Ciencias Naturales',
  'Tutorías de biología, química y otras ciencias naturales.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'Ciencias Naturales'
);

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'Estudios Sociales',
  'Tutorías de historia, geografía, educación cívica y ciencias sociales.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'Estudios Sociales'
);

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'Lengua y Literatura',
  'Tutorías de español, redacción, ortografía y análisis literario.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'Lengua y Literatura'
);

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'Administración y Negocios',
  'Tutorías de contabilidad, finanzas, economía y administración.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'Administración y Negocios'
);

INSERT INTO especialidades (nombre, descripcion, activo)
SELECT
  'Preparación de Exámenes',
  'Preparación especializada para exámenes, pruebas de admisión y certificaciones.',
  1
WHERE NOT EXISTS (
  SELECT 1
  FROM especialidades
  WHERE nombre = 'Preparación de Exámenes'
);

SELECT id, nombre, descripcion, activo
FROM especialidades
ORDER BY id;