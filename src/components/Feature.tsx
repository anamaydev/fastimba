import {ComponentPropsWithRef, forwardRef} from "react";
import {clsx} from "clsx";
import {useFeatureContext} from "@/context/feature/useFeatureContext.ts";
import {useFeatureKeyContext} from "@/context/feature/useFeatureKeyContext.ts";
import {Warning, Uncheck} from "@/components/icons";
import FeatureKeyProvider from "@/context/feature/FeatureKeyProvider.tsx";

interface FeatureProps extends ComponentPropsWithRef<"div"> {featureKey: string}
interface FeatureVisualProps extends ComponentPropsWithRef<"div"> {}
interface FeatureBadgeProps extends ComponentPropsWithRef<"div"> {}
interface FeatureHeaderProps extends ComponentPropsWithRef<"div"> {}
interface FeatureContentProps extends ComponentPropsWithRef<"div"> {}
interface FeatureIconProps extends ComponentPropsWithRef<"div"> {}
interface FeatureTitleProps extends ComponentPropsWithRef<"p"> {}
interface FeatureDescriptionProps extends ComponentPropsWithRef<"p"> {}
interface FeatureToggleProps extends ComponentPropsWithRef<"button"> {}

const FeatureRoot = forwardRef<HTMLDivElement, FeatureProps>(
  ({children, className, featureKey, ...rest}, ref) => {
    const {isExpanded} = useFeatureContext();
    return (
      <FeatureKeyProvider featureKey={featureKey}>
        <div
          ref={ref}
          className={clsx(
            "group p-1 rounded-lg flex justify-between cursor-pointer hover:bg-iris-400/20",
            isExpanded(featureKey) ? "gap-1.5 items-stretch" : "items-center",
            className,
          )}
          {...rest}
        >{children}</div>
      </FeatureKeyProvider>
    )
  }
);

const FeatureVisual = forwardRef<HTMLDivElement, FeatureVisualProps>(
  ({children, className, ...rest}, ref) => {
    const {featureKey} = useFeatureKeyContext();
    const {isExpanded} = useFeatureContext();
    return (
      <div
        ref={ref}
        className={clsx(
          "min-w-14 max-w-37 p-1 flex-col justify-between items-center gap-1.5 shrink-0 font-medium rounded-md text-light bg-iris-400/10 group-hover:bg-obsidian-400 ",
          isExpanded(featureKey) ? "flex h-full" : "hidden h-0",
          className
        )}
        {...rest}
      >{children}</div>
    )
  }
);

const FeatureBadge = forwardRef<HTMLDivElement, FeatureBadgeProps>(
  ({children, className, ...rest}, ref) => (
    <div
      ref={ref}
        className={clsx(
        "w-full flex h-6 items-center justify-center p-0.5 rounded-sm bg-obsidian-400/80 group-hover:bg-iris-400/10",
        className
      )}
      {...rest}
    >
        <span className="text-2xs font-bold whitespace-nowrap leading-none text-bright">
            {children}
        </span>
    </div>
  )
);

const FeatureHeader = forwardRef<HTMLDivElement,FeatureHeaderProps>(
  ({children, className, ...rest}, ref) => (
    <div
      ref={ref}
      className={clsx("flex items-center gap-1.5", className)}
      {...rest}
    >
      {children}
    </div>
  )
);

const FeatureContent = forwardRef<HTMLDivElement, FeatureContentProps>(
  ({children, className, ...rest}, ref) => {
    const {featureKey} = useFeatureKeyContext();
    const {isExpanded} = useFeatureContext();
    return (
      <div
        ref={ref}
        className={clsx(
          "relative w-full flex items-center",
          isExpanded(featureKey) ?
            "p-1 h-auto flex-col justify-center gap-4" :
            "h-8 justify-between gap-1.5",
          className,
        )}
        {...rest}
      >{children}</div>
    )
  }
);

const FeatureIcon = forwardRef<HTMLDivElement, FeatureIconProps>(
  ({children, className, ...rest}, ref) => {
    const {featureKey} = useFeatureKeyContext();
    const {isExpanded} = useFeatureContext();
    return (
      <div
        ref={ref}
        className={clsx(
          "size-4 flex items-center justify-center shrink-0",
          !isExpanded(featureKey) && "group-hover:opacity-0 group-hover:scale-75 group-hover:pointer-events-none transition-all duration-200",
          className
        )}
        {...rest}
      >{children}</div>
    )
  }
);

const FeatureTitle = forwardRef<HTMLParagraphElement, FeatureTitleProps>(
  ({children, ...rest}, ref) => {
    const {featureKey} = useFeatureKeyContext();
    const {isExpanded} = useFeatureContext();
    return(
      <p
        ref={ref}
          className={clsx(
          "font-bold group-hover:text-sapphire-300 text-bright",
          isExpanded(featureKey) && "text-sapphire-300"
        )}
        {...rest}
      >
        <strong>{children}</strong>
      </p>
    )
  }
);

const FeatureDescription = forwardRef<HTMLParagraphElement, FeatureDescriptionProps>(({children, className, ...rest}, ref ) => {
  const {featureKey} = useFeatureKeyContext();
  const {isExpanded} = useFeatureContext();
  if(isExpanded(featureKey)) return <p ref={ref} className={className} {...rest}>{children}</p>
  else return null;
});

const FeatureToggle = forwardRef<HTMLButtonElement, FeatureToggleProps>(
  ({children, ...rest}, ref) => {
    const {featureKey} = useFeatureKeyContext();
    const {isExpanded, toggleExpandedFeatures} = useFeatureContext();
    return (
      <button
        ref={ref}
        className={clsx(
          "absolute size-4 flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 text-light hover:text-sapphire-300",
          isExpanded(featureKey) ?
            "opacity-100 scale-100 pointer-events-auto top-1 right-1" :
            "opacity-0 scale-75 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
        )}
        {...rest}
        onClick={() => toggleExpandedFeatures(featureKey)}
      >
        {
          isExpanded(featureKey) ?
            <Uncheck className="size-4 absolute inset-0 transition-all duration-200"/> :
            <Warning className="size-4 absolute inset-0 transition-all duration-200"/>
        }
      </button>
    )
  }
);

const Feature = Object.assign(FeatureRoot, {
  Visual: FeatureVisual,
  Badge: FeatureBadge,
  Header: FeatureHeader,
  Content: FeatureContent,
  Icon: FeatureIcon,
  Title: FeatureTitle,
  Description: FeatureDescription,
  Toggle: FeatureToggle,
})

export default Feature;
