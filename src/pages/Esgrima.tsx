import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Eye, Play, Square } from 'lucide-react';
import EsgrimaEyeTracking from './EsgrimaEyeTracking';
import './Esgrima.css';

const photos = Object.values(
  import.meta.glob<string>('/public/esgrima/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
).sort();

const maskPhotos = Object.values(
  import.meta.glob<string>('/public/esgrima/photos/mask/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
).sort();

const photographers = [
  'Ángela Cuesta',
  'Arse Buzz',
  'Clara Carrera',
  'Giovanny Arias',
  'Javier Ruiz',
  'Jesús Simarro',
  'Miguel López',
  'Nuria Martin',
  'Patricia Campos',
  'Raquel Polo',
  'Rubén Nieto',
  'Soraya Yela',
  'Teo Calcerrada',
  'Teresa Ariste',
];

const photographerLinks: Record<string, string> = {
  'Ángela Cuesta': 'https://www.instagram.com/angelacuesta6/',
  'Arse Buzz': 'https://www.instagram.com/arse_buzz/',
  'Miguel López': 'https://www.instagram.com/mlosanzphoto/',
  'Patricia Campos': 'https://www.instagram.com/pcam_photography/',
  'Raquel Polo': 'https://www.instagram.com/raquel_863/',
  'Soraya Yela': 'https://www.instagram.com/sorayaym/',
  'Teo Calcerrada': 'https://www.instagram.com/teocalcerrada/',
  'Teresa Ariste': 'https://www.instagram.com/teresaariste/',
};

const academyUrl = 'https://www.academiainternacionaldeesgrima.com/club-esgrima-barajas';
const schoolUrl = 'https://www.alcobendas.org/es/temas/educacion/PIC.A_Escuela';

function ProjectCredits() {
  return (
    <div className="esgrima__credits-grid">
      <div className="esgrima__collective">
        <h3>Fotografía e iluminación</h3>
        <p className="esgrima__credit-description">Realización fotográfica y montaje de luces · Grupo 3c</p>
        <ul className="esgrima__names">
          {photographers.map((name) => (
            <li key={name}>
              {name === 'Giovanny Arias' ? (
                <Link to="/">{name}</Link>
              ) : photographerLinks[name] ? (
                <a href={photographerLinks[name]} target="_blank" rel="noopener noreferrer">{name}</a>
              ) : name}
            </li>
          ))}
        </ul>
      </div>
      <dl className="esgrima__individual-credits">
        <div>
          <dt>Dirección de iluminación</dt>
          <dd>
            <a href={photographerLinks['Arse Buzz']} target="_blank" rel="noopener noreferrer">Arse Buzz</a>
            <span>Profesor de iluminación</span>
          </dd>
        </div>
        <div>
          <dt>Revelado fotográfico</dt>
          <dd><Link to="/">Giovanny Arias</Link></dd>
        </div>
        <div>
          <dt>Edición gráfica</dt>
          <dd><Link to="/">Giovanny Arias</Link></dd>
        </div>
        <div>
          <dt>Diseño y desarrollo web</dt>
          <dd>
            <Link to="/">Giovanny Arias</Link><span>Creación del medio expositivo</span>
          </dd>
        </div>
        <div>
          <dt>Lugar de realización</dt>
          <dd>
            <a href={academyUrl} target="_blank" rel="noopener noreferrer">Academia Internacional de Esgrima (AIE)</a>
            <span>Barajas, Madrid</span>
          </dd>
        </div>
        <div>
          <dt>Centro de estudios</dt>
          <dd>
            <a href={schoolUrl} target="_blank" rel="noopener noreferrer">PIC.A Escuela Internacional de Fotografía Alcobendas</a>
            <span>Grupo 3c</span>
          </dd>
        </div>
      </dl>
    </div>
  );
}

function getNextMaskSelection(remaining: string[] = []) {
  let pending = [...remaining];
  const gridPhotos: string[] = [];

  while (gridPhotos.length < Math.min(4, maskPhotos.length)) {
    if (pending.length === 0) pending = [...maskPhotos];

    // At a round boundary, keep the four images in this grid distinct.
    const candidates = pending.filter((src) => !gridPhotos.includes(src));
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    gridPhotos.push(selected);
    pending.splice(pending.indexOf(selected), 1);
  }

  return { gridPhotos, remaining: pending };
}

export default function Esgrima() {
  const { hash, search } = useLocation();
  const isExhibition = hash === '#exposicion';
  const params = new URLSearchParams(search);
  const eyeAvailable = params.get('eye') === 'true';
  const timeSeconds = Number(params.get('time'));
  // Browser timers overflow above a signed 32-bit millisecond delay.
  const intervalMs = Number.isFinite(timeSeconds) && timeSeconds > 0 && timeSeconds <= 2147483647 / 1000
    ? Math.max(1, Math.round(timeSeconds * 1000)) : 15000;
  const [eyeRequested, setEyeRequested] = useState(false);
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const eyeActive = eyeAvailable && isExhibition && desktop && eyeRequested;
  const stageRef = useRef<HTMLElement>(null);
  const eyeButtonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const viewRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [{ gridPhotos }, setMaskSelection] = useState(() => getNextMaskSelection());
  const [playing, setPlaying] = useState(false);
  const [trackingReady, setTrackingReady] = useState(false);
  const isPlaying = isExhibition && playing;

  useEffect(() => {
    if (!isExhibition) setPlaying(false);
  }, [isExhibition]);

  useEffect(() => {
    if (!isPlaying || (eyeActive && !trackingReady) || photos.length === 0) return;
    // A new mask selection resets the delay after manual navigation as well.
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % photos.length);
      setMaskSelection((current) => getNextMaskSelection(current.remaining));
    }, intervalMs);
    return () => window.clearTimeout(timer);
  }, [isPlaying, intervalMs, gridPhotos, eyeActive, trackingReady]);

  const closeEye = () => {
    setEyeRequested(false);
    eyeButtonRef.current?.focus();
  };

  useEffect(() => { setEyeRequested(false); }, [isExhibition, eyeAvailable]);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => { setDesktop(media.matches); setEyeRequested(false); };
    media.addEventListener('change', update);
    // Resizing invalidates the mapping between the eyes and the viewport.
    const reset = () => setEyeRequested(false);
    window.addEventListener('resize', reset);
    window.addEventListener('hashchange', reset);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('resize', reset);
      window.removeEventListener('hashchange', reset);
    };
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Esgrima 3c | Exposición fotográfica';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const changePhoto = (nextIndex: number) => {
    setIndex((nextIndex + photos.length) % photos.length);
    setMaskSelection((current) => getNextMaskSelection(current.remaining));
  };

  const next = () => changePhoto(index + 1);
  const previous = () => changePhoto(index - 1);

  useEffect(() => {
    if (!isExhibition) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((currentIndex) => (currentIndex + 1) % photos.length);
        setMaskSelection((current) => getNextMaskSelection(current.remaining));
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((currentIndex) => (currentIndex - 1 + photos.length) % photos.length);
        setMaskSelection((current) => getNextMaskSelection(current.remaining));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExhibition]);

  const handlePanEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50) next();
    if (info.offset.y > 50) previous();
  };

  return (
    <main className="esgrima-shell">
      <AnimatePresence mode="wait" initial={false}>
        <Motion.div
          key={isExhibition ? 'exhibition' : 'presentation'}
          ref={viewRef}
          className={`esgrima${isExhibition ? '' : ' esgrima--intro'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          onAnimationStart={() => {
            if (viewRef.current) viewRef.current.scrollTop = 0;
          }}
          onAnimationComplete={() => {
            viewRef.current?.querySelector<HTMLElement>('[data-view-heading]')?.focus({ preventScroll: true });
          }}
        >
          {!isExhibition ? (
            <>
              <header className="esgrima__intro-header">
                <span className="esgrima__wordmark">
                  3c<span> / Colectivo fotográfico</span>
                </span>
                <a className="esgrima__credits-link" href="#creditos">
                  Proyecto y créditos <span aria-hidden="true">↘</span>
                </a>
              </header>

              <section className="esgrima__intro-hero" aria-labelledby="esgrima-title">
                <div className="esgrima__intro-copy">
                  <p className="esgrima__eyebrow">Estudio de retrato / Exposición colectiva</p>
                  <h1 id="esgrima-title" className="esgrima__title" tabIndex={-1} data-view-heading>
                    Esgrima <span>3c</span>
                  </h1>
                  <p className="esgrima__intro-deck">
                    Detrás de la careta,
                    <br />
                    <em>una mirada.</em>
                  </p>
                  <p className="esgrima__intro-description">
                    Retratos de estudiantes de la{' '}
                    <a href={academyUrl} target="_blank" rel="noopener noreferrer">Academia Internacional de Esgrima (AIE), en Barajas</a>.
                    {' '}Un encuentro entre la fotografía y la esgrima, realizado por el grupo 3c de{' '}
                    <a href={schoolUrl} target="_blank" rel="noopener noreferrer">PIC.A Escuela Internacional de Fotografía Alcobendas</a>.
                  </p>
                  <Link className="esgrima__enter" to={{ search, hash: '#exposicion' }}>
                    <span>Entrar en la exposición</span>
                    <span className="esgrima__enter-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                  <p className="esgrima__series-note">
                    {photos.length + maskPhotos.length} fotografías <span aria-hidden="true">/</span> Una mirada colectiva
                  </p>
                </div>
                <figure className="esgrima__intro-figure">
                  <div className="esgrima__intro-image-wrap">
                    <img
                      src="/esgrima/photos/mask/_DSC8938.jpg"
                      alt="Retrato de un estudiante de esgrima con careta, iluminado sobre fondo negro"
                      width="667"
                      height="1000"
                      fetchPriority="high"
                    />
                    <span className="esgrima__image-index" aria-hidden="true">
                      3c / 01
                    </span>
                  </div>
                  <figcaption>
                    <span>Academia Internacional de Esgrima</span>
                    <span>Barajas, Madrid</span>
                  </figcaption>
                </figure>
              </section>

              <section id="creditos" className="esgrima__project" aria-labelledby="esgrima-project-title">
                <div className="esgrima__project-heading">
                  <p className="esgrima__eyebrow">El proyecto</p>
                  <h2 id="esgrima-project-title">
                    Una sesión compartida.
                    <br />
                    <em>Muchas formas de mirar.</em>
                  </h2>
                  <p>
                    Compartimos la realización de las fotografías y el montaje de la iluminación en la propia academia.
                    Esta exposición reúne una selección de las imágenes de aquella sesión: un trabajo construido entre
                    todos, desde la luz hasta el retrato.
                  </p>
                </div>
                <div className="esgrima__credits">
                  <h2>Autoría y créditos</h2>
                  <ProjectCredits />
                </div>
              </section>
              <footer className="esgrima__intro-footer">
                <span>Esgrima 3c · Proyecto fotográfico colectivo</span>
                <Link to={{ search, hash: '#exposicion' }}>
                  Ver los retratos <span aria-hidden="true">↗</span>
                </Link>
              </footer>
            </>
          ) : (
            <>
              <header className="esgrima__header">
                <h1 className="esgrima__sr-only" tabIndex={-1} data-view-heading>
                  Esgrima 3c: exposición fotográfica
                </h1>
                <Link className="esgrima__back" to={{ search, hash: '#presentacion' }}>
                  ← <span>Proyecto y créditos</span>
                </Link>
                {eyeAvailable && desktop && (
                  <button
                    ref={eyeButtonRef}
                    type="button"
                    className="esgrima__photographers-button esgrima__eye-button"
                    aria-label={eyeActive ? 'Desactivar seguimiento con cámara' : 'Elegir interacción con mirada, cabeza o dedo'}
                    aria-pressed={eyeActive}
                    title={eyeActive ? 'Desactivar seguimiento' : 'Mirada, cabeza o señalar con el dedo'}
                    onClick={() => setEyeRequested(!eyeActive)}
                  >
                    <Eye size={28} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className="esgrima__photographers-button"
                  aria-label={isPlaying ? 'Detener reproducción automática' : 'Iniciar reproducción automática'}
                  aria-pressed={isPlaying}
                  title={isPlaying ? 'Detener reproducción automática' : `Reproducir cada ${intervalMs / 1000} segundos`}
                  onClick={() => setPlaying((current) => !current)}
                >
                  {isPlaying ? <Square size={18} strokeWidth={1.5} aria-hidden="true" /> : <Play size={18} strokeWidth={1.5} aria-hidden="true" />}
                </button>
              </header>

              <section ref={stageRef} className={`esgrima__stage${eyeActive ? ' esgrima__stage--eye' : ''}`} aria-label="Galería de esgrima">
                <div className="esgrima__mask-grid" aria-hidden="true">
                  {(eyeActive ? gridPhotos.slice(0, 2) : gridPhotos).map((src) => (
                    <img key={`${index}-${src}`} className="esgrima__mask-photo" src={src} alt="" />
                  ))}
                </div>
                <div className="esgrima__primary-photo">
                  <Motion.img
                    className="esgrima__primary-image"
                    src={photos[index]}
                    alt={`Fotografía de esgrima ${index + 1}`}
                    onClick={next}
                    onPanEnd={handlePanEnd}
                  />
                </div>
              </section>

              <footer className="esgrima__footer">
                <input
                  className="esgrima__slider"
                  type="range"
                  min="0"
                  max={photos.length - 1}
                  value={index}
                  onChange={(event) => changePhoto(Number(event.target.value))}
                  aria-label="Seleccionar fotografía"
                />
              </footer>

              {eyeActive && <EsgrimaEyeTracking stageRef={stageRef} onClose={closeEye} onReadyChange={setTrackingReady} />}

            </>
          )}
        </Motion.div>
      </AnimatePresence>
    </main>
  );
}
