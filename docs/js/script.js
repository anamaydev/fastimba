import {features} from "./features.js";
import {buildCircleRingHTML, buildRectRingHTML, attachCircleRingListeners, attachRectRingListeners} from "./button-overlay.js";
import {githubIcon} from "./icons.js";
import {initFeature, switchFeature} from "./carousel.js";

/* Constants */
const BUTTON_SIZE = 40;
const BUTTON_MARGIN = 3;

const SVG_SIZE_DELTA = 4;
const CIRCLE_SIZE_DELTA = 3;
const STROKE_WIDTH = 1

/* Derived geometry */
const SVG_SIZE = BUTTON_SIZE + SVG_SIZE_DELTA;
const CIRCLE_CENTER = SVG_SIZE / 2;
/* Place the stroke center just outside the button edge */
const CIRCLE_RADIUS = (BUTTON_SIZE + CIRCLE_SIZE_DELTA) / 2;

const mediaContainer = document.querySelector('.feature__media');
const contentContainer = document.querySelector('.feature__content');
const controls = document.querySelector('.feature__controls');

/* Media overlay refs */
const mediaLabel = document.querySelector('.feature__media-label');
const counterCurrent = document.querySelector('.feature__media-counter-current');
const counterTotal = document.querySelector('.feature__media-counter-total');

const featureList = Object.values(features);
let activeIndex = 0;
let busy = false;
const buttons = [];

/* Zero-pad a number to two digits */
const pad = (number) => String(number).padStart(2, "0");

/* Fade + slide an overlay element into view */
const animateOverlay = (element, finalOpacity) => {
  element.animate([
    { opacity: 0, transform: "translateY(6px)" },
    { opacity: finalOpacity, transform: "translateY(0)" },
  ], { duration: 500, fill: "forwards", easing: "cubic-bezier(0.76, 0, 0.24, 1)" });
};

/* Update the static media overlay text for the given feature index */
const updateOverlays = (index) => {
  mediaLabel.innerHTML = featureList[index].icon + featureList[index].title;
  counterCurrent.textContent = pad(index);
  animateOverlay(mediaLabel, 0.35);
  animateOverlay(counterCurrent, 0.7);
};

for (const [, value] of Object.entries(features)) {
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.style.width = `${BUTTON_SIZE/16}rem`;
  button.style.height = `${BUTTON_SIZE/16}rem`;
  button.style.margin = `${BUTTON_MARGIN/16}rem`;
  button.setAttribute("class", `feature__button feature__button-${value.name}`);
  button.innerHTML = value.icon + buildCircleRingHTML({
    svgSize: SVG_SIZE,
    circleCenter: CIRCLE_CENTER,
    circleRadius: CIRCLE_RADIUS,
    strokeWidth: STROKE_WIDTH,
  });
  attachCircleRingListeners(button);
  buttons.push(button);
}

/* Navigate to a feature by index */
const goTo = (index) => {
  if (busy || index === activeIndex || index < 0 || index >= featureList.length) return;
  busy = true;
  const direction = index > activeIndex ? 1 : -1;
  buttons[activeIndex].classList.remove("feature__button--active");
  activeIndex = index;
  buttons[activeIndex].classList.add("feature__button--active");
  updateOverlays(index);
  switchFeature(mediaContainer, contentContainer, featureList[index], direction, index, featureList.length - 1);
  setTimeout(() => { busy = false; }, 800);
};

buttons.forEach((button, index) => {
  controls.appendChild(button);
  button.addEventListener("click", () => goTo(index));
});

/* Set initial overlay content, mark first button active, display first feature */
counterTotal.textContent = `/ ${pad(featureList.length - 1)}`;
updateOverlays(0);
buttons[0].classList.add("feature__button--active");
initFeature(mediaContainer, contentContainer, featureList[0], 0, featureList.length - 1);

/* Build GitHub header button */
const RECT_CORNER_RADIUS = 5.5;
const RECT_STROKE_WIDTH = 1;

const headerNav = document.getElementById("header-nav");
const githubLink = document.createElement("a");
githubLink.href = "https://github.com/anamaydev/fastimba";
githubLink.target = "_blank";
githubLink.rel = "noopener noreferrer";
githubLink.className = "rect-button";
githubLink.innerHTML = githubIcon + "GitHub" + buildRectRingHTML({
  width: githubLink.offsetWidth,
  height: githubLink.offsetHeight,
  cornerRadius: RECT_CORNER_RADIUS,
  strokeWidth: RECT_STROKE_WIDTH,
});
headerNav.appendChild(githubLink);

/* Measure after append, then rebuild the ring SVG with correct dimensions */
const measuredWidth = githubLink.offsetWidth;
const measuredHeight = githubLink.offsetHeight;
githubLink.querySelector(".feature__button-overlay").remove();
githubLink.insertAdjacentHTML("beforeend", buildRectRingHTML({
  width: measuredWidth,
  height: measuredHeight,
  cornerRadius: RECT_CORNER_RADIUS,
  strokeWidth: RECT_STROKE_WIDTH,
}));
attachRectRingListeners(githubLink, RECT_CORNER_RADIUS, RECT_STROKE_WIDTH);

/* Arrow key and number key navigation */
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "j") goTo((activeIndex + 1) % featureList.length);
  if (event.key === "ArrowUp"   || event.key === "k") goTo((activeIndex - 1 + featureList.length) % featureList.length);
  const numKey = Number(event.key);
  if (numKey >= 1 && numKey <= featureList.length) goTo(numKey - 1);
});