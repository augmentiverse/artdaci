export const IMMERSIVE_ARTWORKS = Object.freeze([
  Object.freeze({ id: "ld01", slug: "mona-lisa", runtimeSlug: "mona-lisa", aliases: [], ar: true, space: true, vr: true }),
  Object.freeze({ id: "ve01", slug: "girl-with-a-pearl-earring", runtimeSlug: "vermeer-girl-with-a-pearl-earring", aliases: ["vermeer-girl-with-a-pearl-earring"], ar: true, space: true, vr: true }),
  Object.freeze({ id: "vg01", slug: "self-portrait", runtimeSlug: "van-gogh", aliases: ["van-gogh"], ar: true, space: true, vr: true }),
  Object.freeze({ id: "vg02", slug: "bedroom-in-arles", runtimeSlug: "van-gogh-bedroom", aliases: ["van-gogh-bedroom"], ar: true, space: true, vr: true })
]);

export function resolveImmersiveArtworkRoute(requestedSlug, experience) {
  if (!["ar", "space", "vr"].includes(experience)) return null;

  const requested = requestedSlug === null ? "mona-lisa" : String(requestedSlug).trim();
  if (!requested) return null;

  const artwork = IMMERSIVE_ARTWORKS.find((candidate) =>
    candidate.id === requested
    || candidate.slug === requested
    || candidate.aliases.includes(requested)
  );
  if (!artwork || !artwork[experience]) return null;

  return {
    artworkId: artwork.id,
    canonicalSlug: artwork.slug,
    runtimeSlug: artwork.runtimeSlug,
    kind: requestedSlug === null
      ? "default"
      : artwork.aliases.includes(requested) ? "alias" : "canonical"
  };
}

export async function classifyUnresolvedArtworkRoute(requestedSlug, fetchImpl = fetch) {
  const requested = String(requestedSlug || "").trim();
  if (!requested) return "unknown";

  try {
    const response = await fetchImpl("content/media-manifests/catalog.json", {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!response.ok) return "unknown";
    const catalog = await response.json();
    const known = (catalog.artworks || []).some((artwork) =>
      artwork.status === "active" && (artwork.id === requested || artwork.slug === requested)
    );
    return known ? "unsupported" : "unknown";
  } catch {
    return "unknown";
  }
}
