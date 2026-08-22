# Artist Asset Convention

Each artist uses a lowercase kebab-case directory and the same semantic structure:

```text
{artist-slug}/
  profile/
    models/
  artworks/
    {artwork-slug}/
      images/
      media/
      models/
  collection/
  reimagined/
    images/
    models/
  supporters/
    audio/
    images/
    models/
    music/
    timelines/
    video/
```

Only create optional media directories when they contain files. Filenames must be lowercase kebab-case; language variants end in `-en`, `-fr`, or `-ar` before the extension. Optimized variants use a descriptive suffix such as `-compressed`, never `copy`, `final`, or an unexplained number.
