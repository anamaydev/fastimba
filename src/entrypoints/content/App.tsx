import type {ChangeEvent} from "react";
import {Logo} from "@/components/icons/index";
import Toggle from "@/components/Toggle";

interface UserPreferenceType {
  vim: boolean;
  relativeLineNumbers: boolean;
  emmet: boolean;
}

interface PostToMonacoBridge {
  type: "FEATURE_SETTINGS_UPDATE",
  payload: UserPreferenceType
}

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrimbaTitle, setScrimbaTitle] = useState<string | null>(null)
  const [scrimbaThumbnail, setScrimbaThumbnail] = useState<string | null>(null)
  const [_editorMode, setEditorMode] = useState<"edit" | "view">("view");
  const [userPreference, setUserPreference] = useState<UserPreferenceType>(() => {
    const savedUserPreference = localStorage.getItem("userPreference");
    return savedUserPreference ?
      JSON.parse(savedUserPreference) :
      {
        vim: false,
        relativeLineNumbers: false,
        emmet: false,
      };
  })

  /* handle settings change */
  const handleToggleSettingsData = (event: ChangeEvent<HTMLInputElement>) => {
    const {name, checked} = event.target
    setUserPreference(prevToggleSettingsData => ({
      ...prevToggleSettingsData,
      [name]: checked,
    }))
  }

  /* handle posting message to monaco bridge script */
  const postToMonacoBridge = (message: PostToMonacoBridge) => {
    window.postMessage({
      source: "fastimba",
      ...message
    }, "*");
  };

  /* sync feature settings data changes to localStorage and post message to monaco bridge */
  useEffect(() => {
    localStorage.setItem("userPreference", JSON.stringify(userPreference));
    postToMonacoBridge({type: "FEATURE_SETTINGS_UPDATE", payload: userPreference});
  }, [userPreference]);

  /* --- handle received message from a service worker --- */
  useEffect(() => {
    const handleMessage = (message: {type: string}) => {
      if(message.type === "TOGGLE_OVERLAY")
        setIsOpen(prevIsOpen => !prevIsOpen);
    };

    browser.runtime.onMessage.addListener(handleMessage);
    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, []);

  /* --- handle received message from the bridge script --- */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if(event.source !== window) return;             /* exit if the message is not from the same window */
      if (event.data.source !== "fastimba") return;   /* exit if the messages is not from fastimba extension */

      /* handle editor mode updates */
      if (event.data.type === "EDITOR_ACTIVE_MODE_UPDATE") setEditorMode(event.data.payload);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
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
          toggleState={userPreference.vim}
          onChange={handleToggleSettingsData}
        />
        <Toggle
          label="Relative Line Numbers"
          name="relativeLineNumbers"
          toggleState={userPreference.relativeLineNumbers}
          onChange={handleToggleSettingsData}
        />
        <Toggle
          label="Emmet"
          name="emmet"
          toggleState={userPreference.emmet}
          onChange={handleToggleSettingsData}
        />
      </div>
    </div>
  )
}
export default App;
