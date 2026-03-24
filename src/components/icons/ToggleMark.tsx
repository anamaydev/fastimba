interface ToggleProps {
  toggleState: boolean;
  mark?: "check" | "uncheck" | "thumb",
}

const ToggleMark = ({toggleState, mark}: ToggleProps) => {
  if(mark && mark === "thumb")
    return (
      <span className={`absolute z-10 size-2 rounded-full bg-black opacity-70 ${toggleState ? "translate-x-3" : "translate-x-0"} transition-all duration-300 ease-in`}></span>
    )
  else if(mark === "uncheck")
    return (
      <svg
        className={`size-2 text-black transition-all ease-in ${toggleState ? "delay-200 opacity-0" : "opacity-70"}`}
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="currentColor" d="M11.293 3.29297c.3905-.39052 1.0235-.39052 1.414 0 .3905.39053.3905 1.02356 0 1.41406L9.41406 8l3.29294 3.293c.3905.3905.3905 1.0235 0 1.414s-1.0235.3905-1.414 0L8 9.41406 4.70703 12.707c-.3905.3905-1.02353.3905-1.41406 0-.39052-.3905-.39052-1.0235 0-1.414L6.58594 8 3.29297 4.70703c-.39052-.39052-.39052-1.02354 0-1.41406s1.02354-.39052 1.41406 0L8 6.58594z"/>
      </svg>
    )
  else
    return (
      <svg
        className={`size-2 text-black transition-all ease-in ${toggleState ? "opacity-70" : "delay-200 opacity-0"}`}
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="currentColor" d="M12.293 3.79297c.3905-.3905 1.0235-.39049 1.414 0 .3904.39053.3905 1.02357 0 1.41406L6.70703 12.207c-.39049.3905-1.02353.3904-1.41406 0l-3-2.99997c-.39052-.39052-.39052-1.02354 0-1.41406.39052-.39051 1.02354-.39052 1.41406 0L6 10.0859z"/>
      </svg>
    )
};
export default ToggleMark;
