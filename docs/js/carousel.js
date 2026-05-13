import {externalLinkIcon, chromeIcon, firefoxIcon} from "./icons.js";
import {buildRectRingHTML, attachRectRingListeners} from "./button-overlay.js";

const RECT_CORNER_RADIUS = 5.5;
const RECT_STROKE_WIDTH = 1;

const browserIcons = { chrome: chromeIcon, firefox: firefoxIcon };

/* Build a centered frame containing the <video> element */
const buildVideoEl = (feature) => {
  const frame = document.createElement("div");
  frame.className = "feature__media-frame";
  const video = document.createElement("video");
  video.src = feature.video;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.className = "feature__video";
  frame.appendChild(video);
  return frame;
};

/* Build the about element for the feature */
const buildAboutEl = (feature, index, total) => {
  const div = document.createElement("div");
  div.className = "feature__about";

  const num = String(index).padStart(2, "0");
  const tot = String(total).padStart(2, "0");

  const linksHTML = [
    ...(feature.storeLinks || []).map(link => `
    <a class="rect-button" href="${link.url}" target="_blank" rel="noopener noreferrer">
      ${browserIcons[link.browser] || ""}
      ${link.name}
    </a>`),
    ...(feature.resources || []).map(resource => `
    <a class="rect-button" href="${resource.url}" target="_blank" rel="noopener noreferrer">
      ${externalLinkIcon}
      ${resource.name}
    </a>`),
  ].join("");

  const hasLinks = feature.storeLinks?.length || feature.resources?.length;

  div.innerHTML = `
    <span class="feature__about-index">${num} - ${tot}</span>
    <h2 class="feature__about-title">${feature.title}</h2>
    <div class="feature__about-description">${feature.description}</div>
    ${hasLinks ? `<div class="feature__links">${linksHTML}</div>` : ""}
  `;

  /* Inject rect ring overlays into store and resource buttons after innerHTML is set */
  div.querySelectorAll(".feature__links .rect-button").forEach(button => {
    button.insertAdjacentHTML("beforeend", buildRectRingHTML({
      width: 0,
      height: 0,
      cornerRadius: RECT_CORNER_RADIUS,
      strokeWidth: RECT_STROKE_WIDTH,
    }));
  });

  return div;
};

/* Slide old element out and new element in */
const slideTransition = (container, oldEl, newEl, exitY, enterY) => {
  container.appendChild(newEl);

  const opts = { duration: 750, fill: "both", easing: "cubic-bezier(0.76, 0, 0.24, 1)" };

  if (oldEl) {
    oldEl.animate([
      { transform: "translateY(0)", opacity: "1" },
      { transform: `translateY(${exitY})`, opacity: "0" },
    ], opts).finished.then(() => oldEl.remove());
  }

  newEl.animate([
    { transform: `translateY(${enterY})`, opacity: "0" },
    { transform: "translateY(0)", opacity: "1" },
  ], opts);
};

/* Rebuild rect ring SVGs with measured dimensions and attach hover listeners */
const activateRectButtons = (container) => {
  container.querySelectorAll(".feature__links .rect-button").forEach(button => {
    const overlay = button.querySelector(".feature__button-overlay");
    if (!overlay) return;

    const width = button.offsetWidth;
    const height = button.offsetHeight;

    overlay.remove();
    button.insertAdjacentHTML("beforeend", buildRectRingHTML({
      width,
      height,
      cornerRadius: RECT_CORNER_RADIUS,
      strokeWidth: RECT_STROKE_WIDTH,
    }));
    attachRectRingListeners(button, RECT_CORNER_RADIUS, RECT_STROKE_WIDTH);
  });
};

/* Place the first feature without animation */
export const initFeature = (mediaContainer, contentContainer, feature, index, total) => {
  mediaContainer.appendChild(buildVideoEl(feature));
  const aboutEl = buildAboutEl(feature, index, total);
  contentContainer.appendChild(aboutEl);
  activateRectButtons(aboutEl);
};

/* Switch to a new feature with directional slide transition */
export const switchFeature = (mediaContainer, contentContainer, feature, direction, index, total) => {
  const oldMedia = mediaContainer.querySelector('.feature__media-frame');
  const oldContent = contentContainer.firstElementChild;
  const forward = direction >= 0;

  /* Media: forward enters from top, backward enters from bottom */
  slideTransition(mediaContainer, oldMedia, buildVideoEl(feature),
    forward ? "100%" : "-100%",
    forward ? "-100%" : "100%"
  );

  /* Content: forward enters from bottom, backward enters from top */
  const newAbout = buildAboutEl(feature, index, total);
  slideTransition(contentContainer, oldContent, newAbout,
    forward ? "-100%" : "100%",
    forward ? "100%" : "-100%"
  );
  activateRectButtons(newAbout);
};