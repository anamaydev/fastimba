import {clsx} from "clsx";
import {usePreferencesContext} from "@/context/preferences/usePreferencesContext.ts";
import {useFeatureContext} from "@/context/feature/useFeatureContext.ts";
import {Check, Uncheck} from "@/components/icons";

interface ToggleButtonProps {
  className?: string;
  name: "vim" | "relativeLineNumbers" | "emmet";
}

interface ToggleButtonMarkProps {
  toggleState: boolean;
  mark: "check" | "uncheck" | "thumb";
}

const ToggleButton = ({className, name}: ToggleButtonProps) => {
  const {preferences, handleTogglePreferences} = usePreferencesContext();
  const {isExpanded} = useFeatureContext();

  return (
    <label
      className={clsx(
        "w-6 h-3 p-0.5 rounded-full flex justify-between items-center cursor-pointer",
        isExpanded ? "relative" : "absolute right-0",
        preferences[name] ?  "bg-emerald-400" : "bg-ash-50/20",
        className
      )}
    >
      <input
        type="checkbox"
        name={name}
        checked={preferences[name]}
        onChange={handleTogglePreferences}
        className="sr-only"
      />

      <ToggleButton.Mark mark="check" toggleState={preferences[name]} />
      <ToggleButton.Mark mark="uncheck" toggleState={preferences[name]} />
      <ToggleButton.Mark mark="thumb" toggleState={preferences[name]} />
    </label>
  )
};
export default ToggleButton;

const ToggleButtonMark = ({toggleState, mark}: ToggleButtonMarkProps) => {
  if (mark === "thumb")
    return (
      <span className={clsx(
        "absolute z-10 size-2 rounded-full bg-black opacity-70 transition-all duration-300 ease-in",
        toggleState ? "translate-x-3" : "translate-x-0"
      )}/>
    );
  if (mark === "uncheck")
    return (
      <Uncheck className={toggleState ? "text-black size-2 delay-200 opacity-0" : "text-black size-2 opacity-70"} />
    );
  return (
    <Check className={toggleState ? "text-black size-2 opacity-70" : "text-black size-2 delay-200 opacity-0"} />
  );
};

ToggleButton.Mark = ToggleButtonMark;