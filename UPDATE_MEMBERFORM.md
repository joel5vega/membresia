# Código a agregar en MemberForm.jsx

Reemplaza la sección del formData inicial por:

```jsx
const [formData, setFormData] = useState({
  fullName: '',
  phone: '',
  zone: '',
  educationLevel: '',
  currentlyStudying: false,
  incomeSource: '',
  profession: '',
  playsInstrument: false,
  talents: '',
  class: 'ninos',  // NUEVO: Campo de clase
  email: '',
  address: '',
  status: 'active',
  notes: '',
});
```

Y agrega este fieldset antes de la sección de "Additional Info":

```jsx
{/* Class Section - NEW */}
<fieldset className="border-l-4 border-indigo-600 pl-4">
  <legend className="text-lg font-semibold mb-4">Clase</legend>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <select
      name="class"
      value={formData.class}
      onChange={handleChange}
      required
      className="border rounded px-4 py-2"
    >
      <option value="ninos">Niños</option>
      <option value="adolescentes">Adolescentes</option>
      <option value="adultos">Adultos</option>
      <option value="padres">Padres</option>
    </select>
  </div>
</fieldset>
```

## Resultado Final

Ahora cuando se registre un nuevo miembro, será asignado a una de las cuatro clases:
- **Niños** (3-12 años)
- **Adolescentes** (13-18 años)
- **Adultos** (19+ años)
- **Padres** (Ministerio de padres)

Esta clasificación permitirá a los maestros:
1. Filtrar miembros por clase
2. Registrar asistencia de su clase específica
3. Generar reportes por clase
