
# Sistema de Genogramas Familiares - Implementación Completada

## Descripción General
Se ha implementado un sistema completo de genogramas familiares que permite:
- Crear y gestionar relaciones familiares entre miembros de la iglesia
- Visualizar las familias de forma gráfica usando React Flow
- Organizar miembros en grupos familiares basado en relaciones transversales

## Archivos Creados

### 1. Utilidades (`src/utils/familyGrouping.js`)
**Funciones principales:**
- `buildFamilyGroups(members)`: Agrupa miembros en familias usando algoritmo BFS
- `buildGenogramData(familyMembers, allMembers)`: Construye nodos y aristas para React Flow
- `calculateAge(fechaNacimiento)`: Calcula edad a partir de fecha de nacimiento
- `getEdgeType(relacion)`: Clasifica tipos de relaciones (matrimonio, parentales, hermanos)

### 2. Gestor de Relaciones (`src/components/Genogram/RelationshipManager.jsx`)
**Componente React que permite:**
- Seleccionar un miembro principal de la lista
- Elegir tipo de relación (Padre, Madre, Hijo, Hija, Esposo, Esposa, etc.)
- Seleccionar el miembro relacionado
- Marcar si viven juntos
- Agregar/eliminar relaciones de forma bidireccional
- Ver todas las relaciones del miembro seleccionado

**Tipos de relaciones soportadas:**
- Ascendentes: Padre, Madre, Abuelo, Abuela
- Descendientes: Hijo, Hija, Nieto, Nieta  
- Cónyuge: Esposo, Esposa
- Hermanos: Hermano, Hermana
- Tíos/Sobrinos: Tío, Tía, Sobrino, Sobrina
- Primos: Primo, Prima

### 3. Dashboard de Familias (`src/components/Genogram/FamilyDashboard.jsx`)
**Componente React Flow que proporciona:**
- Vista general con todas las familias como nodos agrupados
- Click en familia para expandir y ver genograma completo
- Nodos personalizados por género:
  - **Hombres**: Cuadrados azules (#4F46E5)
  - **Mujeres**: Círculos rosados (#EC4899)
- Líneas diferenciadas por relación:
  - **Matrimonio**: Líneas rojas gruesas (#EF4444)
  - **Parentales**: Líneas grises (#6B7280)
  - **Hermanos**: Líneas grises (#6B7280)
- Layout automático con Dagre
- Mini-mapa de navegación
- Animación para miembros que viven juntos

## Modelo de Datos Firestore

Cada miembro en la colección `miembros` contiene un array `genograma`:

```typescript
genograma: [
  {
    miembroId: string;      // ID del miembro relacionado
    relacion: string;       // Tipo de relación
    nombre: string;         // Nombre del miembro
    edad: string;           // Edad calculada
    viveConElMiembro: boolean; // Indica convivencia
  }
]
```

## Dependencias Instaladas

```bash
npm install reactflow dagre
```

- **reactflow** (v11.x): Biblioteca para crear gráficos interactivos
- **dagre** (v0.8.x): Algoritmo de layout para gráfos dirigidos acíclicos

## Integración en App.jsx

**Importaciones agregadas:**
```javascript
import RelationshipManager from './components/Genogram/RelationshipManager';
import FamilyDashboard from './components/Genogram/FamilyDashboard';
```

**Cómo integrar en tu aplicación:**

1. Crear una ruta o estado para `currentPage`
2. Agregar botones de navegación en tu sidebar/navbar
3. Renderizar componentes según la página seleccionada

```javascript
{currentPage === 'familyDashboard' && <FamilyDashboard />}
{currentPage === 'relationshipManager' && <RelationshipManager />}
```

## Flujo de Uso

### Paso 1: Agregar Relaciones
1. Navegar a "Gestor de Relaciones"
2. Seleccionar miembro principal
3. Seleccionar tipo de relación
4. Seleccionar miembro relacionado
5. Opcionalmente marcar "Viven juntos"
6. Hacer click en "Agregar Relación"

### Paso 2: Visualizar Genogramas
1. Navegar a "Dashboard de Familias"
2. Ver grupos familiares como nodos
3. Hacer click en un grupo para expandir
4. Ver genograma completo con relaciones
5. Usar controles para zoom/pan
6. Hacer click en "Volver" para ver resumen de familias

## Características Principales

✅ **Relaciones Bidireccionales**: Las relaciones se guardan automáticamente en ambos miembros

✅ **Relaciones Inversas**: El sistema calcula automáticamente la relación inversa

✅ **Agrupación Inteligente**: Usa BFS para encontrar todas las familias conectadas

✅ **Layout Inteligente**: Usa Dagre para organizar nodos automáticamente

✅ **Interfaz Intuitiva**: Selecciones en cascada (miembro → relación → miembro relacionado)

✅ **Visualización Rica**: Diferencia género con formas y colores

✅ **Edición Completa**: Agregar y eliminar relaciones fácilmente

## Archivos Modificados

- **src/App.jsx**: Agregadas importaciones de los nuevos componentes
- **package.json**: Agregadas dependencias reactflow y dagre

## Próximos Pasos (Opcionales)

1. Agregar fotos de perfil en nodos (ya está soportado en modelo)
2. Implementar filtros por género, edad, estado civil
3. Exportar genogramas a PDF
4. Historial de cambios en relaciones
5. Reportes familiares
6. Búsqueda de antecesor/descendientes

## Tecnologías Utilizadas

- **React 18**: Framework principal
- **Vite**: Build tool y dev server
- **Firebase/Firestore**: Base de datos
- **React Flow**: Visualización de gráficos
- **Dagre**: Layout de gráfos
- **Tailwind CSS**: Estilos

## Notas Importantes

1. Las relaciones se guardan de forma bidireccional en Firestore
2. El cálculo de edad es automático basado en `fechaNacimiento`
3. El algoritmo de agrupación es transitivo (si A-B y B-C, entonces A, B, C están en la misma familia)
4. El layout se recalcula cada vez que se expande una familia

## Troubleshooting

**Error: "db is not defined"**
- Verificar que existe `src/firebase.js` con exportación de `db`

**Error: "buildFamilyGroups is not a function"**
- Verificar importación correcta desde `'../../utils/familyGrouping'`

**Relaciones no se guardan**
- Verificar conexión a Firebase
- Verificar permisos de Firestore

## Autor
Implementación del sistema de genogramas familiares
Fecha: Enero 2026
