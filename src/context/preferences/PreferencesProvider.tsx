import {type ChangeEvent, useState} from "react";
import type {ReactNode} from "react";
import {PreferencesContext} from "./PreferencesContext";
import type {PreferencesTypes} from "./PreferencesContext";

interface PreferencesProviderProps {
  children: ReactNode;
}

interface PostToMonacoBridge {
  type: "FEATURE_SETTINGS_UPDATE",
  payload: PreferencesTypes
}

/*
* Defaults for any key missing from stored preferences. Preferences saved by an
* earlier version (e.g. before pomodoroDurations existed) would otherwise leave
* that key undefined and crash the Pomodoro component on first render.
* */
const DEFAULT_PREFERENCES: PreferencesTypes = {
  vim: false,
  relativeLineNumbers: false,
  emmet: false,
  pomodoroDurations: {
    session: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  },
};

const PreferencesProvider = ({children}: PreferencesProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesTypes>(()  => {
    const savedPreferences = localStorage.getItem("userPreference");
    if (!savedPreferences) return DEFAULT_PREFERENCES;

    /*
    * Merge over defaults so preferences persisted by an older schema still get
    * every field, including nested pomodoroDurations.
    * */
    const parsed = JSON.parse(savedPreferences) as Partial<PreferencesTypes>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      pomodoroDurations: {
        ...DEFAULT_PREFERENCES.pomodoroDurations,
        ...parsed.pomodoroDurations,
      },
    };
  });

  /* handle settings change */
  const handleTogglePreferences = (event: ChangeEvent<HTMLInputElement>) => {
    const {name, checked} = event.target
    setPreferences(prevPreferencesState => ({
      ...prevPreferencesState,
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
    localStorage.setItem("userPreference", JSON.stringify(preferences));
    postToMonacoBridge({type: "FEATURE_SETTINGS_UPDATE", payload: preferences});
  }, [preferences]);

  /* --- handle toggle event bridged from the content script's top-level listener --- */
  useEffect(() => {
    const handleToggle = () => setIsOpen(prevIsOpen => !prevIsOpen);
    window.addEventListener("fastimba:toggle-overlay", handleToggle);
    return () => window.removeEventListener("fastimba:toggle-overlay", handleToggle);
  }, []);

  return (
    <PreferencesContext.Provider value={{isOpen, preferences, setPreferences, handleTogglePreferences}}>
      {children}
    </PreferencesContext.Provider>
  )
};
export default PreferencesProvider;
