import {clsx} from "clsx";

interface CheckProps {
  className?: string;
}

const Check = ({className}: CheckProps) => (
  <svg
    className={clsx("transition-all ease-in", className)}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="currentColor" d="M12.293 3.79297c.3905-.3905 1.0235-.39049 1.414 0 .3904.39053.3905 1.02357 0 1.41406L6.70703 12.207c-.39049.3905-1.02353.3904-1.41406 0l-3-2.99997c-.39052-.39052-.39052-1.02354 0-1.41406.39052-.39051 1.02354-.39052 1.41406 0L6 10.0859z"/>
  </svg>
);
export default Check;