# ARTDACI GEO KML 1.0

A public, portable, **geographical** layer for the 17 ARTDACI museum entries. No Google API key, panorama download, 3D model extraction, or Google Earth API is used.

- Canonical, sourced coordinate data: `data/museums.json`.
- Entire collection: `artdaci-museums.kml` (17 museums).
- Thematic collections: `artdaci-paris.kml`, `artdaci-renaissance.kml`, `artdaci-impressionism.kml`.
- Alternative web-map data: `artdaci-museums.geojson` (WGS84 longitude, latitude).
- Rebuild: `node geo/build-exports.mjs` from the repository root.

## Editorial policy

The KML placemarks identify **approximate museum/site positions**, not doors, Street View photo spheres, travel itineraries, or an assertion that an artwork is currently on public display. All 17 coordinate records link to a specific Wikidata item (which may itself cite an institutional source). Validate entrances and 3D/Street View availability before offering direct camera or panorama links.

The Renaissance and Impressionism collections are **artwork-linked thematic selections** based on ARTDACI, not an exhaustive inventory of each museum's holdings. Paris is a location collection. KML descriptions refer visitors to ARTDACI dossiers and avoid embedding third-party photographs.

Google Earth Web, Google Earth Pro and other KML applications may support different KML features. Shareable Google Earth projects must be created/shared separately in a Google account; publishing a KML does not automatically create a hosted project.

All geographic exports are regenerated from `data/museums.json` to keep IDs, profiles, coordinates and subjects aligned. Review changes to the 17-museum primary editorial atlas before modifying this dataset.

## Verification

Run `node geo/build-exports.mjs`, then check that the generated files do not differ from the committed exports. Import the KML manually into Google Earth and verify the 17 locations, especially the Last Supper site in Milan. The files do not create walking/driving directions or promise satellite 3D.

## Enriched information balloons (KML 2.0)

Each KML museum placemark now contains an HTML description inside CDATA, generated automatically from `museum-atlas/data/museums.json`. Information includes the museum's history, architecture, collections, ARTDACI artwork associations, official references and photographic source attribution. The balloon links directly to the detailed ARTDACI museum dossier, the GEO atlas, Google Maps, Street View, and the immersive museum experience for the six main museums.

`geo/data/artworks.json` is a checked registry of 12 existing ARTDACI artwork-page links from the six immersive museums. Only these artwork pages are individually linked; other paintings appear as editorial associations with a link to the museum dossier. No KML placemark claims to identify the physical position of an individual painting or its present wall display.

Descriptions are intentionally concise to keep them usable in KML applications, and all user-facing HTML fields are escaped before interpolation. Clickable balloon HTML is supported in many Google Earth clients, but Google Earth Web may simplify or restrict the content. The full ARTDACI museum and artwork pages remain the reliable fallback.

**Regenerate exports** after editing source data: `node geo/build-exports.mjs`. Verify generated KML and GeoJSON are committed together, import the KML in Google Earth, and test selected links in Earth Web and Google Earth Pro. The KML carries clickable URLs; it does not embed copyrighted Street View imagery or third-party 3D assets.
