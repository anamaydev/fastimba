import {Logo} from "@/components/icons";

const Header = () => {
  return (
    <div className="flex justify-start items-center gap-2">
      <Logo className="size-4"/>
      <span className="text-sm">Fastimba</span>
    </div>
  )
};
export default Header;
