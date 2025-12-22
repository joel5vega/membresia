# Sistema de Registro de Clases y Asistencia

## Descripcion General

Este módulo proporciona un sistema completo para registrar clases (reuniones/servicios), trackear asistencia por miembro, y generar reportes historicos con estadisticas.

## Estructura Implementada

### 1. Tipos (TypeScript)

#### `Class` - src/types/class.ts
Interfaz para datos de una clase/reunion:
- `id`: string - ID único del documento
- `fecha`: Date | string - Fecha de la clase
- `maestroId`: string - ID del maestro/lider
- `maestroNombre`: string - Nombre del maestro
- `tema`: string - Tema de la clase
- `numVarones`: number - Conteo de hombres presentes
- `numTotal`: number - Total de asistentes
- `asistenciaTotalPorcentaje`: number - Porcentaje de asistencia
- `ofrendas`: number - Monto de ofrendas (en moneda local)
- `biblias`: number - Número de biblias presentes
- `anuncios`: string - Anuncios importantes
- `registradoPorUserId`: string - ID del usuario que registró
- `registradoPorNombre`: string - Nombre del registrador
- `creadoEn`: Date | string - Timestamp de creación
- `actualizadoEn`: Date | string - Timestamp de actualización
- `notas?`: string - Notas adicionales (opcional)

#### `ClassAttendance` - src/types/classAttendance.ts
Interfaz para registro individual de asistencia:
- `id`: string - ID único
- `classId`: string - Referencia a la clase
- `memberId`: string - ID del miembro
- `memberName`: string - Nombre del miembro
- `presente`: boolean - Indicador de presencia
- `fechaRegistro`: Date | string - Cuándo se registró
- `observaciones?`: string - Notas sobre la asistencia (opcional)

### 2. Servicios Firebase

#### classService.ts - Operaciones de Clases

```typescript
// Crear o actualizar una clase
creatOrUpdateClass(classData): Promise<string>

// Obtener todas las clases
getClasses(): Promise<Class[]>

// Obtener una clase por ID
getClassById(classId): Promise<Class | null>

// Filtrar por rango de fechas
getClassesByDateRange(startDate, endDate): Promise<Class[]>

// Filtrar por maestro
getClassesByTeacher(maestroId): Promise<Class[]>

// Eliminar una clase
deleteClass(classId): Promise<void>
```

#### classAttendanceService.ts - Operaciones de Asistencia

```typescript
// Crear un registro de asistencia
createClassAttendance(attendance): Promise<string>

// Obtener asistencia de una clase
getClassAttendance(classId): Promise<ClassAttendance[]>

// Obtener asistencia de un miembro en clase específica
getMemberClassAttendance(classId, memberId): Promise<ClassAttendance | null>

// Actualizar registro de asistencia
updateClassAttendance(attendanceId, updates): Promise<void>

// Crear múltiples registros (batch)
createBatchClassAttendance(attendances): Promise<void>

// Obtener asistencia de miembro en rango de fechas
getMemberAttendanceByDateRange(memberId, startDate, endDate): Promise<ClassAttendance[]>

// Eliminar registro de asistencia
deleteClassAttendance(attendanceId): Promise<void>
```

### 3. Componentes React

#### ClassForm.jsx
Formulario para registrar una nueva clase:

**Funcionalidades:**
- Captura de datos: fecha, maestro, tema, ofrendas, biblias, anuncios
- Registro de quién está registrando (User ID y nombre)
- Selector múltiple de miembros presentes (checkboxes)
- Cálculo automático de conteos y porcentajes
- Validación de formulario
- Creación de registros de asistencia en lote

**Props:**
- `onClassCreated`: Callback cuando se crea una clase exitosamente

**Ejemplo de uso:**
```jsx
import ClassForm from './components/ClassForm';

<ClassForm onClassCreated={() => console.log('Clase registrada')} />
```

#### ClassReportView.jsx
Vista de reportes y consultas de clases:

**Funcionalidades:**
- Listar todas las clases registradas
- Filtros por:
  - Rango de fechas (desde - hasta)
  - ID del maestro
- Vista en tarjetas de clases
- Click en clase para ver detalles completos
- Exportar a CSV
- Mostrar asistencia detallada de una clase

**Props:** Ninguno (maneja su propio estado)

**Ejemplo de uso:**
```jsx
import ClassReportView from './components/ClassReportView';

<ClassReportView />
```

## Flujo de Implementacion

### 1. Configurar Firebase
Asegúrate de que Firebase está configurado en `services/firebaseConfig.ts` y que `db` está exportado correctamente.

### 2. Crear colecciones Firestore
Crea dos colecciones en Firestore:
- `classes` - Para documentos de clases
- `classAttendance` - Para registros de asistencia

### 3. Integrar en App
Agrega los componentes a tu aplicación:

```jsx
import { ClassForm, ClassReportView } from './components';
import { useAuthContext } from './context/AuthContext';

function App() {
  const { user } = useAuthContext();

  return (
    <div>
      <h1>Sistema de Membresía</h1>
      {user && (
        <>
          <ClassForm />
          <ClassReportView />
        </>
      )}
    </div>
  );
}
```

## Casos de Uso

### 1. Registrar una Clase
1. Ir al formulario ClassForm
2. Llenar datos de la clase
3. Seleccionar miembros presentes
4. Enviar
5. Sistema calcula automáticamente:
   - Número total de asistentes
   - Conteo de hombres
   - Porcentaje de asistencia

### 2. Ver Reportes
1. Ir a ClassReportView
2. Aplicar filtros (opcional)
3. Ver lista de clases
4. Click en clase para detalles
5. Exportar a CSV si es necesario

### 3. Análisis de Datos
Con la información almacenada puedes:
- Comparar asistencia por maestro
- Analizar tendencias temporales
- Ver ofrendas totales por período
- Generar reportes de asistencia individual

## Funcionalidades Adicionales

### Estadísticas Disponibles
- Porcentaje de asistencia por clase
- Promedio de asistentes
- Total de ofrendas
- Tendencias por maestro
- Historial de asistencia por miembro

### Exportación de Datos
- Exportar a CSV: fecha, maestro, tema, asistentes, porcentaje, ofrendas
- Datos históricos para análisis posteriores

## Próximas Mejoras Sugeridas

1. **Estadísticas Avanzadas**
   - Dashboard con gráficos
   - Análisis de tendencias

2. **Reportes Automáticos**
   - Reporte semanal/mensual por email
   - Generación de PDF

3. **Permisos y Roles**
   - Solo maestros pueden crear clases
   - Administradores solo ven reportes

4. **Notificaciones**
   - Recordar registrar clase
   - Avisos de bajo asistencia

5. **Integración**
   - Google Sheets para respaldo
   - Sincronización con calendario

## Estructura Firestore

```
firebase/
├── collections/
│   ├── classes/
│   │   └── {classId}
│   │       ├── fecha: timestamp
│   │       ├── maestroNombre: string
│   │       ├── tema: string
│   │       ├── numTotal: number
│   │       ├── asistenciaTotalPorcentaje: number
│   │       ├── ofrendas: number
│   │       ├── registradoPorNombre: string
│   │       └── creadoEn: timestamp
│   │
│   └── classAttendance/
│       └── {attendanceId}
│           ├── classId: string
│           ├── memberId: string
│           ├── memberName: string
│           ├── presente: boolean
│           └── fechaRegistro: timestamp
```

## Notas Técnicas

- Los timestamps se usan `Timestamp.now()` de Firebase
- La colección `classAttendance` puede crecer mucho; considera índices
- Para rendimiento: usa `getClassesByDateRange` con rangos pequeños
- Backup regular de datos (Firestore tiene exportación integrada)

## Testing

Para probar el módulo:

1. **Crear una clase:**
```js
import { createOrUpdateClass } from './services/classService';
await createOrUpdateClass({
  fecha: new Date(),
  maestroId: 'maestro1',
  maestroNombre: 'Juan',
  tema: 'Lección 1',
  numVarones: 5,
  numTotal: 10,
  asistenciaTotalPorcentaje: 50,
  ofrendas: 100,
  biblias: 8,
  anuncios: 'Próximo evento...',
  registradoPorUserId: 'user123',
  registradoPorNombre: 'María'
});
```

2. **Obtener clases:**
```js
import { getClasses } from './services/classService';
const clases = await getClasses();
console.log(clases);
```

3. **Crear asistencia:**
```js
import { createBatchClassAttendance } from './services/classAttendanceService';
await createBatchClassAttendance([
  { classId: 'class1', memberId: 'member1', memberName: 'Pedro', presente: true },
  { classId: 'class1', memberId: 'member2', memberName: 'Ana', presente: true }
]);
```
