interface LogoNewProps {
  className: string;
}
const Logo = ({className}: LogoNewProps) => {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path fill="currentColor" d="M4 8h4v4H4v4H0V4h4zm8-4H4V0h8z"/>
    </svg>
  )
};
export default Logo;
