# React + TypeScript + Vite

## Esgrima: Automatic Playback

The exhibition's Play button starts automatic advancement from the current photo
after 15 seconds. It becomes Stop while playback is enabled. Playback never
starts just by opening the page and stops when leaving the exhibition. The
Proyecto y creditos link still returns to the project presentation.

Use `/esgrima?time=15#exposicion` for a 15-second interval, or combine it with
tracking using `/esgrima?eye=true&time=45#exposicion`. `time` is expressed in
seconds; missing, empty, non-finite, zero, negative or timer-overflowing values
fall back to 15 seconds. Positive fractional seconds are supported.

Manual navigation by photo click, arrows or slider restarts the full interval.
Automatic playback wraps around at the last photo and renews the masks. While
the tracking selector, loading, calibration or error dialog is open, playback
waits without changing the photos. It resumes with a full interval when tracking
becomes active or is closed, provided playback was still enabled.

## Esgrima: Experimental Eye Tracking

Open `/esgrima?eye=true#exposicion` on a screen at least 1024 px wide. The eye
button offers Mirada (eyes) and Movimiento de cabeza (head).
Camera access and model loading begin only after choosing a mode. The main
portrait moves to the center, with one mask on the left and one on the right,
all three vertically centered. This simplified layout applies to eyes and head
interaction only; the normal exhibition retains its four-mask grid.

Both modes calibrate at the actual center of the three photographs: the main
portrait first, then the left mask and the right mask.
Photographs stay visible during calibration. Targets are measured from the image
elements and updated when they load or their layout changes, not fixed screen
percentages.

Mirada records five clicks at each photo center while looking at the target
(15 samples). A 300 ms gaze fixation activates a mask's opacity.

Movimiento de cabeza learns one orientation per photo, without ocular
calibration. Orient the head toward the marked photo center, click the target,
then hold still for two seconds (at least 15 frames). Each photo requires an
explicit capture; orientations that are too similar must be repeated. The main
portrait provides the neutral reference that deactivates all masks. Matching uses
the three learned orientations instead of generic quadrant thresholds. Horizontal
turns toward the left or right photo do not require tilting up or down.
The face-plane normal uses the forehead, chin and lateral cheek landmarks,
independent of gaze predictions. Smoothing, a neutral reference, matching
tolerances and a 300 ms dwell reduce accidental activations. Stale or
missing face landmarks deactivate the masks, even if WebGazer retains old data.
This is an approximate relative orientation, not a calibrated 3D pose measurement.

The normal exhibition and mouse hover remain unchanged until this mode is
activated. Turn it off with the eye button or Escape. Leaving the exhibition or
resizing the window also stops it; changing viewport geometry requires a new
calibration. Use Recalibrar for a new visitor or after moving
the camera/head. Cambiar modo returns to the selector and stops the camera;
there is no automatic switching between tracking modes.

HTTPS (or localhost), camera permission, good lighting and a steady head position
are required. Camera frames are processed in the browser, calibration is not
saved across sessions, and face models are served locally from `/eye-models/` in
development and production. WebGazer is only loaded after selecting a tracking
mode. Head tracking does not
require valid pupil patches or a valid gaze prediction, but it still requires a
face large enough for MediaPipe to detect; there is no guaranteed camera distance.

This integration uses WebGazer 3.5.3, licensed GPL-3.0-or-later. Review its license
and source-distribution obligations for this application's intended publication
before deployment. This integration does not relicense the rest of the project.
Webcam gaze estimates are approximate and must be validated with real visitors;
automated gaze inputs cannot establish real-world tracking accuracy.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
