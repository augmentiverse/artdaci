export function detectRuntimeProfile(environment = globalThis, webglCapabilities = null) {
  const navigatorLike = environment.navigator || {};
  const screenLike = environment.screen || {};
  const width = Number(environment.innerWidth || screenLike.width || 0);
  const height = Number(environment.innerHeight || screenLike.height || 0);
  const shortestSide = Math.min(width || Infinity, height || Infinity);
  const deviceMemory = Number(navigatorLike.deviceMemory);
  const userAgent = String(navigatorLike.userAgent || "");
  const coarsePointer = Boolean(environment.matchMedia?.("(pointer: coarse)")?.matches);
  const smallScreen = Number.isFinite(shortestSide) && shortestSide < 900;
  const lowMemory = Number.isFinite(deviceMemory) && deviceMemory > 0 && deviceMemory <= 4;
  const embeddedBrowser = /SmartTV|SMART-TV|Tizen|Web0S|WebOS|HbbTV|NetCast|Viera|BRAVIA|AFT[A-Z]|OculusBrowser|Meta Quest|Quest/i.test(userAgent);
  const limitedWebGL = Boolean(webglCapabilities) && (
    Number(webglCapabilities.maxTextureSize || Infinity) < 4096
    || Number(webglCapabilities.maxTextures || Infinity) < 8
  );
  const signals = [coarsePointer, smallScreen, lowMemory, limitedWebGL].filter(Boolean);
  const constrained = embeddedBrowser || limitedWebGL || signals.length >= 2;

  return Object.freeze({
    name: constrained ? "constrained" : "normal",
    constrained,
    reasons: Object.freeze({ coarsePointer, smallScreen, lowMemory, embeddedBrowser, limitedWebGL }),
    maxPixelRatio: constrained ? 1 : 2,
    targetFrameInterval: constrained ? 1000 / 30 : 0,
    bookTextureScale: constrained ? 0.625 : 1
  });
}
