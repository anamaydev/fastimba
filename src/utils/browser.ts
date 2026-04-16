export const getBrowserStoreLink = () => {
  const isFirefox = navigator.userAgent.includes("Firefox");
  if (isFirefox) return "https://addons.mozilla.org/en-GB/firefox/"
  else return "https://chromewebstore.google.com/detail/lgjlpmdkdpbkcnkfpgighkdomjfkgpgc?utm_source=item-share-cb"
}