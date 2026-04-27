import {useEffect, useRef, forwardRef} from "react";
import type {ComponentPropsWithRef, ReactNode} from "react";
import {clsx} from "clsx";
import {useMergeRef} from "@/hooks/useMergeRefs";

interface ButtonProps extends ComponentPropsWithRef<"div"> {
  children: ReactNode;
  buttonWidth: number;
  buttonHeight: number;
  className?: string;
  strokeColor?: string;
  textColor?: string;
  backgroundColor?: string;
  onClick?: () => void;
}

/* SVG is slightly larger than the button so the stroke ring sits outside it */
const SVG_SIZE_DELTA = 4;
/* Rect is slightly smaller than the SVG to leave room for the stroke */
const RECT_SIZE_DELTA = 3;

/* Default colors for SVG rect*/
const DEFAULT_STROKE_COLOR = "lch(35.9905 32.7 271.44)";
const DEFAULT_TEXT_COLOR = "lch(75 65.4 271.44 / 1)"
const DEFAULT_BACKGROUND_COLOR = "lch(20 14 271.44 / 1)"

const Button = forwardRef<HTMLDivElement, ButtonProps>(
  ({children, buttonWidth, buttonHeight, className, strokeColor, textColor, backgroundColor, onClick, ...rest}, forwardedRef) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const clockwiseRectRef = useRef<SVGRectElement | null>(null);
    const antiClockwiseRectRef = useRef<SVGRectElement | null>(null);

    /* Merge internal ref with any forwarded ref from the parent */
    const mergedRef = useMergeRef(containerRef, forwardedRef);

    /* SVG must be bigger than the button so the stroke isn't clipped */
    const svgSize = {
      width: buttonWidth + SVG_SIZE_DELTA,
      height: buttonHeight + SVG_SIZE_DELTA
    }

    /* Rect sits 0.5px inset from the SVG edge so the stroke isn't clipped */
    const rectSize = {
      width: buttonWidth + RECT_SIZE_DELTA,
      height: buttonHeight + RECT_SIZE_DELTA
    }

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
        {/* Actual clickable button, centered over the SVG via absolute inset */}
        <button
          className="absolute inset-0 m-auto rounded-sm flex justify-center items-center gap-1.5 cursor-pointer"
          style={{
            width: buttonWidth,
            height: buttonHeight,
            backgroundColor: backgroundColor ?? DEFAULT_BACKGROUND_COLOR,
            color: textColor ?? DEFAULT_TEXT_COLOR
          }}
          onClick={onClick}
        >{children}</button>

        {/* SVG ring that wraps the button; sized larger so the stroke isn't clipped */}
        <svg
          ref={svgRef}
          width={svgSize.width}
          height={svgSize.height}
          viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
        >
          {/* pathLength={100} lets us treat dasharray values as percentages of the perimeter */}
          <rect
            ref={clockwiseRectRef}
            width={rectSize.width}
            height={rectSize.height}
            x={0.5}
            y={0.5}
            rx={5.5}
            ry={5.5}
            strokeWidth={1}
            stroke={strokeColor ?? DEFAULT_STROKE_COLOR}
            strokeOpacity={0.7}
            fill={"transparent"}
            pathLength={100}
            strokeDasharray={"0 100"}
          />
          {/* Identical rect layered on top; stroke travels counter-clockwise from the same entry point */}
          <rect
            ref={antiClockwiseRectRef}
            width={rectSize.width}
            height={rectSize.height}
            x={0.5}
            y={0.5}
            rx={5.5}
            ry={5.5}
            strokeWidth={1}
            stroke={strokeColor ?? DEFAULT_STROKE_COLOR}
            strokeOpacity={0.7}
            fill={"transparent"}
            pathLength={100}
            strokeDasharray={"0 100"}
          />

          {/* border */}
          {/* TODO: Create button variants */}
          <rect
            className="hidden"
            width={rectSize.width}
            height={rectSize.height}
            x={0.5}
            y={0.5}
            rx={5.5}
            ry={5.5}
            strokeWidth={1}
            stroke={strokeColor ?? DEFAULT_STROKE_COLOR}
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
