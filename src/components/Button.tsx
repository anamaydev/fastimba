import {useEffect, useRef, useState, forwardRef} from "react";
import type {ComponentPropsWithRef, ReactNode} from "react";
import {clsx} from "clsx";
import {useMergeRef} from "@/hooks/useMergeRefs";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonColorScheme = "cobalt" | "garnet" | "amber" | "jade" | "slate";

interface ButtonProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  colorScheme?: ButtonColorScheme | ButtonColors;
}
interface ButtonColors {
  bg: string;
  text: string;
  stroke: string;
}

/* SVG is slightly larger than the button so the stroke ring sits outside it */
const SVG_SIZE_DELTA = 4;
/* Rect is slightly smaller than the SVG to leave room for the stroke */
const RECT_SIZE_DELTA = 3;
const STROKE_WIDTH = 1;
const CORNER_RADIUS = 5.5;
/* Default color presets*/
const COLOR_SCHEME_PRESETS: Record<ButtonColorScheme, ButtonColors> = {
  cobalt: {bg: "bg-cobalt-800", text: "text-cobalt-300", stroke: "stroke-cobalt-600"},
  garnet: {bg: "bg-garnet-800", text: "text-garnet-300", stroke: "stroke-garnet-600"},
  amber: {bg: "bg-amber-800",  text: "text-amber-300", stroke: "stroke-amber-600"},
  jade: {bg: "bg-jade-800",   text: "text-jade-300", stroke: "stroke-jade-600"},
  slate: {bg: "bg-slate-500",  text:"text-sapphire-300", stroke: "stroke-iris-400"}
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({children, className, variant="default", colorScheme="cobalt" as ButtonColorScheme | ButtonColors, onClick, ...rest}, forwardedRef) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const clockwiseRectRef = useRef<SVGRectElement | null>(null);
    const antiClockwiseRectRef = useRef<SVGRectElement | null>(null);

    /* Measured button dimensions drive SVG geometry */
    const [dimensions, setDimensions] = useState({width: 0, height: 0});

    /* Merge internal ref with any forwarded ref from the parent */
    const mergedRef = useMergeRef(buttonRef, forwardedRef);

    const hasSVG = variant !== "ghost";
    const colors = typeof colorScheme === "string" ? COLOR_SCHEME_PRESETS[colorScheme] : colorScheme;
    const variantClasses = {
      default: `${colors.bg} ${colors.text}`,
      outline: `bg-transparent ${colors.text} backdrop-blur-xs`,
      ghost: `bg-transparent ${colors.text}`,
    };

    /* SVG must be bigger than the button so the stroke isn't clipped */
    const svgSize = {
      width: dimensions.width + SVG_SIZE_DELTA,
      height: dimensions.height + SVG_SIZE_DELTA
    }

    /* Rect sits 0.5px inset from the SVG edge so the stroke isn't clipped */
    const rectSize = {
      width: dimensions.width + RECT_SIZE_DELTA,
      height: dimensions.height + RECT_SIZE_DELTA
    }

    /* Measure the button after mount and on resize */
    useEffect(() => {
      const buttonEl = buttonRef.current;
      if (!buttonEl || !hasSVG) return;

      const measure = () => {
        const {width, height} = buttonEl.getBoundingClientRect();
        setDimensions(prev => (
          prev.width === width && prev.height === height) ? prev : {width, height}
        );
      };

      measure();

      const observer = new ResizeObserver(measure);
      observer.observe(buttonEl);
      return () => observer.disconnect();
    }, [hasSVG]);

    useEffect(() => {
      const clockwiseRectEl = clockwiseRectRef.current;
      const antiClockwiseRectEl = antiClockwiseRectRef.current;
      const buttonEl = buttonRef.current;

      if(!buttonEl || !clockwiseRectEl || !antiClockwiseRectEl) return;

      /* Each rect gets its own Animation instance so both can be reversed independently */
      let clockwiseRectAnimation: Animation | undefined;
      let antiClockwiseRectAnimation: Animation | undefined;

      /* Map a mouse's screen co-ordinates (x,y) to 0-100 along the SVG rect's rounded corner path */
      const getNormalisedPosition = (mouseX:number, mouseY:number, rectBox:DOMRect) => {
        /* getBoundingClientRect() includes the stroke, so inset by strokeWidth/2 to find geometric path center */
        const strokeWidth = STROKE_WIDTH / 2;
        const cornerRadius = CORNER_RADIUS;

        /* Inset bounding box by half the stroke width to get the geometric path edges */
        const geometricLeft = rectBox.left + strokeWidth;
        const geometricRight = rectBox.right - strokeWidth;
        const geometricTop = rectBox.top + strokeWidth;
        const geometricBottom = rectBox.bottom - strokeWidth;

        /* Compute the actual length of Horizontal and vertical edges
         *   - straight edges are shorter by 2* cornerRadius
         *   - corner arc = quarter of circle's circumference = (pi * r) / 2
         * */
        const straightEdgeH = (geometricRight - geometricLeft) - 2 * cornerRadius;
        const straightEdgeV = (geometricBottom - geometricTop) - 2 * cornerRadius;
        const quarterArc = (Math.PI * cornerRadius) / 2;

        /* Cumulative distance from path start to the beginning of each segment
         * top edge → TR arc → right edge → BR arc → bottom edge → BL arc → left edge → TL arc
         * */
        const topEdgeStart = 0;
        const topRightArcStart = straightEdgeH;
        const rightEdgeStart = straightEdgeH + quarterArc;
        const bottomRightArcStart = straightEdgeH + quarterArc + straightEdgeV;
        const bottomEdgeStart = straightEdgeH + quarterArc + straightEdgeV + quarterArc;
        const bottomLeftArcStart = straightEdgeH + quarterArc + straightEdgeV + quarterArc + straightEdgeH;
        const leftEdgeStart = straightEdgeH + quarterArc + straightEdgeV + quarterArc + straightEdgeH + quarterArc;
        const topLeftArcStart = straightEdgeH + quarterArc + straightEdgeV + quarterArc + straightEdgeH + quarterArc + straightEdgeV;
        const totalPerimeter = topLeftArcStart + quarterArc;

        /* Clamp mouse position onto the geometric rect to snap outside points to the nearest edge */
        const clampX = Math.max(geometricLeft, Math.min(mouseX, geometricRight));
        const clampY = Math.max(geometricTop, Math.min(mouseY, geometricBottom));

        /* Corner boundaries */
        const cornerLeft = geometricLeft + cornerRadius;
        const cornerRight = geometricRight - cornerRadius;
        const cornerTop = geometricTop + cornerRadius;
        const cornerBottom = geometricBottom - cornerRadius;

        /* Compute fraction [0,1] along a quarter-circle arc */
        const arcFraction = (centerX: number, centerY: number, startAngle: number): number => {
          /* get the angle from the arc's center */
          const angle = Math.atan2(clampY - centerY, clampX - centerX);
          let relative = angle - startAngle;
          if (relative < 0) relative += 2 * Math.PI;
          return Math.max(0, Math.min(1, relative / (Math.PI / 2)));
        };

        /* Check each corner regions */
        if (clampX > cornerRight && clampY < cornerTop)
          return (topRightArcStart + arcFraction(cornerRight, cornerTop, -Math.PI / 2) * quarterArc) / totalPerimeter * 100;
        if (clampX > cornerRight && clampY > cornerBottom)
          return (bottomRightArcStart + arcFraction(cornerRight, cornerBottom, 0) * quarterArc) / totalPerimeter * 100;
        if (clampX < cornerLeft  && clampY > cornerBottom)
          return (bottomLeftArcStart  + arcFraction(cornerLeft,  cornerBottom, Math.PI / 2) * quarterArc) / totalPerimeter * 100;
        if (clampX < cornerLeft  && clampY < cornerTop)
          return (topLeftArcStart + arcFraction(cornerLeft, cornerTop, Math.PI) * quarterArc) / totalPerimeter * 100;

        /* Find nearest straight edge */
        const distToTop = Math.abs(clampY - geometricTop);
        const distToRight = Math.abs(clampX - geometricRight);
        const distToBottom = Math.abs(clampY - geometricBottom);
        const distToLeft = Math.abs(clampX - geometricLeft);
        const minDist = Math.min(distToTop, distToRight, distToBottom, distToLeft);

        let distance: number;
        if (minDist === distToTop) distance = topEdgeStart + (clampX - cornerLeft);
        else if (minDist === distToRight) distance = rightEdgeStart + (clampY - cornerTop);
        else if (minDist === distToBottom) distance = bottomEdgeStart + (cornerRight - clampX);
        else distance = leftEdgeStart + (cornerBottom - clampY);

        /* Normalise to 0–100 to match pathLength={100} */
        return (distance / totalPerimeter) * 100;
      }

      const animateStroke = (event: MouseEvent, isEnter: boolean) => {
        /* Rect's actual screen bounding box */
        const rectBox = clockwiseRectEl.getBoundingClientRect();
        const normalizedDistance = getNormalisedPosition(event.clientX, event.clientY, rectBox);

        /* Cancel any running animation before starting a new one */
        clockwiseRectAnimation?.cancel();
        antiClockwiseRectAnimation?.cancel();

        /* Set the clockwise rect's dashoffset to -D, the dash starts at D and grows clockwise */
        clockwiseRectEl.setAttribute("stroke-dashoffset", String(-normalizedDistance));

        if(isEnter){
          /* Clockwise rect: dash grows from 0 to 50, offset is fixed at -D */
          clockwiseRectAnimation = clockwiseRectEl.animate([
            {strokeDasharray: "0 100"},
            {strokeDasharray: "50 50"},
          ], { duration: 500, fill: 'forwards', easing: "cubic-bezier(0.8, 0, 0.2, 1)" });

          /* Anti-clockwise: dash grows from 0 to 50, offset shifts from -D to (50-D) */
          antiClockwiseRectAnimation = antiClockwiseRectEl.animate([
            {strokeDasharray: "0 100",  strokeDashoffset: String(-normalizedDistance)},
            {strokeDasharray: "50 50",  strokeDashoffset: String(50 - normalizedDistance)},
          ], { duration: 500, fill: "forwards", easing: "cubic-bezier(0.8, 0, 0.2, 1)"});
        } else{
          clockwiseRectAnimation = clockwiseRectEl.animate([
            {strokeDasharray: "50 50", strokeDashoffset: String(-normalizedDistance)},
            {strokeDasharray: "0 100", strokeDashoffset: String(-normalizedDistance)},
          ], { duration: 500, fill: 'forwards', easing: "cubic-bezier(0.8, 0, 0.2, 1)" });

          /* Rect2: dashoffset animates from -D to 50-D and grows anti-clockwise */
          antiClockwiseRectAnimation = antiClockwiseRectEl.animate([
            {strokeDasharray: "50 50",  strokeDashoffset: String(50 - normalizedDistance)},
            {strokeDasharray: "0 100",  strokeDashoffset: String(-normalizedDistance)},
          ], { duration: 500, fill: "forwards", easing: "cubic-bezier(0.8, 0, 0.2, 1)"});
        }
      }

      const handleMouseEnter = (event: MouseEvent) => animateStroke(event, true);
      const handleMouseLeave = (event: MouseEvent) => animateStroke(event, false);

      buttonEl.addEventListener("mouseenter", handleMouseEnter);
      buttonEl.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        buttonEl.removeEventListener("mouseenter", handleMouseEnter);
        buttonEl.removeEventListener("mouseleave", handleMouseLeave);
      }
    }, []);

    return (
      <button
        ref={mergedRef}
        className={clsx(
          "relative w-full h-full rounded-sm flex justify-center items-center gap-1.5 cursor-pointer text-nowrap",
          hasSVG && "p-0.5 m-0.5",
          variantClasses[variant],
          className
        )}
        onClick={onClick}
        {...rest}
      >
        {children}
        {hasSVG && (
          /* SVG ring overlays the button */
          <svg
            ref={svgRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            width={svgSize.width}
            height={svgSize.height}
            viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
          >
            {/* Rect with stroke animating clockwise */}
            <rect
              ref={clockwiseRectRef}
              className={colors.stroke}
              width={rectSize.width}
              height={rectSize.height}
              x={0.5}
              y={0.5}
              rx={5.5}
              ry={5.5}
              fill={"transparent"}
              pathLength={100}
              strokeWidth={1}
              strokeOpacity={0.7}
              strokeDasharray={"0 100"}
            />
            {/* Rect with stroke animating anti-clockwise */}
            <rect
              ref={antiClockwiseRectRef}
              className={colors.stroke}
              width={rectSize.width}
              height={rectSize.height}
              x={0.5}
              y={0.5}
              rx={5.5}
              ry={5.5}
              fill={"transparent"}
              pathLength={100}
              strokeWidth={1}
              strokeOpacity={0.7}
              strokeDasharray={"0 100"}
            />

            {/* Outline rect: persistent low-opacity border */}
            {variant === "outline" && (
              <rect
                className={colors.stroke}
                width={rectSize.width}
                height={rectSize.height}
                x={0.5}
                y={0.5}
                rx={5.5}
                ry={5.5}
                fill={"transparent"}
                pathLength={100}
                strokeWidth={1}
                strokeOpacity={0.1}
              />
            )}
          </svg>
        )}
      </button>
    );
  }
);

export default Button;