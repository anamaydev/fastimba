import type {ChangeEventHandler} from "react";
import {Terminal, RelativeLines, Emmet} from "@/components/icons";

interface ToggleProps {
  label: string;
  name: string;
  toggleState: boolean;
  onChange:  ChangeEventHandler<HTMLInputElement, HTMLInputElement>;
}

const Toggle = ({label, name, toggleState, onChange}: ToggleProps) => {
  return (
    /* icon and label */
    <label className="p-1.5 rounded-md flex justify-between items-center cursor-pointer hover:bg-iris-400/20">
      <span className="flex justify-center items-center gap-2">
        {name === "vim" && <Terminal className="size-4 text-sapphire-300"/>}
        {name==="relativeLineNumbers" && <RelativeLines className="size-4 text-sapphire-300"/>}
        {name === "emmet" && <Emmet className="size-4 text-sapphire-300"/>}

        {label}
      </span>

      {/* checkbox button */}
      <input
        type="checkbox"
        name={name}
        checked={toggleState}
        onChange={onChange}
        className="sr-only"
      />

      {/* slider */}
      <Slider toggleState={toggleState}/>
    </label>
  )
}
export default Toggle;
