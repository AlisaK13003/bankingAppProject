export function TextField({ label, value, onChange, error, type = "text", placeholder, readOnly = false }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className={`field-control ${error ? "field-control-error" : ""}`}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {error ? <span className="field-help">{error}</span> : null}
    </label>
  );
}
