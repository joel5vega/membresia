import React, { useMemo, useState } from 'react';
import { makeSuggester } from '../../genograma/suggestions';
import SuggestionRow from './SuggestionRow';

export default function SuggestionsList({ person, people, onSetRelation }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const suggest = useMemo(() => makeSuggester(people), [people]);
  const me = useMemo(() => people.find((p) => p.id === person.key), [people, person.key]);
  const list = useMemo(() => (me?.surnames ? suggest(me) : []), [suggest, me]);

  if (!list.length) return null;

  const link = async (c, rel) => {
    setBusy(true); setError('');
    try { await onSetRelation(person, { key: c.id, nombre: c.nombre, realId: c.realId }, rel); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <>
      <h4>Posibles familiares</h4>
      {list.map((s) => <SuggestionRow key={s.person.id} s={s} busy={busy} onLink={link} />)}
      {error && <p className="mt-error">{error}</p>}
    </>
  );
}