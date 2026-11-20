import React from 'react';
import { X, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { norm } from '../../genograma/relationUtils';
import { STATUS_LABEL } from '../../genograma/statuses';
import StatusActions from './StatusActions';
import RelationsSection from './RelationsSection';
import DetailsSection from './DetailsSection';
import ConvertToMember from './ConvertToMember';
import ExternalActions from './ExternalActions';
import { isAvanzada } from '../../genograma/churches';

/**
 * person:  { key, nombre, realId, sexo, esMiembro }
 * ctl:     retorno de useConstellation()
 * context: { ownerId, ownerName, key } cuando se abre desde el genograma de un miembro
 * onKeyChange(newKey): se llama al renombrar o convertir (la persona cambia de clave)
 */
export default function PersonSheet({ person, people, ctl, context, onClose, onKeyChange }) {
  const navigate = useNavigate();
  const status = ctl.status[person.key];
  const isHidden = ctl.hidden.includes(person.key);
  const showDetails = context && person.key !== context.key;

  return (
    <div className="mt-sheet" role="dialog" aria-label={person.nombre}>
      <div className="mt-sheet__grip" />

      <header className="mt-sheet__head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="mt-sheet__title">{person.nombre}</h3>
          <small className="mt-muted">
            {person.esMiembro ? (isAvanzada(person) ? 'Avanzada · otra iglesia' : 'Miembro registrado') : 'Familiar externo'}
            {status && status !== 'activo' ? ` · ${STATUS_LABEL[status]}` : ''}
          </small>
        </div>
        {person.esMiembro && person.realId && (
          <button className="mt-btn mt-btn--ghost" onClick={() => navigate(`/members/${person.realId}/genograma`)}>
            <Network size={16} /> Genograma
          </button>
        )}
        <button className="mt-btn mt-btn--icon" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
      </header>

      <StatusActions value={status} onChange={(v) => ctl.setStatus(person.key, v)} />

      <RelationsSection
        person={person}
        members={ctl.members}
        people={people}
        onSetRelation={ctl.setRelation}
        onRemoveRelation={ctl.removeRelation}
      />

      {showDetails && (
        <DetailsSection
          key={person.key}
          ownerId={context.ownerId}
          ownerName={context.ownerName}
          person={person}
          members={ctl.members}
          onSave={ctl.updateEntry}
        />
      )}

      {!person.esMiembro && (
        <>
          <ConvertToMember
            person={person}
            onConvert={async (data) => {
              const full = await ctl.convertToMember(person, data);
              onKeyChange?.(norm(full));
            }}
          />
          <ExternalActions
            person={person}
            people={people}
            isHidden={isHidden}
            onRename={async (from, to) => { await ctl.renamePerson(from, to); onKeyChange?.(norm(to)); }}
            onDelete={async (name) => { await ctl.deletePerson(name); onClose(); }}
            onToggleHide={(key, hide) => { ctl.toggleHidden(key, hide); if (hide) onClose(); }}
          />
        </>
      )}
    </div>
  );
}