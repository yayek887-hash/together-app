export default function PrimaryButton({
  children,
  onClick,
  variant = "primary",
  icon: Icon,
  disabled = false,
  type = "button",
}) {
  const variantClass =
    variant === "outline" ? "btn-outline" : variant === "error" ? "btn-error" : "btn-primary";

  return (
    <button type={type} className={`btn ${variantClass}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}
