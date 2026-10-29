import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type webgazer from 'webgazer';
import { getHeadPose, getHeadTarget } from './esgrimaHeadPose';

// WebGazer owns global DOM nodes. Serialize sessions, including pending camera prompts.
let session = Promise.resolve();
const photoLabels = ['foto principal', 'máscara izquierda', 'máscara derecha'];

export default function EsgrimaEyeTracking({ stageRef, onClose, onReadyChange }: {
  stageRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onReadyChange: (ready: boolean) => void;
}) {
  const trackerRef = useRef<typeof webgazer | null>(null);
  const calibrated = useRef(false);
  const lastFace = useRef(0);
  const lastSample = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const headReferences = useRef<{ x: number; y: number }[]>([]);
  const captureRequested = useRef(false);
  const centering = useRef<{ x: number; y: number; count: number; start: number } | null>(null);
  const [mode, setMode] = useState<'eyes' | 'head' | null>(null);
  const [phase, setPhase] = useState<'choice' | 'loading' | 'calibration' | 'centering' | 'active' | 'error'>('choice');
  const [centerProgress, setCenterProgress] = useState(0);
  const [samples, setSamples] = useState(0);
  const [referenceStep, setReferenceStep] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [calibrationMessage, setCalibrationMessage] = useState('');
  const [photoCenters, setPhotoCenters] = useState<{ x: number; y: number }[]>([]);
  const [error, setError] = useState('');
  const [faceMissing, setFaceMissing] = useState(false);

  useLayoutEffect(() => {
    onReadyChange(phase === 'active');
    return () => onReadyChange(false);
  }, [phase, onReadyChange]);

  useEffect(() => {
    if (!mode) return;
    let cancelled = false;
    let ready = false;
    let release = () => {};
    let expiry: ReturnType<typeof setTimeout> | undefined;
    const clearMasks = () => stageRef.current?.querySelectorAll('[data-gaze-active]').forEach((image) => image.removeAttribute('data-gaze-active'));
    const stop = (tracker: typeof webgazer) => {
      tracker.clearGazeListener().removeMouseEventListeners().pause();
      const video = document.getElementById('webgazerVideoFeed') as HTMLVideoElement | null;
      (video?.srcObject as MediaStream | null)?.getTracks().forEach((track) => track.stop());
      if (document.getElementById('webgazerGazeDot')) tracker.end();
      else document.getElementById('webgazerVideoContainer')?.remove();
    };

    session = session.catch(() => {}).then(async () => {
      if (cancelled) return;
      let tracker: typeof webgazer | undefined;
      try {
        if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
          throw new Error('La cámara requiere HTTPS o localhost y un navegador compatible.');
        }
        tracker = (await import('webgazer')).default;
        if (cancelled) return;
        trackerRef.current = tracker;
        tracker.params.faceMeshSolutionPath = '/eye-models';
        tracker.saveDataAcrossSessions(false).showVideoPreview(false).showPredictionPoints(false).applyKalmanFilter(true);
        await tracker.clearData();
        let smoothed: { x: number; y: number } | null = null;
        let candidate = -1;
        let since = 0;
        let lastPositions: number[][] | null = null;
        tracker.setGazeListener((point) => {
          if (cancelled) return;
          const positions = tracker!.getTracker().getPositions();
          const freshFace = !!positions && positions !== lastPositions;
          if (freshFace) lastFace.current = performance.now();
          lastPositions = positions;
          clearTimeout(expiry);
          expiry = setTimeout(() => {
            candidate = -1;
            smoothed = null;
            centering.current = null;
            setCenterProgress(0);
            clearMasks();
            setFaceMissing(true);
          }, 700);
          const pose = mode === 'head' && freshFace ? getHeadPose(positions) : null;
          const missing = mode === 'head' ? !pose : calibrated.current
            ? !point || !Number.isFinite(point.x) || !Number.isFinite(point.y)
            : !lastFace.current || performance.now() - lastFace.current > 700;
          if (missing) {
            smoothed = null;
            candidate = -1;
            centering.current = null;
            setCenterProgress(0);
            clearMasks();
            setFaceMissing(true);
            return;
          }
          setFaceMissing(false);
          if (!calibrated.current) {
            smoothed = null;
            candidate = -1;
            if (mode === 'head' && pose && ready && captureRequested.current) {
              const current = centering.current;
              if (!current || Math.abs(pose.x - current.x / current.count) > 0.05 || Math.abs(pose.y - current.y / current.count) > 0.05) {
                centering.current = { ...pose, count: 1, start: performance.now() };
                setCenterProgress(0);
                return;
              }
              current.x += pose.x;
              current.y += pose.y;
              current.count++;
              const elapsed = performance.now() - current.start;
              setCenterProgress(Math.min(100, Math.floor(elapsed / 100) * 5));
              if (elapsed >= 2000 && current.count >= 15) {
                const reference = { x: current.x / current.count, y: current.y / current.count };
                captureRequested.current = false;
                centering.current = null;
                setCapturing(false);
                setCenterProgress(0);
                if (headReferences.current.some((other) => Math.hypot(reference.x - other.x, reference.y - other.y) < 0.04)) {
                  setCalibrationMessage('Esta orientación se parece demasiado a otra registrada. Orienta un poco más la cabeza hacia el centro señalado y vuelve a pulsarlo.');
                  return;
                }
                headReferences.current.push(reference);
                setCalibrationMessage('');
                setReferenceStep(headReferences.current.length);
                if (headReferences.current.length === photoLabels.length) {
                  calibrated.current = true;
                  setPhase('active');
                }
              }
            }
            return;
          }
          const images = Array.from(stageRef.current?.querySelectorAll<HTMLElement>('.esgrima__mask-photo') ?? []);
          let target = -1;
          const input = mode === 'head' ? pose : point;
          if (!input) return;
          smoothed = smoothed ? { x: smoothed.x * 0.65 + input.x * 0.35, y: smoothed.y * 0.65 + input.y * 0.35 } : input;
          if (mode === 'head') {
            target = getHeadTarget(smoothed, headReferences.current, candidate);
          } else {
            target = images.findIndex((image) => {
              const bounds = image.getBoundingClientRect();
              return smoothed!.x >= bounds.left && smoothed!.x <= bounds.right && smoothed!.y >= bounds.top && smoothed!.y <= bounds.bottom;
            });
          }
          if (target !== candidate) {
            candidate = target;
            since = performance.now();
            clearMasks();
          }
          if (target >= 0 && performance.now() - since >= 300) images[target]?.setAttribute('data-gaze-active', 'true');
        });
        await tracker.begin();
        tracker.removeMouseEventListeners();
        if (cancelled) return;
        ready = true;
        setPhase(mode === 'head' ? 'centering' : 'calibration');
        await new Promise<void>((resolve) => { release = resolve; });
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof DOMException && cause.name === 'NotAllowedError'
            ? 'No se ha autorizado la cámara. Puedes cerrar este mensaje y seguir usando el cursor.'
            : cause instanceof Error ? cause.message : 'No se pudo iniciar el seguimiento. Comprueba la cámara e inténtalo de nuevo.');
          setPhase('error');
        }
      } finally {
        if (tracker) stop(tracker);
        trackerRef.current = null;
      }
    });

    return () => {
      cancelled = true;
      calibrated.current = false;
      clearTimeout(expiry);
      clearMasks();
      release();
    };
  }, [stageRef, mode]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (!calibrated.current && event.key.startsWith('Arrow')) event.stopImmediatePropagation();
      if (event.key === 'Tab' && dialogRef.current) {
        const buttons = Array.from(dialogRef.current.querySelectorAll('button'));
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault();
        buttons[(current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
      }
    };
    window.addEventListener('keydown', close, true);
    return () => window.removeEventListener('keydown', close, true);
  }, [onClose]);

  const calibrating = phase === 'calibration' || phase === 'centering';
  const pointIndex = mode !== 'eyes' ? referenceStep : Math.floor(samples / 5);
  useLayoutEffect(() => {
    if (!calibrating) return;
    const stage = stageRef.current;
    const overlay = dialogRef.current;
    if (!stage || !overlay) return;
    stage.setAttribute('data-calibrating', 'true');
    const update = () => {
      const origin = overlay.getBoundingClientRect();
      const images = [stage.querySelector('.esgrima__primary-image'), ...stage.querySelectorAll('.esgrima__mask-photo')];
      setPhotoCenters(images.filter((image): image is Element => image !== null).map((image) => {
        const bounds = image.getBoundingClientRect();
        return { x: bounds.left + bounds.width / 2 - origin.left, y: bounds.top + bounds.height / 2 - origin.top };
      }));
    };
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    stage.querySelectorAll('img').forEach((image) => observer.observe(image));
    stage.addEventListener('load', update, true);
    update();
    return () => {
      observer.disconnect();
      stage.removeEventListener('load', update, true);
      stage.removeAttribute('data-calibrating');
    };
  }, [calibrating, stageRef]);

  useEffect(() => {
    const container = phase === 'active' ? statusRef.current : dialogRef.current;
    (container?.querySelector<HTMLButtonElement>('.esgrima__calibration-point') ?? container?.querySelector<HTMLButtonElement>('button'))?.focus();
  }, [phase, pointIndex, photoCenters]);

  const resetCalibration = () => {
    calibrated.current = false;
    headReferences.current = [];
    captureRequested.current = false;
    centering.current = null;
    lastFace.current = 0;
    lastSample.current = 0;
    stageRef.current?.querySelectorAll('[data-gaze-active]').forEach((image) => image.removeAttribute('data-gaze-active'));
    setSamples(0);
    setReferenceStep(0);
    setCapturing(false);
    setCalibrationMessage('');
    setCenterProgress(0);
    setFaceMissing(false);
  };

  const center = photoCenters[pointIndex];
  return (
    <>
      {phase !== 'active' ? (
        <div ref={dialogRef} className={`esgrima__eye-overlay${calibrating ? ' esgrima__eye-overlay--calibration' : ''}`} role="dialog" aria-modal="true" aria-labelledby="eye-title">
          <div className={`esgrima__eye-instructions${calibrating ? ' esgrima__eye-instructions--calibration' : ' esgrima__eye-instructions--centered'}`}>
            <h2 id="eye-title">{phase === 'choice' ? 'Elige cómo interactuar' : phase === 'loading' ? 'Preparando la cámara' : phase === 'error' ? 'Seguimiento no disponible' : phase === 'centering' ? 'Calibra el movimiento de cabeza' : 'Calibra tu mirada'}</h2>
            {phase === 'choice' ? (
              <>
                <p>Elige mirada o movimiento de cabeza. La cámara solo se solicitará al elegir un modo.</p>
                <div className="esgrima__tracking-options">
                  <button type="button" onClick={() => { resetCalibration(); setPhase('loading'); setMode('eyes'); }}>
                    <strong>Mirada</strong><span>Calibración en el centro de las tres fotos</span>
                  </button>
                  <button type="button" onClick={() => { resetCalibration(); setPhase('loading'); setMode('head'); }}>
                    <strong>Movimiento de cabeza</strong><span>Una orientación para el centro de cada foto</span>
                  </button>
                </div>
              </>
            ) : <p>{phase === 'loading' ? 'Autoriza la cámara. El vídeo se procesa en este navegador y no se envía a un servidor.' : phase === 'error' ? error : phase === 'centering'
              ? `Foto ${pointIndex + 1} de ${photoLabels.length}: ${photoLabels[pointIndex]}. Orienta la cabeza hacia su centro, pulsa el punto y mantén la posición durante dos segundos.` : `Foto ${pointIndex + 1} de ${photoLabels.length}: ${photoLabels[pointIndex]}. Sin mover la cabeza, mira el punto central y púlsalo cinco veces.`}</p>}
            {phase === 'centering' && (
              <>
                <progress className="esgrima__head-progress" max={100} value={centerProgress} aria-label="Registro de orientación de cabeza" />
                <p role="status">{faceMissing ? 'No se detecta el rostro. Colócate frente a la cámara con buena iluminación.' : calibrationMessage || (capturing ? `Mantén la posición: ${centerProgress}%` : 'Pulsa el punto central cuando estés preparado.')}</p>
              </>
            )}
            {phase === 'calibration' && faceMissing && <p role="status">No se detectan tus ojos. Mira de frente a la cámara con buena iluminación.</p>}
            <button type="button" onClick={onClose}>Volver al cursor</button>
          </div>
          {calibrating && center && (
            <button
              key={pointIndex}
              type="button"
              className="esgrima__calibration-point"
              style={{ left: center.x, top: center.y }}
              aria-label={mode === 'head' ? `Registrar centro de ${photoLabels[pointIndex]}` : `Centro de ${photoLabels[pointIndex]}, pulsación ${samples % 5 + 1} de 5`}
              aria-disabled={mode === 'head' && capturing}
              onClick={(event) => {
                const tracker = trackerRef.current;
                if (!tracker || !lastFace.current || performance.now() - lastFace.current > 700) { setFaceMissing(true); return; }
                if (mode === 'head') {
                  if (captureRequested.current) return;
                  captureRequested.current = true;
                  centering.current = null;
                  setCapturing(true);
                  setCalibrationMessage('');
                  return;
                }
                if (performance.now() - lastSample.current < 200) return;
                lastSample.current = performance.now();
                setFaceMissing(false);
                const bounds = event.currentTarget.getBoundingClientRect();
                tracker!.recordScreenPosition(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 'click');
                const nextSamples = samples + 1;
                setSamples(nextSamples);
                if (nextSamples === photoLabels.length * 5) {
                  calibrated.current = true;
                  setPhase('active');
                }
              }}
            >{mode === 'head' ? capturing ? `${Math.ceil((100 - centerProgress) / 50)}` : '+' : 5 - samples % 5}</button>
          )}
        </div>
      ) : (
        <p ref={statusRef} className="esgrima__eye-status" role="status">
          {mode === 'head'
            ? faceMissing ? 'No se detecta el rostro. Mira de frente a la cámara.' : 'Cabeza activa. Orienta la cabeza hacia cada foto; la foto central apaga las máscaras.'
            : faceMissing ? 'No se detecta la mirada. Mira de frente a la cámara.' : 'Mirada activa. Mantén la cabeza en la posición de calibración.'}
          {' '}<button type="button" onClick={() => {
            resetCalibration();
            setPhase(mode !== 'eyes' ? 'centering' : 'calibration');
            if (mode === 'eyes') void trackerRef.current?.clearData();
          }}>Recalibrar</button>
          {' '}<button type="button" onClick={() => { resetCalibration(); setMode(null); setPhase('choice'); }}>Cambiar modo</button>
        </p>
      )}
    </>
  );
}
