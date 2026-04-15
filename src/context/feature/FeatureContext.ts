import {createContext} from 'react';
import type {Dispatch, SetStateAction} from "react";

interface FeatureContextProps {
  isExpanded: boolean;
  setIsExpanded:  Dispatch<SetStateAction<boolean>>
}

export const FeatureContext = createContext<FeatureContextProps | undefined>(undefined);
