# Integración de Maestros y Asistencia

## Flujo de Caso de Uso

### 1. **Maestro inicia sesión con Google**
- El maestro hace click en el botón "Iniciar sesión con Google"
- Se valida que el email esté registrado en la colección `teachers`
- Si no está registrado, se muestra error: "No eres maestro registrado en el sistema"
- Si está registrado, se guarda la información del maestro en el estado de la aplicación

### 2. **Maestro accede a su clase**
- El maestro ve el componente `ClassAttendance`
- Puede seleccionar la clase: Niños, Adolescentes, Adultos, Padres
- Puede cambiar la fecha (por defecto es hoy)
- Se cargan todos los miembros activos de esa clase

### 3. **Registrar asistencia**
- Por cada miembro se muestra:
  - ✅ Botón PRESENTE (verde)
  - ❌ Botón AUSENTE (rojo)
  - ⏰ Botón TARDÍO (amarillo)
- Al hacer click, se guarda automáticamente en Firebase
- Se actualiza el estado local
- Aparece confirmación "Guardado exitosamente"

## Estructura de Datos

### Colección: `teachers`
```typescript
{
  id: string;                    // Generado por Firebase
  fullName: string;              // Nombre del maestro
  phone: string;                 // Teléfono
  email: string;                 // Email de Google (IMPORTANTE: usado para login)
  specialties: string[];         // ["ninos", "adolescentes", "adultos"]
  yearsExperience: number;       // Años de experiencia
  status: 'active' | 'inactive'; // Estado
  createdAt: Date;               // Timestamp
  updatedAt: Date;               // Timestamp
}
```

### Colección: `members`
```typescript
{
  // ... otros campos ...
  class: string;  // "ninos" | "adolescentes" | "adultos" | "padres"
  // ... otros campos ...
}
```

### Colección: `attendance`
```typescript
{
  id: string;                                           // Generado por Firebase
  memberId: string;                                     // ID del miembro
  date: Date;                                           // Fecha de asistencia
  status: 'present' | 'absent' | 'late';                // Estado de asistencia
  notes?: string;                                       // Notas opcionales
  createdAt: Date;                                      // Timestamp
  updatedAt: Date;                                      // Timestamp
}
```

## Servicios Creados

### `teacherService.ts`
- `addTeacher(data)` - Crear nuevo maestro
- `getTeacher(id)` - Obtener maestro por ID
- `getTeachers(constraints)` - Obtener todos los maestros
- `getTeachersByEmail(email)` - Obtener maestro por email (CRÍTICO para login)
- `updateTeacher(id, data)` - Actualizar maestro
- `deleteTeacher(id)` - Eliminar maestro
- `searchTeachers(field, value)` - Buscar maestros

### `attendanceService.ts`
- `addAttendance(data)` - Registrar asistencia
- `getAttendance(id)` - Obtener asistencia por ID
- `getAttendances(constraints)` - Obtener todas las asistencias
- `getAttendanceByMemberAndDate(memberId, date)` - Obtener asistencia de un miembro en una fecha específica
- `getAttendanceByClassAndDate(classValue, date)` - Obtener todas las asistencias de una clase en una fecha
- `updateAttendance(id, data)` - Actualizar asistencia
- `deleteAttendance(id)` - Eliminar asistencia
- `getAttendanceReport(memberId, memberName, startDate, endDate)` - Generar reporte de asistencia

## Componentes Creados

### `LoginGoogle.jsx`
**Propósito**: Página de login del maestro
**Props**:
- `onLoginSuccess(teacherData)` - Callback al iniciar sesión

**Flujo**:
1. Muestra botón "Iniciar sesión con Google"
2. Al hacer click, abre popup de Google
3. Valida que el email esté en teachers
4. Llama a `onLoginSuccess` con datos del maestro

### `ClassAttendance.jsx`
**Propósito**: Registrar asistencia de la clase
**Props**:
- `teacher` - Objeto del maestro actualmente logueado

**Características**:
- Selector de clase (Niños, Adolescentes, Adultos, Padres)
- Selector de fecha
- Tabla con lista de miembros
- Botones interactivos (Presente, Ausente, Tardío)
- Guarda automáticamente en Firebase
- Muestra confirmación de guardado

## Configuración de Firebase

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Teachers collection - lectura pública, escritura solo admin
    match /teachers/{document=**} {
      allow read: if true;
      allow write: if false;  // Solo admin en Firebase Console
    }

    // Members collection - lectura para maestros, escritura para admin
    match /members/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;  // Solo admin en Firebase Console
    }

    // Attendance collection - lectura/escritura para maestros autenticados
    match /attendance/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;  // Nunca borrar asistencias
    }
  }
}
```

## Flujo de Implementación en App.jsx

```jsx
import React, { useState } from 'react';
import { LoginGoogle, ClassAttendance, Dashboard } from './components';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');

  const handleLoginSuccess = (teacherData) => {
    setCurrentUser(teacherData);
    setCurrentPage('attendance');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  if (!currentUser) {
    return <LoginGoogle onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <nav className="bg-blue-800 text-white p-4">
        <h2>Bienvenido, {currentUser.displayName}</h2>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </nav>

      {currentPage === 'attendance' && <ClassAttendance teacher={currentUser} />}
      {currentPage === 'dashboard' && <Dashboard />}
    </div>
  );
}

export default App;
```

## Pasos para Completar la Integración

1. **Actualizar App.jsx**
   - Importar LoginGoogle, ClassAttendance
   - Agregar lógica de estado de usuario
   - Implementar logout

2. **Configurar Firebase Auth en Console**
   - Habilitar Google Sign-In
   - Agregar dominio autorizado

3. **Agregar maestros en Firestore**
   - Colección: `teachers`
   - Documentos con emails de los maestros

4. **Agregar campo 'class' a miembros existentes**
   - Actualizar MemberForm para incluir selector de clase
   - Migrar miembros existentes

5. **Prueba del flujo completo**
   - Login con Google
   - Seleccionar clase
   - Registrar asistencia
   - Verificar en Firestore

## Mejoras Futuras

1. **Reportes de Asistencia**
   - Vista de reportes por rango de fechas
   - Exportar a CSV
   - Gráficos de asistencia

2. **Notificaciones**
   - Alertas de ausencias frecuentes
   - Recordatorios de registrar asistencia

3. **Multi-Clase**
   - Permitir que un maestro tenga múltiples clases
   - Vista de horario de clases

4. **Mobile App**
   - Versión PWA optimizada
   - Soporte offline

