import {Logo} from "@/components/icons/index.ts";

const App = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (message: {type: string}) => {
      if(message.type === "TOGGLE_OVERLAY") {
        console.log("message received: ", message);
        setIsOpen(prevIsOpen => !prevIsOpen);
      }
    }

    browser.runtime.onMessage.addListener(handleMessage);
    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div
      className={
        `${isOpen ? "flex" : "hidden"} 
        w-90 h-auto p-2 rounded-sm 
        fixed z-10000 top-6 right-16 
        flex-col gap-0 
        container-shadow container-backdrop 
        bg-obsidian-400 text-ash-100`
      }
    >
      {/* header */}
      <div className="flex justify-start items-center gap-2 ">
        <Logo className="size-4"/>
        <span className="text-sm">Fastimba</span>
      </div>
      <h2 className="text-3xl">Hello World</h2>
    </div>
  )
}
export default App;
