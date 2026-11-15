// genograma/model.js

// ── Sexo ──
export const SEX = { MALE: 'M', FEMALE: 'F', UNKNOWN: '?' };

// ── Relaciones con el miembro raíz ──
export const RELACION = {
  // Generación +1 (arriba)
  PADRE: 'padre',
  MADRE: 'madre',
  ABUELO: 'abuelo',
  ABUELA: 'abuela',
  TIO: 'tio',
  TIA: 'tia',

  // Generación 0 (misma)
  HERMANO: 'hermano',
  HERMANA: 'hermana',
  PRIMO: 'primo',
  PRIMA: 'prima',
  PAREJA: 'pareja',

  // Generación -1 (abajo)
  HIJO: 'hijo',
  HIJA: 'hija',
  SOBRINO: 'sobrino',
  SOBRINA: 'sobrina',
  NIETO: 'nieto',
  NIETA: 'nieta',
AMIGO: 'amigo',
  AMIGA: 'amiga',
  // Otros
  OTRO: 'otro',
};

// ── Estado civil / vínculo ──
export const ESTADO_RELACION = {
  CASADO: 'casado',
  UNION_LIBRE: 'union-libre',
  DIVORCIADO: 'divorciado',
  SEPARADO: 'separado',
  VIUDO: 'viudo',
  NINGUNO: null,
};

// ── Generación (para layout jerárquico) ──
// 2 = abuelos, 1 = padres/tíos, 0 = miembro/hermanos/primos, -1 = hijos/sobrinos, -2 = nietos
export const GENERACION = {
  ABUELOS: 2,
  PADRES: 1,
  MIEMBRO: 0,
  HIJOS: -1,
  NIETOS: -2,
};

// ── Mapa relación → generación (con respecto al miembro raíz) ──
export const GENERACION_POR_RELACION = {
  [RELACION.ABUELO]: GENERACION.ABUELOS,
  [RELACION.ABUELA]: GENERACION.ABUELOS,

  [RELACION.PADRE]: GENERACION.PADRES,
  [RELACION.MADRE]: GENERACION.PADRES,
  [RELACION.TIO]: GENERACION.PADRES,
  [RELACION.TIA]: GENERACION.PADRES,

  [RELACION.HERMANO]: GENERACION.MIEMBRO,
  [RELACION.HERMANA]: GENERACION.MIEMBRO,
  [RELACION.PRIMO]: GENERACION.MIEMBRO,
  [RELACION.PRIMA]: GENERACION.MIEMBRO,
  [RELACION.PAREJA]: GENERACION.MIEMBRO,

  [RELACION.HIJO]: GENERACION.HIJOS,
  [RELACION.HIJA]: GENERACION.HIJOS,
  [RELACION.SOBRINO]: GENERACION.HIJOS,
  [RELACION.SOBRINA]: GENERACION.HIJOS,

  [RELACION.NIETO]: GENERACION.NIETOS,
  [RELACION.NIETA]: GENERACION.NIETOS,
    [RELACION.AMIGO]: GENERACION.MIEMBRO,
  [RELACION.AMIGA]: GENERACION.MIEMBRO,
};

// ── Mapa relación → tipo de arista ──
// 'descendencia' (padre→hijo), 'pareja' (matrimonio), 'hermandad' (hermanos)
export const TIPO_ARISTA_POR_RELACION = {
  [RELACION.PADRE]: 'descendencia',
  [RELACION.MADRE]: 'descendencia',
  [RELACION.HIJO]: 'descendencia',
  [RELACION.HIJA]: 'descendencia',

  [RELACION.PAREJA]: 'pareja',

  [RELACION.HERMANO]: 'hermandad',
  [RELACION.HERMANA]: 'hermandad',
};

// ── Símbolos visuales (estilo genograma clínico) ──
export const SIMBOLO = {
  MALE: 'square',      // hombre = cuadrado
  FEMALE: 'circle',    // mujer = círculo
  UNKNOWN: 'diamond',  // desconocido = rombo
  DECEASED: 'slash',   // fallecido = tachado con X
};

export const COLORES_RELACION = {
  familia: '#A63232',       // rojo iglesia
  pareja: '#E68A3E',        // naranja
  hermandad: '#3b82f6',     // azul
  desconocido: '#6b7280',   // gris
};