/* Build the SVG circle ring markup from geometry values */
const buildCircleRingHTML = ({ svgSize, circleCenter, circleRadius, strokeWidth }) => `
  <svg
    class="feature__button-overlay"
    width="${svgSize}"
    height="${svgSize}"
    viewBox="0 0 ${svgSize} ${svgSize}"
  >
    <circle
      class="feature__button-ring feature__button-ring--clockwise"
      cx="${circleCenter}"
      cy="${circleCenter}"
      r="${circleRadius}"
      fill="transparent"
      pathLength="100"
      stroke-width="${strokeWidth}"
      stroke-opacity="1"
      stroke-dasharray="0 100"
    />
    <circle
      class="feature__button-ring feature__button-ring--anticlockwise"
      cx="${circleCenter}"
      cy="${circleCenter}"
      r="${circleRadius}"
      fill="transparent"
      pathLength="100"
      stroke-width="${strokeWidth}"
      stroke-opacity="1"
      stroke-dasharray="0 100"
    />
  </svg>
`;

/* Convert mouse position to 0-100 along the circle path */
const getCircleNormalisedPosition = (mouseX, mouseY, circleEl) => {
  const box = circleEl.getBoundingClientRect();
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const angle = Math.atan2(mouseY - cy, mouseX - cx);
  let normalised = angle / (2 * Math.PI);
  if (normalised < 0) normalised += 1;
  return normalised * 100;
};

/* Run the enter or leave stroke animation given a pre-computed cursor distance (0-100) */
const animateStroke = (distance, isEnter, clockwiseEl, antiClockwiseEl, animations) => {
  animations.clockwise?.cancel();
  animations.antiClockwise?.cancel();

  /* Fix the clockwise offset so the dash starts at the cursor */
  clockwiseEl.setAttribute("stroke-dashoffset", String(-distance));

  const opts = { duration: 500, fill: "forwards", easing: "cubic-bezier(0.8, 0, 0.2, 1)" };

  if (isEnter) {
    /* Grow the clockwise dash from 0 to 50 */
    animations.clockwise = clockwiseEl.animate([
      { strokeDasharray: "0 100" },
      { strokeDasharray: "50 50" },
    ], opts);

    /* Grow the anti-clockwise dash from 0 to 50 */
    animations.antiClockwise = antiClockwiseEl.animate([
      { strokeDasharray: "0 100", strokeDashoffset: String(-distance) },
      { strokeDasharray: "50 50", strokeDashoffset: String(50 - distance) },
    ], opts);
  } else {
    /* Shrink the clockwise dash from 50 to 0 */
    animations.clockwise = clockwiseEl.animate([
      { strokeDasharray: "50 50", strokeDashoffset: String(-distance) },
      { strokeDasharray: "0 100", strokeDashoffset: String(-distance) },
    ], opts);

    /* Shrink the anti-clockwise dash from 50 to 0 */
    animations.antiClockwise = antiClockwiseEl.animate([
      { strokeDasharray: "50 50", strokeDashoffset: String(50 - distance) },
      { strokeDasharray: "0 100", strokeDashoffset: String(-distance) },
    ], opts);
  }
};

/* Attach mouseenter/mouseleave circle ring animation to a button element */
export const attachCircleRingListeners = (button) => {
  const clockwiseEl = button.querySelector(".feature__button-ring--clockwise");
  const antiClockwiseEl = button.querySelector(".feature__button-ring--anticlockwise");
  /* Track running Animation instances so each call can cancel the previous */
  const animations = { clockwise: undefined, antiClockwise: undefined };

  button.addEventListener("mouseenter", (event) => animateStroke(getCircleNormalisedPosition(event.clientX, event.clientY, clockwiseEl), true,  clockwiseEl, antiClockwiseEl, animations));
  button.addEventListener("mouseleave", (event) => animateStroke(getCircleNormalisedPosition(event.clientX, event.clientY, clockwiseEl), false, clockwiseEl, antiClockwiseEl, animations));
};

/* Build the SVG rect ring markup from geometry values */
const buildRectRingHTML = ({ width, height, cornerRadius, strokeWidth }) => {
  const svgWidth = width + 4;
  const svgHeight = height + 4;
  const rectWidth = width + 3;
  const rectHeight = height + 3;
  /* Offset the corner radius to keep the stroke concentric with the button */
  const svgCornerRadius = cornerRadius + 1.5;

  return `
    <svg
      class="feature__button-overlay"
      width="${svgWidth}"
      height="${svgHeight}"
      viewBox="0 0 ${svgWidth} ${svgHeight}"
    >
      <rect
        class="feature__button-ring feature__button-ring--clockwise"
        width="${rectWidth}"
        height="${rectHeight}"
        x="0.5"
        y="0.5"
        rx="${svgCornerRadius}"
        ry="${svgCornerRadius}"
        fill="transparent"
        pathLength="100"
        stroke-width="${strokeWidth}"
        stroke-opacity="0.7"
        stroke-dasharray="0 100"
      />
      <rect
        class="feature__button-ring feature__button-ring--anticlockwise"
        width="${rectWidth}"
        height="${rectHeight}"
        x="0.5"
        y="0.5"
        rx="${svgCornerRadius}"
        ry="${svgCornerRadius}"
        fill="transparent"
        pathLength="100"
        stroke-width="${strokeWidth}"
        stroke-opacity="0.7"
        stroke-dasharray="0 100"
      />
    </svg>
  `;
};

/* Convert mouse position to 0-100 along a rounded rect's perimeter */
const getRectNormalisedPosition = (mouseX, mouseY, rectEl, cornerRadius, strokeWidth) => {
  const rectBox = rectEl.getBoundingClientRect();
  const halfStroke = strokeWidth / 2;
  /* Use the adjusted SVG corner radius that matches the rect elements */
  const svgCornerRadius = cornerRadius + 1.5;

  /* Inset bounding box by half the stroke to get the geometric path edges */
  const geometricLeft = rectBox.left + halfStroke;
  const geometricRight = rectBox.right - halfStroke;
  const geometricTop = rectBox.top + halfStroke;
  const geometricBottom = rectBox.bottom - halfStroke;

  /* Straight edges are shorter by 2 * svgCornerRadius, corner arc = (pi * r) / 2 */
  const straightEdgeH = (geometricRight - geometricLeft) - 2 * svgCornerRadius;
  const straightEdgeV = (geometricBottom - geometricTop) - 2 * svgCornerRadius;
  const quarterArc = (Math.PI * svgCornerRadius) / 2;

  /* Cumulative distance from path start to each segment */
  const topRightArcStart = straightEdgeH;
  const rightEdgeStart = topRightArcStart + quarterArc;
  const bottomRightArcStart = rightEdgeStart + straightEdgeV;
  const bottomEdgeStart = bottomRightArcStart + quarterArc;
  const bottomLeftArcStart = bottomEdgeStart + straightEdgeH;
  const leftEdgeStart = bottomLeftArcStart + quarterArc;
  const topLeftArcStart = leftEdgeStart + straightEdgeV;
  const totalPerimeter = topLeftArcStart + quarterArc;

  /* Clamp mouse position onto the geometric rect */
  const clampX = Math.max(geometricLeft, Math.min(mouseX, geometricRight));
  const clampY = Math.max(geometricTop, Math.min(mouseY, geometricBottom));

  /* Corner boundaries */
  const cornerLeft = geometricLeft + svgCornerRadius;
  const cornerRight = geometricRight - svgCornerRadius;
  const cornerTop = geometricTop + svgCornerRadius;
  const cornerBottom = geometricBottom - svgCornerRadius;

  /* Compute fraction [0,1] along a quarter-circle arc */
  const arcFraction = (centerX, centerY, startAngle) => {
    const angle = Math.atan2(clampY - centerY, clampX - centerX);
    let relative = angle - startAngle;
    if (relative < 0) relative += 2 * Math.PI;
    return Math.max(0, Math.min(1, relative / (Math.PI / 2)));
  };

  /* Check each corner region */
  if (clampX > cornerRight && clampY < cornerTop)
    return (topRightArcStart + arcFraction(cornerRight, cornerTop, -Math.PI / 2) * quarterArc) / totalPerimeter * 100;
  if (clampX > cornerRight && clampY > cornerBottom)
    return (bottomRightArcStart + arcFraction(cornerRight, cornerBottom, 0) * quarterArc) / totalPerimeter * 100;
  if (clampX < cornerLeft && clampY > cornerBottom)
    return (bottomLeftArcStart + arcFraction(cornerLeft, cornerBottom, Math.PI / 2) * quarterArc) / totalPerimeter * 100;
  if (clampX < cornerLeft && clampY < cornerTop)
    return (topLeftArcStart + arcFraction(cornerLeft, cornerTop, Math.PI) * quarterArc) / totalPerimeter * 100;

  /* Find nearest straight edge */
  const distToTop = Math.abs(clampY - geometricTop);
  const distToRight = Math.abs(clampX - geometricRight);
  const distToBottom = Math.abs(clampY - geometricBottom);
  const distToLeft = Math.abs(clampX - geometricLeft);
  const minDist = Math.min(distToTop, distToRight, distToBottom, distToLeft);

  let distance;
  if (minDist === distToTop) distance = clampX - cornerLeft;
  else if (minDist === distToRight) distance = rightEdgeStart + (clampY - cornerTop);
  else if (minDist === distToBottom) distance = bottomEdgeStart + (cornerRight - clampX);
  else distance = leftEdgeStart + (cornerBottom - clampY);

  return (distance / totalPerimeter) * 100;
};

/* Attach mouseenter/mouseleave rect ring animation to a button element */
export const attachRectRingListeners = (button, cornerRadius, strokeWidth) => {
  const clockwiseEl = button.querySelector(".feature__button-ring--clockwise");
  const antiClockwiseEl = button.querySelector(".feature__button-ring--anticlockwise");
  const animations = { clockwise: undefined, antiClockwise: undefined };

  button.addEventListener("mouseenter", (event) => animateStroke(getRectNormalisedPosition(event.clientX, event.clientY, clockwiseEl, cornerRadius, strokeWidth), true,  clockwiseEl, antiClockwiseEl, animations));
  button.addEventListener("mouseleave", (event) => animateStroke(getRectNormalisedPosition(event.clientX, event.clientY, clockwiseEl, cornerRadius, strokeWidth), false, clockwiseEl, antiClockwiseEl, animations));
};

export {buildCircleRingHTML, buildRectRingHTML};
