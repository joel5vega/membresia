import React, { useState, useEffect } from 'react';
import { memberService } from '../services/memberService';

const MemberForm = ({ onSuccess, onCancel , initialData = null, editMode = false, memberId = null, initialMember = null}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMember || initialData) {
      setFormData(initialMember || initialData);
    }
  }, [initialMember, initialData]);
  const [formData, setFormData] = useState({
    // Page 1
    class: '',
   nombre: '',
  apellido: '',
  ci:'',
  sexo:'',
    celular: '',
    correo:'',
    zona: '',
    clase: '',
    fechaNacimiento:'',
    // Page 2
    nivelEducacion: '',
    estudiaActualmente: '',
    ingresos: '',
    profesion: '',
    instrumento: '',
    talentosHabilidades: '',
    // NUEVO: situación económica y vivienda
    ingresoDescripcion: '',
    ingresoMonto: '',
    egresoMonto: '',
    tipoVivienda: '',
    materialVivienda: '',
    numHabitaciones: '',
    numBanos: '',
    numCocinas: '',
    otrosAmbientes: '',
    condicionHabitabilidad: '',
    // Page 3
    enfermedadCronica: '',
    estadoCivil: '',
    padresCreyentes: '',
    familiaAsiste: '',
    relacion: '',
    parejaCristiana: '',
    nombrePareja: '',
    numHijos: '',
    // NUEVO: genograma
    genograma: [
      { nombre: '', relacion: '', edad: '', viveConElMiembro: false },
    ],
    // Page 4
    aniosIglesia: '',
    bautizado: '',
    salvo: '',
    aniosCristiano: '',
    familia2doGrado: '',
    escuelaDominical: '',
    discipulado: '',
    formacionTeologica: '',
    estudiosBiblicos: '',
    seminario: '',
    // NUEVO: info eclesiástica extra
    cargos:'',
    iglesiaProcedencia: '',
    tiempoConversion: '',
    ministerios: '',
    // Page 5
    areasInteres: [],
    donesEspirituales: [],
    liderazgo: '',
    cargoPosible: '',
    mejorIglesia: '',
    cambiosIglesia: '',
    notasFamilia:'',
        // Page 6: Photo, Dates, and Family
    photoUrl: '',
    baptismDate: '',
    membershipDate: '',
    familyRelationships: [],

  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Soportar checkbox simple si lo necesitas luego
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value] 
        : prev[field].filter(item => item !== value)
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };


  // NUEVO: handlers para genograma
  const handleGenogramaChange = (index, field, value) => {
    const copia = [...formData.genograma];
    copia[index][field] = value;
    setFormData(prev => ({ ...prev, genograma: copia }));
  };

  const addGenogramaRow = () => {
    setFormData(prev => ({
      ...prev,
      genograma: [
        ...prev.genograma,
        { nombre: '', relacion: '', edad: '', viveConElMiembro: false },
      ],
    }));
  };

  const validatePage = (page) => {
    if (page === 1) {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      alert('Por favor ingresa tu nombre y apellido');
      return false;
    }
  }
    if (page === 3) {
      if (!formData.enfermedadCronica) {
        alert('Por favor responde si padeces de enfermedad crónica');
        return false;
      }
      if (!formData.estadoCivil) {
        alert('Por favor selecciona tu estado civil');
        return false;
      }
    }
    // if (page === 5) {
    //   if (formData.areasInteres.length === 0) {
    //     alert('Por favor selecciona al menos un área de interés');
    //     return false;
    //   }
    // }
    return true;
  };

  const handleNext = () => {
    if (validatePage(currentPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validatePage(5)) return;
    
    setLoading(true);
    try {
      await memberId
          ? memberService.updateMember(memberId, formData)
          : memberService.addMember(formData);
      alert('Miembro guardado exitosamente!');
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar miembro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (!validatePage(currentPage)) return;
    
    setLoading(true);
    try {
      if (memberId) {
        await memberService.updateMember(memberId, formData);
      } else {
        await memberService.addMember(formData);
      }
      alert('Miembro guardado exitosamente!');
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar miembro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const zonas = ['1º de mayo', '16 de julio', '25 de julio', 'Alto de la alianza', 'Alto Lima', 'Ballivián', 
'Ciudad Satélite', 'Complejo', 'Convifag', 'Cosmos 77', 'Cosmos 78', 'Cosmos 79', 
'Cupilupaca', 'El Kenko', 'Germán Busch', 'Júpiter', 'Julio Cesar Valdez', 'Kollpani', 
'La Ceja', 'Mercedario', 'Mururata', 'Nuevos Horizontes', 'Paraiso', 'Río Seco', 'San Jose de Charapaqui', 
'Santiago I', 'Santiago II', 'Senkata', 'Urb San Carlos', 
'V. Alemania', 'V. Adela', 'V. Bolivar B', 'V. Bolivar E', 'V. Bolivar F', 'V. Candelaria', 
'V. Cooperativa', 'V. Dolores', 'V. Dolores F', 'V. Exaltación', 'V. Ingenio', 'V. Ingavi', 
'V. Juliana', 'V. Kakingara', 'V. Mercedes', 'V. Pacajes', 'V. Salome', 'V. Santa Rosa', 'V. Yunguyo'
  ];

  const clases = [
    'Sociedad de Caballeros "Emanuel"',
    'Sociedad de Señoras "Shaddai"',
    'Sociedad de Matrimonios jóvenes "Ebenezer"',
    'Sociedad de Jóvenes "Soldados de la Fe"',
    'Sociedad de prejuveniles "Vencedores"',
    'Clase de Exploradores',
    'Clase de Estrellitas',
    'Clase de joyitas','Av. Jireh','Av. Luz del evangelio','Av. Elohim','Av. Jesús es el camino','Inactive'
  ];

  const profesiones = ['artesano','ama de casa', 'transportista', 'comerciante', 'estudiante', 'jubilado',
    'abogado', 'médico', 'ingeniero', 'contador', 'constructor','carpintero', 'cocinero', 'electricista','otro'
  ];

  const opciones = [
    'Menos de 3 meses', 'Entre 3 meses y 1 año', 'Entre 1 año y 3 años',
    'Entre 4 años y 6 años', 'Entre 7 años y 10 años', 'Más de 10 años'
  ];

  const areasEstudio = [
    'Familia Cristiana', 'Relaciones amorosas', 'Administración financiera',
    'Liderazgo', 'Dones espirituales', 'Misiones', 'Evangelismo',
    'Métodos de estudio Bíblico', 'Profecías de los últimos tiempos',
    'Guerra espiritual', 'Alabanza y adoración'
  ];

  const dones = [
    'Profecía', 'Servicio', 'Enseñanza', 'Exhortación', 'Administración',
    'Liderazgo', 'Misericordia', 'Sabiduría', 'Ciencia', 'Sanidad', 'Fe',
    'Milagros', 'Discernimiento de espíritus', 'Lenguas', 'Interpretación de lenguas',
    'Predicación', 'Evangelista', 'Pastor', 'Oración','Otros'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Página {currentPage} de 5
            </h2>
            <span className="text-sm text-gray-600">{Math.round((currentPage / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPage / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* PAGE 1: Datos Personales */}
        {currentPage === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Datos Personales</h3>

        {/* Foto de Perfil */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Foto de Perfil
          </label>
          <div className="flex items-center gap-4">
            {formData.photoUrl && (
              <img
                src={formData.photoUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
              />
            )}
            <input
              type="file"
              accept="image/*"
                        capture="environment"
              onChange={handlePhotoUpload}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

            
            {/* Nombre */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Nombres *
  </label>
  <input
    type="text"
    name="nombre"
    value={formData.nombre}
    onChange={handleInputChange}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Tus nombres"
  />
</div>

{/* Apellido */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Apellidos *
  </label>
  <input
    type="text"
    name="apellido"
    value={formData.apellido}
    onChange={handleInputChange}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Tus apellidos"
  />
</div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="M">Varón</option>
                <option value="F">Mujer</option>
               </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carnet
              </label>
              <input
                type="tel"
                name="ci"
                value={formData.ci}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu número de Carnet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Celular
              </label>
              <input
                type="tel"
                name="celular"
                value={formData.celular}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu número de celular"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo
              </label>
              <input
                type="mail"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tu correo electrónico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿En qué zona vive?
              </label>
              <select
                name="zona"
                value={formData.zona}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una zona...</option>
                {zonas.map(zona => (
                  <option key={zona} value={zona}>{zona}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿A qué clase/sociedad pertenece?
              </label>
              <select
                name="clase"
                value={formData.clase}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una clase/sociedad...</option>
                {clases.map(clase => (
                  <option key={clase} value={clase}>{clase}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* PAGE 2: Formación + Situación económica y vivienda */}
        {currentPage === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Formación</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel máximo de educación alcanzado
              </label>
              <select
                name="nivelEducacion"
                value={formData.nivelEducacion}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Colegio">Colegio</option>
                <option value="TecnicoMedio">Técnico medio</option>
                <option value="TecnicoSuperior">Técnico superior</option>
                <option value="Universidad">Universidad</option>
                <option value="Instituto">Instituto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Actualmente estudia?
              </label>
              <select
                name="estudiaActualmente"
                value={formData.estudiaActualmente}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cómo obtiene sus ingresos?
              </label>
              <select
                name="ingresos"
                value={formData.ingresos}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Trabajador asalariado">Trabajador asalariado</option>
                <option value="Trabajador independiente">Trabajador independiente</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cuál es su profesión u oficio?
              </label>
              <select
                name="profesion"
                value={formData.profesion}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                {profesiones.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

           

            {/* NUEVA SECCIÓN: Situación económica */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6">Situación económica</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingresos - descripción
              </label>
              <input
                type="text"
                name="ingresoDescripcion"
                value={formData.ingresoDescripcion}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. sueldo, negocio propio, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingresos - monto mensual (Bs.)
              </label>
              <input
                type="number"
                name="ingresoMonto"
                value={formData.ingresoMonto}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Monto aproximado de ingresos mensuales"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Egresos - monto mensual aproximado (Bs.)
              </label>
              <input
                type="number"
                name="egresoMonto"
                value={formData.egresoMonto}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Gastos mensuales aproximados"
              />
            </div>

            {/* NUEVA SECCIÓN: Condiciones de habitabilidad */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6">Condiciones de habitabilidad</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de vivienda
              </label>
              <select
                name="tipoVivienda"
                value={formData.tipoVivienda}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="propia">Propia</option>
                <option value="alquilada">Alquilada</option>
                <option value="cedida">Cedida</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material de la vivienda
              </label>
              <select
                name="materialVivienda"
                value={formData.materialVivienda}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="ladrillo">Ladrillo</option>
                <option value="adobe">Adobe</option>
                <option value="madera">Madera</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de habitaciones
              </label>
              <input
                type="number"
                name="numHabitaciones"
                value={formData.numHabitaciones}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de baños
              </label>
              <input
                type="number"
                name="numBanos"
                value={formData.numBanos}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cocina (ambientes)
              </label>
              <input
                type="number"
                name="numCocinas"
                value={formData.numCocinas}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Otros ambientes
              </label>
              <input
                type="text"
                name="otrosAmbientes"
                value={formData.otrosAmbientes}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. patio, garaje, local comercial, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condiciones de habitabilidad
              </label>
              <select
                name="condicionHabitabilidad"
                value={formData.condicionHabitabilidad}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="normal">Normal</option>
                <option value="hacinamiento">Hacinamiento</option>
              </select>
            </div>
          </div>
        )}

        {/* PAGE 3: Salud, Familia y Genograma */}
        {currentPage === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Salud y Familia</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actualmente padece de alguna enfermedad crónica *
              </label>
              <select
                name="enfermedadCronica"
                value={formData.enfermedadCronica}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado civil *
              </label>
              <select
                name="estadoCivil"
                value={formData.estadoCivil}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Viudo/a">Viudo/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Sus padres son creyentes?
              </label>
              <select
                name="padresCreyentes"
                value={formData.padresCreyentes}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí ambos son creyentes">Sí ambos son creyentes</option>
                <option value="No ninguno es creyente">No ninguno es creyente</option>
                <option value="Sólo uno de ellos es creyente">Sólo uno de ellos es creyente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Su familia asiste a la iglesia?
              </label>
              <select
                name="familiaAsiste"
                value={formData.familiaAsiste}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
                <option value="Algunos asisten">Algunos asisten</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas familiares
              </label>
              <input
                type="text"
                name="notasFamilia"
                value={formData.notasFamilia}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Notas familiares"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Está en una relación amorosa actualmente?
              </label>
              <select
                name="relacion"
                value={formData.relacion}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Su pareja es cristiana?
              </label>
              <select
                name="parejaCristiana"
                value={formData.parejaCristiana}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
                <option value="No tengo pareja">No tengo pareja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de su pareja
              </label>
              <input
                type="text"
                name="nombrePareja"
                value={formData.nombrePareja}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de tu pareja (si aplica)"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cuántos hijos tiene?
              </label>
              <select
                name="numHijos"
                value={formData.numHijos}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Ninguno">Ninguno</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5+">5+</option>
              </select>
            </div>

            {/* NUEVA SECCIÓN: Genograma familiar */}
            <h3 className="text-lg font-semibold text-gray-800 mt-6">Genograma familiar</h3>
            <p className="text-sm text-gray-600 mb-2">
              Registre a los miembros de su familia, relación y si viven en la misma vivienda.
            </p>

            {formData.genograma.map((p, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 bg-gray-50 p-2 rounded">
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre"
                  value={p.nombre}
                  onChange={(e) => handleGenogramaChange(index, 'nombre', e.target.value)}
                />
                <input
                  type="text"
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Relación (padre, madre, hijo...)"
                  value={p.relacion}
                  onChange={(e) => handleGenogramaChange(index, 'relacion', e.target.value)}
                />
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Edad"
                  value={p.edad}
                  onChange={(e) => handleGenogramaChange(index, 'edad', e.target.value)}
                />
                <label className="inline-flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    checked={p.viveConElMiembro}
                    onChange={(e) =>
                      handleGenogramaChange(index, 'viveConElMiembro', e.target.checked)
                    }
                  />
                  <span className="ml-2">Vive en la misma vivienda</span>
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={addGenogramaRow}
              className="mt-2 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
            >
              Añadir familiar
            </button>
          </div>
        )}

        {/* PAGE 4: Información Eclesiástica */}
        {currentPage === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Información Eclesiástica</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Cuántos años asiste a la iglesia Canaán?
              </label>
              <select
                name="aniosIglesia"
                value={formData.aniosIglesia}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                {opciones.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Es bautizado
              </label>
              <select
                name="bautizado"
                value={formData.bautizado}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actualmente padece de alguna enfermedad crónica *
              </label>
              <select
                name="enfermedadCronica"
                value={formData.enfermedadCronica}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hace cuanto tiempo es Cristiano?
              </label>
              <select
                name="aniosCristiano"
                value={formData.aniosCristiano}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                {opciones.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Su familia de 1er grado asiste a la iglesia?
              </label>
              <select
                name="familia2doGrado"
                value={formData.familia2doGrado}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí algunos asisten a Iglesia Canaán">Sí algunos asisten a Iglesia Canaán</option>
                <option value="No ninguno asiste a ninguna iglesia">No ninguno asiste a ninguna iglesia</option>
                <option value="Sí pero asisten a otra iglesia cristiana">Sí pero asisten a otra iglesia cristiana</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asiste regularmente a su Escuela Dominical
              </label>
              <select
                name="escuelaDominical"
                value={formData.escuelaDominical}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
                <option value="Ocasionalmente">Ocasionalmente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Pasó los cursos de discipulado de la iglesia?
              </label>
              <select
                name="discipulado"
                value={formData.discipulado}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Ninguno">Ninguno</option>
                <option value="Discipulado 1">Discipulado 1</option>
                <option value="Discipulado 1 y 2">Discipulado 1 y 2</option>
                <option value="Discipulado 1, 2 y 3">Discipulado 1, 2 y 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiene alguna formación teológica
              </label>
              <select
                name="formacionTeologica"
                value={formData.formacionTeologica}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desearía participar en estudios bíblicos semanales
              </label>
              <select
                name="estudiosBiblicos"
                value={formData.estudiosBiblicos}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div> */}

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Desearía estudiar en el seminario bíblico de la denominación?
              </label>
              <select
                name="seminario"
                value={formData.seminario}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div> */}

            {/* NUEVOS CAMPOS: info eclesiástica adicional */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Iglesia de procedencia
              </label>
              <input
                type="text"
                name="iglesiaProcedencia"
                value={formData.iglesiaProcedencia}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre de la iglesia anterior (si aplica)"
              />
            </div> */}
            
 <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Sabe tocar algún instrumento musical?
              </label>
              <select
                name="instrumento"
                value={formData.instrumento}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué talento o habilidad tiene?
              </label>
              <textarea
                name="talentosHabilidades"
                value={formData.talentosHabilidades}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe tus talentos y habilidades"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo de conversión (años)
              </label>
              <input
                type="number"
                name="tiempoConversion"
                value={formData.tiempoConversion}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Años de conversión aproximados"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargos que ocupo
              </label>
              <input
                type="text"
                name="cargos"
                value={formData.cargos}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="¿Qué cargos ocupo?
                "
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ministerios en los que sirve
              </label>
              <input
                type="text"
                name="ministerios"
                value={formData.ministerios}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. alabanza, escuela dominical, misiones, etc."
              />
            </div>
          </div>
        )}

        {/* PAGE 5: Liderazgo */}
        {currentPage === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Liderazgo</h3>
            
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué áreas te interesaría estudiar? 
              </label>
              <div className="space-y-2 bg-gray-50 p-3 rounded">
                {areasEstudio.map(area => (
                  <label key={area} className="flex items-center">
                    <input
                      type="checkbox"
                      value={area}
                      checked={formData.areasInteres.includes(area)}
                      onChange={(e) => handleCheckboxChange(e, 'areasInteres')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué dones identificó que tiene?
              </label>
              <div className="space-y-2 bg-gray-50 p-3 rounded">
                {dones.map(don => (
                  <label key={don} className="flex items-center">
                    <input
                      type="checkbox"
                      value={don}
                      checked={formData.donesEspirituales.includes(don)}
                      onChange={(e) => handleCheckboxChange(e, 'donesEspirituales')}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{don}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Actualmente ocupa una posición de liderazgo en la iglesia?
              </label>
              <select
                name="liderazgo"
                value={formData.liderazgo}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Le gustaría apoyar en algún cargo en la siguiente gestión? ¿En qué cargo?
              </label>
              <textarea
                name="cargoPosible"
                value={formData.cargoPosible}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe el cargo o funciones que te interesaría desempeñar"
                rows="3"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué es lo que más le gusta de la iglesia Canaán?
              </label>
              <textarea
                name="mejorIglesia"
                value={formData.mejorIglesia}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cuéntanos qué te gusta de nuestra iglesia"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué cosas le parecen que deberían cambiar en la Iglesia Canaán?
              </label>
              <textarea
                name="cambiosIglesia"
                value={formData.cambiosIglesia}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tus sugerencias para mejorar"
                rows="3"
              />
            </div> */}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-2 rounded-lg font-semibold transition"
          >
            Anterior
          </button>
          
          {currentPage < 5 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
            >
              Siguiente
            </button>
          ) : (
<>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2 rounded-lg font-semibold transition"
            >
              {loading ? 'Guardando...' : 'Guardar Miembro'}
            </button>
                        </>
                        
            
          )}

        <button
          onClick={handleSaveAndExit}
          disabled={loading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
        >
          {loading ? 'Guardando...' : 'Guardar y Salir'}
        </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberForm;
