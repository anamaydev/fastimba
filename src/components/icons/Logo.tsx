interface LogoProps {
  className: string;
}

const Logo = ({className}: LogoProps) => {
  return (
    <svg
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fillRule="evenodd"
      clipRule="evenodd"
    >
      <g transform="matrix(2.844444,0,0,2.844444,0,0)">
        <rect x="0" y="0" width="360" height="360" fill="rgb(17,20,28)" />
      </g>
      <g transform="matrix(2.844444,0,0,2.844444,415.288889,14.222222)">
        <path
          d="M2,111L2,47L130,47L130,111L2,111ZM-62,303L-62,111L2,111L2,175L66,175L66,239L2,239L2,303L-62,303Z"
          fill="rgb(128,163,255)"
        />
      </g>
    </svg>
  );
};

export default Logo;
