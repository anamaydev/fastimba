import {ReactNode} from "react";
import {clsx} from "clsx";

interface IconButtonProps {
  className?: string;
  label?: string;
  children: ReactNode;
  onClick?: () => void;
}

const IconButton = ({className, children, label, onClick}: IconButtonProps) => {
  return (
    <button onClick={onClick} className={clsx(
      "group flex flex-row-reverse items-center p-0.5 rounded-sm cursor-pointer transition-all duration-300 ease-in text-sapphire-300 hover:text-ash-100 bg-slate-500 hover:bg-slate-400",
      className,
    )}>
      {children}
      <span className="overflow-hidden max-w-0 group-hover:max-w-xs transition-[max-width] duration-00 ease-in">
        <p className="whitespace-nowrap pr-1">{label}</p>
      </span>
    </button>
  )
};
export default IconButton;
