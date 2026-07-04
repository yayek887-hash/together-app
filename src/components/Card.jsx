export default function Card({ children, style = {}, onClick, className = "" }) {
  return (
    <div className={`card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
