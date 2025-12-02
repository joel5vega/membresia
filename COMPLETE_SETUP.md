# Guía Completa de Configuración - IglesiaFlow con Maestros y Asistencia

## ✍️ Último paso: Actualizar App.jsx

Reemplaza el contenido de `src/App.jsx` con:

```jsx
import React, { useState } from 'react';
import { LoginGoogle, ClassAttendance, Dashboard } from './components';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(currentUser ? 'attendance' : 'login');

  const handleLoginSuccess = (teacherData) => {
    console.log('Maestro logueado:', teacherData);
    setCurrentUser(teacherData);
    setCurrentPage('attendance');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  // If no user logged in, show login page
  if (!currentUser) {
    return <LoginGoogle onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <nav className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">IglesiaFlow</h2>
          <p className="text-sm">Bienvenido, {currentUser?.displayName}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentPage('attendance')}
            className="hover:bg-blue-700 px-4 py-2 rounded"
          >
            Asistencia
          </button>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="hover:bg-blue-700 px-4 py-2 rounded"
          >
            Panel
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="container mx-auto">
        {currentPage === 'attendance' && <ClassAttendance teacher={currentUser} />}
        {currentPage === 'dashboard' && <Dashboard />}
      </div>
    </div>
  );
}

export default App;
```

## ✅ Lista de Verificación Completa

### Parte 1: Archivos Creados

#### Servicios
- [x] `src/services/teacherService.ts` - CRUD de maestros
- [x] `src/services/attendanceService.ts` - CRUD de asistencia
- [x] `src/services/index.ts` - Exportaciones

#### Componentes
- [x] `src/components/LoginGoogle.jsx` - Login con Google
- [x] `src/components/ClassAttendance.jsx` - Registro de asistencia
- [x] `src/components/index.js` - Exportaciones

#### Tipos
- [x] `src/types/member.ts` - Actualizado con campo 'class'
- [x] `src/types/teacher.ts` - Ya existente
- [x] `src/types/attendance.ts` - Ya existente

#### Documentación
- [x] `TEACHERS_INTEGRATION.md` - Documentación completa
- [x] `UPDATE_MEMBERFORM.md` - Instrucciones para MemberForm
- [x] `COMPLETE_SETUP.md` - Este archivo

### Parte 2: Configuración Firebase

#### Habilitar Google Sign-In
1. Ir a Firebase Console
2. Ir a Autenticación
3. Habilitar proveedor: Google
4. Agregar dominio autorizado (localhost:5173 para desarrollo)

#### Crear Colecciones en Firestore

**teachers**
```json
{
  "fullName": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+591-1234567",
  "specialties": ["ninos", "adolescentes"],
  "yearsExperience": 5,
  "status": "active",
  "createdAt": "2024-12-02",
  "updatedAt": "2024-12-02"
}
```

**members** (actualizar existentes)
Agregar campo "class": "ninos" | "adolescentes" | "adultos" | "padres"

#### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teachers/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    match /members/{document=**} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    match /attendance/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

### Parte 3: Pasos de Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Verificar que estén instaladas**
   - React 18+
   - Firebase
   - Lucide React
   - Tailwind CSS

3. **Actualizar MemberForm.jsx**
   Ver `UPDATE_MEMBERFORM.md` para instrucciones

4. **Actualizar App.jsx**
   Usar el código de arriba

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## 🌟 Flujo Completo de Uso

### Para Administrador
1. Registrar maestros en Firestore (colección 'teachers')
   - Usar email de Google del maestro
   - Especificar especialidades (clases que puede enseñar)
2. Registrar miembros con MemberForm
   - Asignar a una clase (Niños, Adolescentes, Adultos, Padres)

### Para Maestro
1. Hacer click en "Iniciar sesión con Google"
2. Se valida email en colección teachers
3. Accede a ClassAttendance
4. Selecciona clase y fecha
5. Registra asistencia (Presente/Ausente/Tardío)
6. Datos se guardan automáticamente en Firestore

## 💡 Casos de Uso Avanzados

### Cambiar Asistencia Existente
- El maestro puede volver a hacer click en un miembro
- Se actualiza automáticamente el estado

### Ver Historial
- Los registros de asistencia se guardan con fecha
- Permitir cambiar fecha para ver/editar asistencias pasadas

### Reportes
- usar `attendanceService.getAttendanceReport()`
- Calcular porcentaje de asistencia
- Exportar a CSV

## 🔧 Troubleshooting

### "No eres maestro registrado"
- Verificar que el email esté exactamente igual en Firestore
- Verificar que el documento existe en colección 'teachers'

### No se guardan las asistencias
- Verificar Firestore Security Rules
- Verificar que esté autenticado (check en Firebase Console)
- Ver console del navegador para errores

### No se cargan los miembros
- Verificar que existan miembros con la clase seleccionada
- Verificar que tengan status 'active'

## 🎨 Personalización

### Cambiar Colores
Editar en ClassAttendance.jsx:
- Verde (Presente): `bg-green-100 text-green-600`
- Rojo (Ausente): `bg-red-100 text-red-600`
- Amarillo (Tardío): `bg-yellow-100 text-yellow-600`

### Agregar Más Estados
- Editar `src/types/attendance.ts`
- Actualizar `AttendanceStatus` type
- Agregar botones en ClassAttendance.jsx

### Cambiar Nombres de Clases
- Editar `classOptions` en ClassAttendance.jsx
- Actualizar miembros existentes en Firestore

