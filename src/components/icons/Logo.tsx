interface LogoNewProps {
  className: string;
}
const Logo = ({className}: LogoNewProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="currentColor" d="M10 12h4v4h-4v4H6V8h4zm8-4h-8V4h8z"/>
    </svg>
  )
};
export default Logo;
