import type {ReactNode} from "react";
import {usePreferencesContext} from "@/context/preferences/usePreferencesContext.ts";

interface ToggleButtonProps {
  children?: ReactNode;
  className?: string;
  name: "vim" | "relativeLineNumbers" | "emmet";
  leftOption?: string;
  rightOption?: string;
}


const ToggleButton = ({className, name, leftOption="Off", rightOption="On"}: ToggleButtonProps) => {
  const {preferences, handleTogglePreferences} = usePreferencesContext();

  return (
    <label className={`relative w-full h-6 p-0.5 flex justify-between items-center rounded-toggle-track font-bold bg-surface-light-overlay cursor-pointer ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={preferences[name]}
        onChange={handleTogglePreferences}
        className="sr-only"
      />

      <span className={`relative z-20 text-center flex-1 ${preferences[name] ? "text-secondary" : "text-primary"}`}>{leftOption}</span>
      <span className={`relative z-20 text-center flex-1 ${preferences[name] ? "text-primary" : "text-secondary"}`}>{rightOption}</span>
      <span className={`absolute z-10 w-[calc(50%-2px)] h-[calc(100%-4px)] left-0.5 top-0.5 rounded-toggle-thumb bg-surface-deep transition-all duration-300 ease-in-out ${preferences[name] ? "left-1/2" : "left-0.5"}`}></span>
    </label>
  )
};
export default ToggleButton;