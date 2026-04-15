import {ReactNode} from "react";
import {FeatureContext} from "@/context/feature/FeatureContext.ts";

interface FeatureProviderProps {
  children: ReactNode;
}

const FeatureProvider = ({children}:FeatureProviderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <FeatureContext.Provider value={{isExpanded, setIsExpanded}}>
      {children}
    </FeatureContext.Provider>
  )
};
export default FeatureProvider;
