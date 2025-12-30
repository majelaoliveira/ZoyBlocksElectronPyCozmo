// src/renderer/utils/assetLoader.js
function loadCSS(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
}

async function loadAssetsGroup(assets) {
  for (const asset of assets) {
    if (asset.type === "css") await loadCSS(asset.path);
    else if (asset.type === "js") await loadScript(asset.path);
    else if (asset.type === "img") await loadImage(asset.path);
  }
}

module.exports = { loadCSS, loadScript, loadImage, loadAssetsGroup };
