import {ReactNode} from "react";
import {clsx} from "clsx";
import {useFeatureContext} from "@/context/feature/useFeatureContext.ts";
import FeatureProvider from "@/context/feature/FeatureProvider.tsx";
import {Warning, Uncheck} from "@/components/icons";

interface FeatureProps {children: ReactNode, className?: string}
interface FeatureVisualProps {children: ReactNode, className?: string}
interface FeatureBadgeProps {children: ReactNode, className?: string}
interface FeatureContextProps {children: ReactNode, className?: string}
interface FeatureContextTitleProps {children: string}
interface FeatureContextDescriptionProps {children: ReactNode}
interface FeatureContextToggleProps {children: ReactNode}

const Feature = ({children, className}: FeatureProps) => {
  return (
    <FeatureProvider>
      <div className={clsx(
        "group p-1 rounded-lg flex justify-between has-[.expanded]:gap-1.5 has-[.expanded]:items-stretch has-not-[.expanded]:items-center cursor-pointer hover:bg-iris-400/20",
        className
      )}>
        {children}
      </div>
    </FeatureProvider>
  )
};
export default Feature;

const FeatureVisual = ({children, className}: FeatureVisualProps) => {
  const {isExpanded} = useFeatureContext();
  return (
    <div className={clsx(
      "min-w-14 max-w-37 p-1 flex-col justify-between items-center gap-1.5 shrink-0 font-medium rounded-md text-light bg-iris-400/10 group-hover:bg-obsidian-400 ",
      isExpanded ? "flex h-full" : "hidden h-0",
      className
    )}>
      {children}
    </div>
  )
};

const FeatureContext = ({children, className}: FeatureContextProps) => {
  const {isExpanded} = useFeatureContext();
  return (
    <div className={clsx(
      "relative w-full flex items-center",
      isExpanded ?
        "expanded p-1 h-auto flex-col justify-center gap-4" :
        "h-8 justify-start gap-1.5",
      className,
    )}>
      {children}
    </div>
  )
};

const FeatureContextTitle = ({children}: FeatureContextTitleProps) => {
  const {isExpanded} = useFeatureContext();
  return(
    <p className={clsx(
      "font-bold group-hover:text-sapphire-300 text-bright",
      isExpanded && "text-sapphire-300"
    )}>
      <strong>{children}</strong>
    </p>
  )
};

const FeatureContextDescription = ({children}: FeatureContextDescriptionProps) => {
  const {isExpanded} = useFeatureContext();
  if(isExpanded) return <>{children}</>
  else return null;
}

const FeatureContextToggle = ({children}: FeatureContextToggleProps) => {
  const {isExpanded, setIsExpanded} = useFeatureContext();
  return (
    <div className={clsx(
      "size-4 flex items-center justify-center shrink-0",
      isExpanded ? "absolute top-1 right-1" : "relative",
    )}>
      {/* Visible by default, fades out on hover or when expanded */}
      <span className={clsx(
        "absolute transition-all duration-200",
        isExpanded
          ? "opacity-0 scale-75 pointer-events-none"
          : "opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75 group-hover:pointer-events-none"
      )}>
        {children}
      </span>

      {/* Hidden by default, fades in on hover, stays visible when expanded */}
      <button
        className={clsx(
          "absolute cursor-pointer transition-all duration-200",
          isExpanded
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
        )}
        onClick={() => setIsExpanded(prevState => !prevState)}
      >
        <div className="relative size-4">
          {/* Warning: shown when button appears (not expanded) */}
          <Warning className={clsx(
            "size-4 absolute inset-0 transition-all duration-200",
            isExpanded ? "opacity-0 scale-75" : "opacity-100 scale-100"
          )} />
          {/* Uncheck: shown only when expanded */}
          <Uncheck className={clsx(
            "size-4 absolute inset-0 transition-all duration-200",
            isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )} />
        </div>
      </button>
    </div>
  )
};

const FeatureBadge = ({children, className}: FeatureBadgeProps) => (
  <div className={clsx(
    "w-full flex h-6 items-center justify-center p-0.5 rounded-sm bg-obsidian-400/80 group-hover:bg-iris-400/10",
    className
  )}>
      <span className="text-2xs font-bold whitespace-nowrap leading-none text-bright">
          {children}
      </span>
  </div>
);

Feature.Visual = FeatureVisual;
Feature.Context = FeatureContext;
Feature.Badge = FeatureBadge;

FeatureContext.Title = FeatureContextTitle;
FeatureContext.Description = FeatureContextDescription;
FeatureContext.Toggle = FeatureContextToggle;
