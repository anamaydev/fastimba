interface ToggleProps {
  state: "on" | "off";
  className: string;
}

const Toggle = ({state, className}: ToggleProps) => {
  return (
    <svg viewBox="0 0 256 256" className={className}>
      {state === "on" ? (
        <polyline points="40 144 96 200 224 72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
      ) : (
        <>
          <line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
          <line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
        </>
      )}
    </svg>
  );
};
export default Toggle;
