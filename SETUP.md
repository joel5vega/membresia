# Configuración de IglesiaFlow

## Estructura Creada

```
proyecto/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── MemberForm.jsx
│   │   └── index.js
│   ├── services/
│   │   ├── firebaseConfig.ts
│   │   ├── memberService.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── member.ts
│   │   ├── teacher.ts
│   │   ├── attendance.ts
│   │   └── index.ts
│   ├── pages/       (para futuras páginas)
│   ├── context/      (para contextos de React)
│   ├── hooks/        (para hooks personalizados)
│   ├── utils/        (utilidades generales)
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .env.local
└── README.md
```

## Instalación de Dependencias

```bash
npm install
```

Esto instalará todos los paquetes del package.json:
- React 18+
- Firebase
- Vite
- Tailwind CSS
- Y más...

## Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:5173

## Componentes Creados

### Dashboard.jsx
- Panel principal con estadísticas
- Tarjetas de resumen (miembros, maestros, asistencia)
- Botones de acción rápida

### MemberForm.jsx
- Formulario completo basado en IEDB Canaán Google Form
- Secciones: Datos Personales, Educación, Empleo, Talentos
- Integración con Firebase
- Validación de campos

## Servicios Creados

### firebaseConfig.ts
- Configuración de Firebase
- Inicialización de Firestore, Auth, Storage

### memberService.ts
- CRUD completo para miembros
- Métodos: addMember, getMember, getMembers, updateMember, deleteMember, searchMembers

## Tipos de Datos

### Member
```typescript
id: string
fullName: string
phone: string
zone: string
educationLevel: string
currentlyStudying: boolean
incomeSource: string
profession: string
playsInstrument: boolean
talents: string
email?: string
address?: string
joinDate: Date
status: 'active' | 'inactive' | 'visitor'
notes?: string
```

### Teacher
```typescript
id: string
fullName: string
phone: string
email?: string
specialties: string[]
yearsExperience: number
status: 'active' | 'inactive'
```

### Attendance
```typescript
id: string
memberId: string
date: Date
status: 'present' | 'absent' | 'late'
notes?: string
```

## Próximos Pasos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Firebase**:
   - Crear proyecto en https://console.firebase.google.com
   - Copiar credenciales
   - Actualizar .env.local

3. **Crear componentes faltantes**:
   - MemberList.jsx
   - TeacherForm.jsx
   - TeacherList.jsx
   - AttendanceForm.jsx
   - AttendanceReport.jsx
   - Navigation.jsx (navbar mejorada)

4. **Crear servicios faltantes**:
   - teacherService.ts
   - attendanceService.ts

5. **Crear rutas**:
   - Integrar React Router
   - Crear páginas para cada sección

6. **Autenticación**:
   - Crear LoginPage.jsx
   - Crear ProtectedRoute
   - Integrar Firebase Auth

7. **Mejorar UI/UX**:
   - Agregar más iconos de Lucide React
   - Mejorar formularios
   - Agregar notificaciones toast

## Variables de Entorno

Asegúrate de que .env.local tenga las credenciales de Firebase correctas:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```
