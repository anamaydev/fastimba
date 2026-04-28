import {useEffect, useRef, useState, forwardRef} from "react";
import type {ComponentPropsWithRef, ReactNode} from "react";
import {clsx} from "clsx";
import {useMergeRef} from "@/hooks/useMergeRefs";

interface ButtonProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
  className?: string;
  buttonClassName?: string;
  strokeClassName?: string;
  onClick?: () => void;
}

/* SVG is slightly larger than the button so the stroke ring sits outside it */
const SVG_SIZE_DELTA = 4;
/* Rect is slightly smaller than the SVG to leave room for the stroke */
const RECT_SIZE_DELTA = 3;

const Button = forwardRef<HTMLDivElement, ButtonProps>(
  ({children, className, buttonClassName, strokeClassName, onClick, ...rest}, forwardedRef) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const clockwiseRectRef = useRef<SVGRectElement | null>(null);
    const antiClockwiseRectRef = useRef<SVGRectElement | null>(null);

    /* Merge internal ref with any forwarded ref from the parent */
    const mergedRef = useMergeRef(containerRef, forwardedRef);

    /* Measured button dimensions drive SVG geometry */
    const [dimensions, setDimensions] = useState({width: 0, height: 0});

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
      if (!buttonEl) return;

      const measure = () => {
        const {width, height} = buttonEl.getBoundingClientRect();
        setDimensions(prev => (prev.width === width && prev.height === height) ? prev : {width, height});
      };

      measure();

      const observer = new ResizeObserver(measure);
      observer.observe(buttonEl);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const clockwiseRectEl = clockwiseRectRef.current;
      const antiClockwiseRectEl = antiClockwiseRectRef.current;
      const containerEl = containerRef.current;

      if(!containerEl) return;
      if(!clockwiseRectEl) return;
      if(!antiClockwiseRectEl) return;

      /* Each rect gets its own Animation instance so both can be reversed independently */
      let animation1: Animation | undefined;
      let animation2: Animation | undefined;

      const getPerimeterAlongDistance = (mouseX:number, mouseY:number, rectBox:DOMRect) => {
        const {left:rectBoxLeft, right:rectBoxRight, top:rectBoxTop, bottom:rectBoxBottom, width:rectBoxWidth, height:rectBoxHeight} = rectBox

        /* Find nearest edge */
        const distToTop = Math.abs(mouseY - rectBoxTop);
        const distToRight = Math.abs(mouseX - rectBoxRight);
        const distToBottom = Math.abs(mouseY - rectBoxBottom);
        const distToLeft = Math.abs(mouseX - rectBoxLeft);

        const minDist = Math.min(distToTop, distToRight, distToBottom, distToLeft);

        /* Snap the cursor onto the rect's geometric path */
        const clampX = Math.max(rectBoxLeft, Math.min(mouseX, rectBoxRight));
        const clampY = Math.max(rectBoxTop,  Math.min(mouseY, rectBoxBottom));

        /* -1.5 aligns the stroke */
        if (minDist === distToTop) return (clampX - rectBoxLeft) - 1.5;                                         /* -> right */
        if (minDist === distToRight) return rectBoxWidth + (clampY - rectBoxTop) - 1.5;                         /* -> down  */
        if (minDist === distToBottom) return rectBoxWidth + rectBoxHeight + (rectBoxRight - clampX) - 1.5;      /* -> left  */
        return 2 * rectBoxWidth + rectBoxHeight + (rectBoxBottom - clampY) - 1.5;                               /* -> up    */
      }

      const reverseAnimateStroke = () => {
        /* Play both animations backwards to retract the strokes */
        animation1?.reverse();
        animation2?.reverse();
      }

      const handleMouseEnter = (event: MouseEvent) => {
        /* Rect's actual screen bounding box */
        const rectBox = clockwiseRectEl.getBoundingClientRect();
        const perimeter = 2 * (rectBox.width + rectBox.height);

        /* Pixel distance along the perimeter from the top-left corner to the cursor */
        const distance = getPerimeterAlongDistance(event.clientX, event.clientY, rectBox);
        /* Normalise to 0–100 to match pathLength={100} */
        const normalizedDistance = (distance / perimeter) * 100;

        /* Rect1: dashoffset is fixed at -D, the dash starts at D and grows clockwise */
        clockwiseRectEl.setAttribute("stroke-dashoffset", String(-normalizedDistance));
        animation1 = clockwiseRectEl.animate([
          {strokeDasharray: "0 100"},
          {strokeDasharray: "50 50"},
        ], { duration: 500, fill: 'forwards', easing: "cubic-bezier(0.8, 0, 0.2, 1)" });

        /* Rect2: dashoffset animates from -D to 50-D and grows anti-clockwise */
        animation2 = antiClockwiseRectEl.animate([
          {strokeDasharray: "0 100",  strokeDashoffset: String(-normalizedDistance)},
          {strokeDasharray: "50 50",  strokeDashoffset: String(50 - normalizedDistance)},
        ], { duration: 500, fill: "forwards", easing: "cubic-bezier(0.8, 0, 0.2, 1)"});
      }

      containerEl.addEventListener("mouseenter", handleMouseEnter);
      containerEl.addEventListener("mouseleave", reverseAnimateStroke);

      return () => {
        containerEl.removeEventListener("mouseenter", handleMouseEnter);
        containerEl.removeEventListener("mouseleave", reverseAnimateStroke);
      }

    }, [forwardedRef]);

    return (
      <div
        ref={mergedRef}
        className={clsx(
          "relative cursor-pointer",
          className
        )}
        {...rest}
      >
        {/* Button is in normal flow so it defines the container size */}
        <button
          ref={buttonRef}
          className={clsx(
            "relative p-0.5 m-0.5 rounded-sm flex justify-center items-center gap-1.5 cursor-pointer",
            buttonClassName ?? "bg-cobalt-800 text-cobalt-300"
          )}
          onClick={onClick}
        >{children}</button>

        {/* SVG ring overlays the button; sized larger so the stroke isn't clipped */}
        <svg
          ref={svgRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          width={svgSize.width}
          height={svgSize.height}
          viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
        >
          {/* pathLength={100} lets us treat dasharray values as percentages of the perimeter */}
          <rect
            ref={clockwiseRectRef}
            className={clsx(strokeClassName ?? "stroke-cobalt-600")}
            width={rectSize.width}
            height={rectSize.height}
            x={0.5}
            y={0.5}
            rx={5.5}
            ry={5.5}
            strokeWidth={1}
            strokeOpacity={0.7}
            fill={"transparent"}
            pathLength={100}
            strokeDasharray={"0 100"}
          />
          {/* Identical rect layered on top; stroke travels counter-clockwise from the same entry point */}
          <rect
            ref={antiClockwiseRectRef}
            className={clsx(strokeClassName ?? "stroke-cobalt-600")}
            width={rectSize.width}
            height={rectSize.height}
            x={0.5}
            y={0.5}
            rx={5.5}
            ry={5.5}
            strokeWidth={1}
            strokeOpacity={0.7}
            fill={"transparent"}
            pathLength={100}
            strokeDasharray={"0 100"}
          />

          {/* border */}
          {/* TODO: Create button variants */}
          <rect
            className={clsx("hidden", strokeClassName ?? "stroke-cobalt-600")}
            width={rectSize.width}
            height={rectSize.height}
            x={0.5}
            y={0.5}
            rx={5.5}
            ry={5.5}
            strokeWidth={1}
            strokeOpacity={0.1}
            fill={"transparent"}
            pathLength={100}
          />
        </svg>
      </div>
    )
  }
);

export default Button;