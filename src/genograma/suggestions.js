import { norm } from './names';

const lab = (sexo, m, f) => (sexo === 'F' ? f : m);
const digits = (s) => String(s ?? '').replace(/\D/g, '');
const adult = (p) => p.edad == null || p.edad >= 18;
const married = (p) => ` ${norm(p.nombre)} `.includes(' de ');   // "María Cruz de Vega"

/** "c es ___ de p" */
export function guessRelation(p, c) {
  const diff = p.edad != null && c.edad != null ? c.edad - p.edad : null;
  if (diff != null) {
    if (diff <= -51) return lab(c.sexo, 'Abuelo', 'Abuela');
    if (diff <= -16) return lab(c.sexo, 'Padre', 'Madre');
    if (diff >= 51) return lab(c.sexo, 'Nieto', 'Nieta');
    if (diff >= 16) return lab(c.sexo, 'Hijo', 'Hija');
  }
  const opposite = ['M', 'F'].includes(p.sexo) && ['M', 'F'].includes(c.sexo) && p.sexo !== c.sexo;
  if (opposite && adult(p) && adult(c) && (married(p) || married(c))) return lab(c.sexo, 'Esposo', 'Esposa');
  return lab(c.sexo, 'Hermano', 'Hermana');
}

/** Devuelve suggest(person, { limit, min }) → [{ person, relacion, score, reasons }] */
export function makeSuggester(people) {
  const freq = new Map();
  people.forEach((p) => new Set(p.surnames).forEach((t) => freq.set(t, (freq.get(t) || 0) + 1)));
  const weight = (t) => ((freq.get(t) || 0) > 30 ? 0.5 : 1);     // apellido muy común = menos señal

  return (person, { limit = 5, min = 0.35 } = {}) => {
    const mine = person.surnames || [];
    const linked = new Set((person.connections || []).map((c) => c.target));
    const phone = digits(person.celular);
    const out = [];

    people.forEach((c) => {
      if (c.id === person.id || linked.has(c.id)) return;
      if (!person.realId && !c.realId) return;                   // al menos uno debe ser miembro

      const shared = mine.filter((t) => (c.surnames || []).includes(t));
      const reasons = [];
      let score = 0;

      if (shared.length) {
        score += Math.min(0.8, shared.reduce((s, t) => s + 0.4 * weight(t), 0));
        reasons.push(`Apellido ${shared.join(' ')}`);
      }
      if (phone.length >= 7 && phone === digits(c.celular)) { score += 0.5; reasons.push('Mismo celular'); }
      if (!score) return;
      if (shared.length && person.zona && person.zona === c.zona) { score += 0.1; reasons.push('Misma zona'); }
      if (score < min) return;

      out.push({ person: c, relacion: guessRelation(person, c), score: +score.toFixed(2), reasons });
    });

    return out.sort((a, b) => b.score - a.score || a.person.nombre.localeCompare(b.person.nombre, 'es')).slice(0, limit);
  };
}