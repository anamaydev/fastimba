import {Logo} from "@/components/icons/index";
import Toggle from "@/components/Toggle";
import type {ChangeEvent} from "react";

interface ToggleSettingsDataType {
  vim: boolean;
  relativeLineNumbers: boolean;
  emmet: boolean;
}

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrimbaTitle, setScrimbaTitle] = useState<string | null>(null)
  const [scrimbaThumbnail, setScrimbaThumbnail] = useState<string | null>(null)
  const [toggleSettingsData, setToggleSettingsData] = useState<ToggleSettingsDataType>({
    vim: false,
    relativeLineNumbers: false,
    emmet: false,
  })

  /* handle settings change */
  const handleToggleSettingsData = (event: ChangeEvent<HTMLInputElement>) => {
    const {name, checked} = event.target
    setToggleSettingsData(prevToggleSettingsData => ({
      ...prevToggleSettingsData,
      [name]: checked,
    }))
  }

  /* receive message from a service worker */
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

  /* get and assign Scrimba title and thumbnail */
  useEffect(() => {
    const ogTitle: HTMLMetaElement | null = document.querySelector("meta[property='og:title']");
    const ogImage: HTMLMetaElement | null = document.querySelector("meta[property='og:image']");

    if(ogTitle) setScrimbaTitle(ogTitle.content);
    if(ogImage) setScrimbaThumbnail(ogImage.content);
  }, []);

  return (
    <div
      className={
        `${isOpen ? "flex" : "hidden"} w-90 h-auto p-2 rounded-sm fixed z-10000 top-6 right-16 flex-col gap-1 container-shadow backdrop-blur-sm bg-obsidian-400/80 text-ash-100`
      }
    >
      {/* header */}
      <div className="flex justify-start items-center gap-2">
        <Logo className="size-4"/>
        <span>Fastimba</span>
        <span className="h-4 w-px bg-iris-400 rotate-20 opacity-50"></span>
        {scrimbaTitle && <span className="opacity-70">{scrimbaTitle}</span>}
      </div>

      {/* thumbnail */}
      {scrimbaThumbnail && (
        <div className="w-full h-full max-h-45 rounded-sm object-cover overflow-hidden border-[0.5px] border-white/20">
          <img className="w-full h-full" src={scrimbaThumbnail} alt="Scrimba Thumbnail" />
        </div>
      )}

      <hr className="h-[0.5px] my-1 rounded-full text-white/10" />

      {/* settings */}
      <div className="flex flex-col gap-0">
        <Toggle
          label="Vim"
          name="vim"
          toggleState={toggleSettingsData.vim}
          onChange={handleToggleSettingsData}
        />
        <Toggle
          label="Relative Line Numbers"
          name="relativeLineNumbers"
          toggleState={toggleSettingsData.relativeLineNumbers}
          onChange={handleToggleSettingsData}
        />
        <Toggle
          label="Emmet"
          name="emmet"
          toggleState={toggleSettingsData.emmet}
          onChange={handleToggleSettingsData}
        />
      </div>
    </div>
  )
}
export default App;
