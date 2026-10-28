# Softline
A local-first PNG drawing smoother for iPad Safari and desktop browsers.

Run `npm ci`, then `npm run dev`. Build with `npm run build`; test with `npm test`.
Upload a PNG (up to 16 megapixels), compare Original / Smoothed in the movable dark settings panel, enter smoothness (default 100) and range (default 20), and save a PNG to Files for import into Procreate. Processing runs in a Web Worker; no image is uploaded. Output keeps original pixel dimensions and supports alpha. Edge smoothing changes edge alpha intentionally; it does not flatten the image.

MLAA processing is adapted from https://github.com/sabiasagimp4-ai/OLMSmootherYMM4, MIT licensed (see public/THIRD_PARTY_LICENSES.txt). This is independent of OLM Digital and does not claim pixel-identical results to official OLM Smoother v2. Strength is an added blend control; official gamma and Extra Smooth controls are not implemented. PNG export uses browser canvas and is 8-bit; layers, ICC profile metadata, and Procreate document data are not preserved. Import/export on a physical iPad still needs device validation.

Workspace: scroll wheel zooms around the pointer; middle-button drag pans. Touch supports drag and two-finger pinch. Fit restores the view. Drag the settings panel by its header. The optional background color defaults to white and affects only the preview; the checkerboard remains underneath. Smoothness and range have no input maximum. Smoothness above 100 adds full smoothing passes plus a fractional final pass (150 = one full pass plus a half-strength pass). Very large values take longer; changing a setting cancels the running worker. Smooth range is a normalized 8-bit color threshold, so values of 255 or greater detect no edges.
