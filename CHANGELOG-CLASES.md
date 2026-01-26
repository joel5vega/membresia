# Cambios en el Sistema de Gestión de Clases y Asistencia

## Fecha: $(date +%Y-%m-%d)

### Resumen de Cambios

Se ha separado la funcionalidad de gestión de clases en dos vistas distintas para mejorar la usabilidad y claridad del sistema.

### 1. Nueva Vista: Configuración de Clases (`/clases`)

**Archivo:** `src/components/ClassManagementView.jsx`

**Funcionalidades:**
- CRUD completo de clases (Crear, Leer, Actualizar, Eliminar)
- Campos configurables:
  - Nombre de la clase
  - Tipo (Sociedad, Avenida, Escuela Dominical, Juvenil, Otro)
  - Género (Mixto, Varones, Mujeres)
  - Maestro asignado
  - Descripción
  - Estado (Activa/Inactiva)
- Integración con Firebase Firestore
- Interfaz administrativa para gestión de clases

**Ruta:** `/clases`

**Acceso:** Administradores y secretarios de la iglesia

### 2. Vista Refactorizada: Registro de Asistencia

**Archivo:** `src/components/ClassAttendance.jsx`

**Mejoras implementadas:**
- Carga dinámica de clases desde Firestore
- Eliminación de clases hardcodeadas
- Filtrado automático de clases activas
- Integración con el nuevo sistema de configuración

**Código agregado:**
```javascript
// Cargar clases desde Firestore
useEffect(() => {
  const loadClasses = async () => {
    try {
      const db = getFirestore();
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classList = classesSnapshot.docs
        .filter(doc => doc.data().activo)
        .map(doc => ({
          value: doc.data().nombre,
          label: doc.data().nombre,
          id: doc.id,
          ...doc.data()
        }));
      setClassMembers(classList);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    }
  };
  loadClasses();
}, []);
```

### 3. Actualización de Rutas

**Archivo:** `src/App.jsx`

**Cambio realizado:**
```javascript
import ClassManagementView from './components/ClassManagementView';

// Nueva ruta agregada
<Route path="/clases" element={<ClassManagementView />} />
```

### 4. Estructura de Base de Datos

**Colección Firebase:** `classes`

**Esquema de documento:**
```javascript
{
  nombre: string,        // Nombre de la clase
  tipo: string,          // Sociedad | Avenida | Escuela Dominical | Juvenil | Otro
  genero: string,        // Mixto | Varones | Mujeres
  maestro: string,       // Nombre del maestro
  descripcion: string,   // Descripción de la clase
  activo: boolean        // Estado de la clase
}
```

### 5. Flujo de Trabajo Recomendado

1. **Configuración inicial:**
   - Admin navega a `/clases`
   - Crea todas las clases necesarias (Varones, Damas, Jóvenes, etc.)
   - Asigna maestros a cada clase

2. **Registro de asistencia:**
   - Maestro o líder navega a la vista de asistencia
   - Selecciona la clase desde el dropdown (ya poblado dinámicamente)
   - Registra la asistencia de los miembros

### 6. Beneficios de la Separación

- **Claridad:** Roles bien definidos (configurar vs. registrar)
- **Escalabilidad:** Fácil agregar nuevas clases sin modificar código
- **Mantenibilidad:** Código más limpio y organizado
- **Flexibilidad:** Las clases se gestionan dinámicamente
- **Seguridad:** Se puede restringir acceso por rol

### 7. Próximos Pasos Sugeridos

- [ ] Implementar control de acceso basado en roles
- [ ] Agregar validaciones de formulario
- [ ] Crear reportes de asistencia por clase
- [ ] Implementar historial de cambios en clases
- [ ] Agregar búsqueda y filtros en la lista de clases
- [ ] Implementar notificaciones para maestros

### 8. Notas Técnicas

- Se mantiene el array `classOptions` como fallback en `ClassAttendance.jsx`
- Las clases inactivas no se muestran en el selector de asistencia
- La vista de configuración usa TailwindCSS para estilos
- Se utilizan React Icons (FaPlus, FaEdit, FaTrash, FaSave, FaTimes)

---

**Desarrollado por:** Joel Vega  
**Fecha:** 25 de enero de 2026
