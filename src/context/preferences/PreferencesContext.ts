import {ChangeEvent, createContext} from "react";
import type {Dispatch, SetStateAction} from "react";

export interface PreferencesTypes {
  vim: boolean,
  relativeLineNumbers: boolean,
  emmet: boolean,
}

interface PreferencesContextProps {
  isOpen: boolean;
  preferences: PreferencesTypes;
  setPreferences:  Dispatch<SetStateAction<PreferencesTypes>>;
  handleTogglePreferences: (event: ChangeEvent<HTMLInputElement>) => void
}

export const PreferencesContext = createContext<PreferencesContextProps | undefined>(undefined);