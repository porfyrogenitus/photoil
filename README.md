# Photoil — The Photographic Atelier

**Photoil** (photograph + oil painting) is a private, browser-based photographic editor inspired by Pre-Raphaelite visual culture, Romantic landscape painting, and nineteenth-century photographic processes. It is designed to make photographic imagery feel painterly through controlled colour, light, and atmosphere — not by applying a crude oil-paint filter.

## Open the atelier

**GitHub Pages (when enabled):** https://porfyrogenitus.github.io/photoil/

The entire editor runs locally in the browser. Images are **not uploaded to a server**. There are no accounts, trackers, image-processing APIs, cloud storage, or runtime package dependencies.

### Editing features

- **Light:** exposure, contrast, highlights, shadows, white and black controls.
- **Levels and curves:** black point, white point, gamma, and a draggable five-point RGB tone curve.
- **Colour:** temperature, tint, vibrance, saturation, independent eight-colour HSL mix, and three-way colour grading (shadows/midtones/highlights).
- **Atmosphere:** clarity, texture, dehaze, Orton-style glow and sharpness.
- **Finishing:** vignette, grain and grain size.
- **Regional adjustments:** separate **sky**, **ground**, **subject** and **brush-only** masks, each with exposure, contrast, colour, clarity, and dehaze controls. Horizon and transition softness are adjustable; subjects use a moveable, resizable feathered elliptical region. A paint/erase brush refines each mask.
- **Curated looks:** Unvarnished, The Gilded Hour, Ophelia's Garden, Rossetti Reverie, Ruskin Study, Vesper Nocturne, Antique Albumen, Woodland Psalm, Gothic Bloom.
- **Workflow:** original/edited split comparison, zoom, undo/redo (45 history snapshots), drag-and-drop image opening, reusable JSON editing recipes, histogram.
- **Export:** original-resolution JPEG, PNG, or WebP; optional maximum-edge size and adjustable JPEG/WebP quality. Original pixels are never overwritten.
- **Phones and tablets:** responsive layout and touch-enabled masks/sliders.

### Editing terminology and limitations

This is a **non-destructive, raster-based tonal editor**, not a generative painting model. The internal processing is browser sRGB 8-bit and output files do not preserve original camera EXIF/ICC metadata; camera RAW, wide-gamut and fully colour-managed 16-bit workflows are not supported in v1. The controls called **clarity**, **dehaze** and **glow** are computational approximations, not licensed replicas of Lightroom's proprietary algorithms. The **sky** and **ground** masks use a manually adjustable horizon gradient, not neural-network semantic segmentation; the **subject** mask uses a feathered ellipse. Brush strokes can add or erase areas in any region. Very large original-resolution exports (above 36 megapixels) are refused to protect browser memory; the size dropdown offers alternatives.

### Use

1. Open the app, choose or drop a photograph.
2. Select a curated look (optional). Open **Global** adjustments to fine-tune tone and colour. Click section headings to reveal controls.
3. Open **Local masks** to select Sky, Ground, Subject or Brush only. Set the region boundary, or choose **Paint +** / **Erase** and brush directly over the image. The gold tint previews your mask; switch it off to assess the result. Each region keeps its own local adjustment settings.
4. Use **Compare** to view the original on the left and edited image on the right. Click along the photo to reposition the split.
5. Export the final image or **Save recipe** to edit another photograph later. Import a recipe from the preset sidebar.

Tip: click an individual control label to reset just that setting (the labels are reset buttons). Use `Ctrl/⌘ + Z` to undo and `Ctrl/⌘ + Shift + Z` to redo.

## Run locally

A static HTTP server is required because module workers do not run reliably from `file://` URLs. No dependency installation is needed.

```bash
python3 -m http.server 5173
# Open http://localhost:5173
```

Run checks with `npm run check` (Node.js 20+).

## Publish to GitHub Pages

The repository includes `.github/workflows/pages.yml`, which tests and publishes the static files on each push to `main`. **One-time settings step:** open [Repository → Settings → Pages](https://github.com/porfyrogenitus/photoil/settings/pages), and under **Build and deployment → Source**, choose **GitHub Actions**. GitHub's Pages configuration is not accessible through this app's code. Once enabled, open **Actions → Test and deploy Photoil** for verification. Site URL: `https://porfyrogenitus.github.io/photoil/`.

If you prefer branch-based deployment, choose **Deploy from a branch → main → /(root)** instead. In that mode, GitHub Pages can serve this dependency-free project directly without the action; do not use both publishing methods simultaneously.

## Architecture

- `index.html` and `styles.css`: accessibility-oriented responsive atelier interface.
- `src/main.js`: non-destructive editor state, history, tools, mask painting, import/export UI.
- `src/presets.js`: adjustment schema and nine editable looks.
- `src/engine.js`: pixel transforms, HSL, levels, curves, grading, mask geometry and deterministic grain.
- `src/worker.js`: background image decode, reduced-resolution preview, masks and full-resolution export using OffscreenCanvas.
- `tests/engine.test.js`: Node's built-in tests for core maths and transformations.
- `.github/workflows/pages.yml`: test-gated automatic deployment.

Image-processing performance is preview-first: real-time previews are limited to a maximum 1600-pixel edge; exports are recalculated from the original image at the selected resolution in a separate worker. Brush strokes and recipe settings use normalised coordinates so they scale properly to the full-resolution export.

## Privacy and accessibility

Image processing stays on the device and uses no external library or CDN. Your photograph is not persisted in browser storage. Save the exported image and recipe yourself if you wish to keep them. The application uses semantic buttons and keyboard-accessible sliders. Some tasks, including direct mask painting and tonal-curve manipulation, are pointer-based in v1.

## License

MIT — see [LICENSE](LICENSE).
