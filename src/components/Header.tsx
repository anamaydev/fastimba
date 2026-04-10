import {Logo} from "@/components/icons";

const Header = () => {
  return (
    <div className="w-full flex items-center gap-1">
      {/* fastimba logo */}
      <div className="size-8 flex justify-center items-center shrink-0 rounded-full glass-card bg-surface-card">
        <Logo className="text-primary" />
      </div>

      <div className="w-full h-8 pl-6 text-xs flex justify-start items-center font-bold rounded-(--radius-card) glass-card bg-surface-card">Fastimba</div>

      {/* close icon */}
      <div className="size-8 flex justify-center items-center shrink-0 rounded-full glass-card bg-surface-card">
        <Logo className="text-primary" />
      </div>
    </div>
  )
};
export default Header;
