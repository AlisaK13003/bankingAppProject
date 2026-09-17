export function SearchField({ value = "Search transactions", readOnly = true }) {
  return (
    <label className="search-field">
      <span className="search-icon" aria-hidden="true" />
      <input aria-label="Search" readOnly={readOnly} value={value} />
    </label>
  );
}
