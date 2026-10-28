# Softline
A local-first PNG drawing smoother for iPad Safari and desktop browsers.

Run `npm ci`, then `npm run dev`. Build with `npm run build`; test with `npm test`.
Upload a PNG (up to 16 megapixels), compare Original / Smoothed, adjust strength and range, and save a PNG to Files for import into Procreate. Processing runs in a Web Worker; no image is uploaded. Output keeps original pixel dimensions and supports alpha. Edge smoothing changes edge alpha intentionally; it does not flatten the image.

MLAA processing is adapted from https://github.com/sabiasagimp4-ai/OLMSmootherYMM4, MIT licensed (see public/THIRD_PARTY_LICENSES.txt). This is independent of OLM Digital and does not claim pixel-identical results to official OLM Smoother v2. Strength is an added blend control; official gamma and Extra Smooth controls are not implemented. PNG export uses browser canvas and is 8-bit; layers, ICC profile metadata, and Procreate document data are not preserved. Import/export on a physical iPad still needs device validation.
