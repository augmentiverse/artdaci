import test from "node:test";
import assert from "node:assert/strict";

const navigations = [];

globalThis.document = {
  documentElement: { lang: "en" },
  querySelectorAll() {
    return [];
  },
};
globalThis.window = {
  location: {
    assign(url) {
      navigations.push(url);
    },
  },
};

const { applyArtworkMedia, loadArtworkMedia } = await import(
  "../scripts/artwork-media-manifest.js?dom-audio-fallback-test"
);

const REMOTE_BASE = "https://media.artdaci.com/artworks/test/";

class FakeElement {
  constructor(tagName, attributes = {}, dataset = {}) {
    this.tagName = tagName;
    this.dataset = dataset;
    this.attributes = new Map(Object.entries(attributes));
    this.listeners = new Map();
    this.complete = false;
    this.naturalWidth = 1;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  addEventListener(type, listener, options = {}) {
    const listeners = this.listeners.get(type) || [];
    listeners.push({ listener, once: Boolean(options.once) });
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, listeners.filter((entry) => entry.listener !== listener));
  }

  listenerCount(type) {
    return (this.listeners.get(type) || []).length;
  }

  async dispatch(type, overrides = {}) {
    const event = {
      type,
      button: 0,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      isTrusted: true,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...overrides,
    };
    const listeners = [...(this.listeners.get(type) || [])];

    await Promise.all(listeners.map(async (entry) => {
      await entry.listener(event);
      if (entry.once) this.removeEventListener(type, entry.listener);
    }));
    await new Promise((resolve) => setImmediate(resolve));
    return event;
  }
}

class FakeRoot {
  constructor(elements, manifestUrl = "") {
    this.elements = elements;
    this.dataset = { artworkMediaManifest: manifestUrl };
  }

  querySelectorAll(selector) {
    return selector === "[data-artwork-media]" ? this.elements : [];
  }
}

function audioManifest(overrides = {}) {
  return {
    defaultLanguage: "en",
    mediaBaseUrl: REMOTE_BASE,
    media: {
      audio: {
        guide: {
          en: {
            scope: "artwork",
            path: "audio/en/guide.mp3",
            mimeType: "audio/mpeg",
            available: true,
            ...overrides,
          },
          fr: {
            scope: "artwork",
            path: "audio/fr/guide.mp3",
            mimeType: "audio/mpeg",
            available: true,
            ...overrides,
          },
        },
      },
    },
  };
}

function audioLink(language = "en", attributes = {}) {
  return new FakeElement(
    "A",
    { href: `assets/audio/${language}/guide.mp3`, ...attributes },
    { artworkMedia: `audio.guide.${language}` },
  );
}

function response(status, contentType = "audio/mpeg", json) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    headers: { get: (name) => name.toLowerCase() === "content-type" ? contentType : null },
    body: { cancel: async () => {} },
    json: json || (async () => audioManifest()),
  };
}

function resetNavigation() {
  navigations.length = 0;
}

test("normal click probes with one-byte Range only after interaction and keeps R2 on success", async () => {
  resetNavigation();
  const link = audioLink();
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return response(206);
  };

  applyArtworkMedia(new FakeRoot([link]), audioManifest());

  assert.equal(requests.length, 0);
  assert.equal(link.getAttribute("href"), `${REMOTE_BASE}audio/en/guide.mp3`);

  const firstClick = await link.dispatch("click");
  assert.equal(firstClick.defaultPrevented, true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.method, "GET");
  assert.equal(requests[0].options.headers.Range, "bytes=0-0");
  assert.equal(requests[0].options.cache, "no-store");
  assert.equal(requests[0].options.credentials, "omit");
  assert.equal(requests[0].options.mode, "cors");
  assert.deepEqual(navigations, [`${REMOTE_BASE}audio/en/guide.mp3`]);

  const secondClick = await link.dispatch("click");
  assert.equal(secondClick.defaultPrevented, false);
  assert.equal(requests.length, 1);
});

for (const status of [404, 500]) {
  test(`HTTP ${status} restores the local href and continues the same activation`, async () => {
    resetNavigation();
    const link = audioLink();
    let requestCount = 0;
    globalThis.fetch = async () => {
      requestCount += 1;
      return response(status, "text/html");
    };

    applyArtworkMedia(new FakeRoot([link]), audioManifest());
    const click = await link.dispatch("click");

    assert.equal(click.defaultPrevented, true);
    assert.equal(link.getAttribute("href"), "assets/audio/en/guide.mp3");
    assert.deepEqual(navigations, ["assets/audio/en/guide.mp3"]);
    assert.equal(requestCount, 1);

    const retry = await link.dispatch("click");
    assert.equal(retry.defaultPrevented, false);
    assert.equal(requestCount, 1);
  });
}

for (const failure of ["network", "CORS"]) {
  test(`${failure} failure restores the local href without a loop`, async () => {
    resetNavigation();
    const link = audioLink();
    let requestCount = 0;
    globalThis.fetch = async () => {
      requestCount += 1;
      throw new TypeError(`${failure} blocked`);
    };

    applyArtworkMedia(new FakeRoot([link]), audioManifest());
    await link.dispatch("click");
    await link.dispatch("click");

    assert.equal(link.getAttribute("href"), "assets/audio/en/guide.mp3");
    assert.deepEqual(navigations, ["assets/audio/en/guide.mp3"]);
    assert.equal(requestCount, 1);
  });
}

test("missing, invalid and unavailable manifest media leave the local href untouched", async () => {
  resetNavigation();
  const unavailable = audioLink();
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return response(206);
  };

  applyArtworkMedia(new FakeRoot([unavailable]), audioManifest({ available: false }));
  applyArtworkMedia(new FakeRoot([audioLink()]), { ...audioManifest(), media: {} });
  assert.equal(unavailable.getAttribute("href"), "assets/audio/en/guide.mp3");
  assert.equal(requestCount, 0);

  const missingManifestLink = audioLink();
  globalThis.fetch = async () => response(404, "text/html");
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    await loadArtworkMedia(new FakeRoot([missingManifestLink], "https://example.test/missing.json"));
    assert.equal(missingManifestLink.getAttribute("href"), "assets/audio/en/guide.mp3");

    const invalidManifestLink = audioLink();
    globalThis.fetch = async () => response(200, "application/json", async () => {
      throw new SyntaxError("invalid JSON");
    });
    await loadArtworkMedia(new FakeRoot([invalidManifestLink], "https://example.test/invalid.json"));
    assert.equal(invalidManifestLink.getAttribute("href"), "assets/audio/en/guide.mp3");
  } finally {
    console.warn = originalWarn;
  }
});

test("keyboard activation follows the same verified fallback path", async () => {
  resetNavigation();
  const link = audioLink("fr");
  globalThis.fetch = async () => response(404, "text/html");
  applyArtworkMedia(new FakeRoot([link]), audioManifest());

  const keyboardClick = await link.dispatch("click", { detail: 0 });

  assert.equal(keyboardClick.defaultPrevented, true);
  assert.equal(link.getAttribute("href"), "assets/audio/fr/guide.mp3");
  assert.deepEqual(navigations, ["assets/audio/fr/guide.mp3"]);
});

test("modified, auxiliary, new-target and download activations remain native", async () => {
  const cases = [
    { type: "click", event: { ctrlKey: true } },
    { type: "click", event: { metaKey: true } },
    { type: "click", event: { shiftKey: true } },
    { type: "click", event: { isTrusted: false } },
    { type: "auxclick", event: { button: 1 } },
    { type: "click", attributes: { target: "_blank" } },
    { type: "click", attributes: { download: "guide.mp3" } },
  ];
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return response(206);
  };

  for (const item of cases) {
    const link = audioLink("en", item.attributes);
    applyArtworkMedia(new FakeRoot([link]), audioManifest());
    const event = await link.dispatch(item.type, item.event);
    assert.equal(event.defaultPrevented, false);
  }

  assert.equal(requestCount, 0);
});

test("repeated initialization installs one handler and two links remain independent", async () => {
  resetNavigation();
  const english = audioLink("en");
  const french = audioLink("fr");
  const root = new FakeRoot([english, french]);
  let requestCount = 0;
  globalThis.fetch = async () => {
    requestCount += 1;
    return response(206);
  };

  applyArtworkMedia(root, audioManifest());
  applyArtworkMedia(root, audioManifest());

  assert.equal(english.listenerCount("click"), 1);
  assert.equal(french.listenerCount("click"), 1);
  await english.dispatch("click");
  await french.dispatch("click");
  assert.equal(requestCount, 2);
  assert.deepEqual(navigations, [
    `${REMOTE_BASE}audio/en/guide.mp3`,
    `${REMOTE_BASE}audio/fr/guide.mp3`,
  ]);
});

test("concurrent activations share one probe and navigate once", async () => {
  resetNavigation();
  const link = audioLink();
  let resolveFetch;
  let requestCount = 0;
  globalThis.fetch = () => {
    requestCount += 1;
    return new Promise((resolve) => {
      resolveFetch = () => resolve(response(206));
    });
  };

  applyArtworkMedia(new FakeRoot([link]), audioManifest());
  const first = link.dispatch("click");
  const second = link.dispatch("click");
  resolveFetch();
  await Promise.all([first, second]);

  assert.equal(requestCount, 1);
  assert.deepEqual(navigations, [`${REMOTE_BASE}audio/en/guide.mp3`]);
});

test("the existing one-shot image fallback is unchanged", async () => {
  const image = new FakeElement(
    "IMG",
    { src: "assets/images/local.jpg" },
    { artworkMedia: "images.main" },
  );
  const manifest = {
    mediaBaseUrl: REMOTE_BASE,
    media: {
      images: {
        main: {
          scope: "artwork",
          path: "images/main.jpg",
          mimeType: "image/jpeg",
          available: true,
        },
      },
    },
  };

  applyArtworkMedia(new FakeRoot([image]), manifest);
  assert.equal(image.getAttribute("src"), `${REMOTE_BASE}images/main.jpg`);
  await image.dispatch("error");
  assert.equal(image.getAttribute("src"), "assets/images/local.jpg");
  assert.equal(image.listenerCount("error"), 0);
});
