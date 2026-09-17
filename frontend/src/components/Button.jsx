export function Button({ children, variant = "primary", ...props }) {
  return (
    <button className={`button button-${variant}`} type="button" {...props}>
      {children}
    </button>
  );
}
