import {ToggleMark} from "@/components/icons/index";

interface SliderProps {
  toggleState: boolean;
}

const Slider = ({toggleState}: SliderProps) => {
  return (
    <span
      className={`
        relative w-6 h-3 p-0.5 rounded-full flex justify-between items-center 
        ${toggleState ? "bg-emerald-400" : "bg-ash-50/20"}
      `}
    >
      <ToggleMark mark="check" toggleState={toggleState}/>
      <ToggleMark mark="uncheck" toggleState={toggleState}/>
      <ToggleMark mark="thumb" toggleState={toggleState}/>
    </span>
  )
}
export default Slider;
