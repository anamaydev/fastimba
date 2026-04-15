import {clsx} from "clsx";

interface UncheckProps {
  className?: string;
}

const Uncheck = ({className}: UncheckProps) => (
  <svg
    className={clsx("transition-all ease-in", className)}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="currentColor" d="M11.5303 3.52929c.2596-.25907.6808-.25909.9404 0 .2595.25972.2596.68178 0 .94141L8.94043 8l3.52927 3.5293c.2595.2597.2597.6808 0 .9404-.2596.2596-.6807.2595-.9404 0L8 8.94043 4.4707 12.4707c-.25962.2596-.68169.2595-.9414 0-.25909-.2596-.25908-.6808 0-.9404L7.05957 8 3.5293 4.4707c-.25926-.25973-.25956-.68185 0-.94141.25955-.25955.68167-.25926.9414 0L8 7.05957z"/>
  </svg>
);
export default Uncheck;