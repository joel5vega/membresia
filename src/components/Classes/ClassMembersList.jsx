export const ClassMembersList = ({ members, loading, error }) => {
  if (loading) return <div className="loading">Cargando miembros...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="members-list">
      <h3>Miembros de la Clase</h3>
      {members.length === 0 ? (
        <p>No hay miembros en esta clase</p>
      ) : (
        <table className="members-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Clase</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.nombre} {member.apellido}</td>
                <td>{member.clase}</td>
                <td>
                  <button className="btn-small">Ver Detalles</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
