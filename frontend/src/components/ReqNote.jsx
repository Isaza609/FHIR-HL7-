/**
 * Nota que vincula la pantalla con los requerimientos del documento de contexto (Doc. contexto §3).
 * Solo para modo presentación/demo con datos estáticos.
 */
export default function ReqNote({ num, children }) {
  return (
    <p className="req-note" aria-label={`Requerimiento ${num}`}>
      <span className="req-note-badge">Req. {num}</span> {children}
    </p>
  );
}
