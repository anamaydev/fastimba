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

  useEffect(() => {
    /* observe scrim-view element for changes in class */
    const modeEditObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        /* ignore non class attribute mutations */
        if(mutation.attributeName !== "class") return;

        /* parse previous and current class lists into sets */
        const oldClassNames = new Set(mutation.oldValue?.split(" ") || []);
        const newClassNames = new Set((mutation.target as Element).className.split(" "));

        /* determine which classes were added */
        const addedClassNames = [...newClassNames].filter((className) => !oldClassNames.has(className));

        /* look for only mode-edit and mode-view classes */
        const editorMode = addedClassNames.filter((className) => className === "mode-edit" || className === "mode-view")[0];

        if (editorMode === "mode-edit")
          console.log("edit mode activated.");
        else if(editorMode === "mode-view")
          console.log("view mode activated.");
        else
          console.log("irrelevant class detected.");
      })
    })

    /* wait until scrim-view element mounts, then disconnect */
    const scrimViewMountObserver = new MutationObserver(() => {
      const scrimViewEl = document.querySelector("scrim-view");

      if(!scrimViewEl) return;
      /* disconnect scrimViewMountObserver and start observing class changes in scrim-view element */
      scrimViewMountObserver.disconnect();
      modeEditObserver.observe(scrimViewEl, {attributes: true, attributeFilter: ["class"], attributeOldValue: true});
    });

    /* wait until op-layers element mounts, then disconnect */
    const opLayersMountObserver = new MutationObserver(() => {
      const opLayersEl = document.querySelector("op-layers");

      if(!opLayersEl) return;
      /* disconnect opLayerMountObserver and start observing for scrim-view element */
      opLayersMountObserver.disconnect();
      scrimViewMountObserver.observe(document.body, {childList: true, subtree: true});
    });

    /* start observing DOM for op-layers element */
    opLayersMountObserver.observe(document.body, {childList: true, subtree: true});

    /* clean-up all the mutation observers */
    return () => {
      opLayersMountObserver.disconnect();
      scrimViewMountObserver.disconnect();
      modeEditObserver.disconnect();
    };
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
