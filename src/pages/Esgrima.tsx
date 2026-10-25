import { useEffect, useState } from 'react';
import { AnimatePresence, motion as Motion, type PanInfo } from 'framer-motion';
import './Esgrima.css';

const photos = [
  '_DSC7975.jpg',
  '_DSC7990.jpg',
  '_DSC8006.jpg',
  '_DSC8016.jpg',
  '_DSC8026.jpg',
  '_DSC8035.jpg',
  '_DSC8040.jpg',
  '_DSC8048.jpg',
  '_DSC8058.jpg',
  '_DSC8067.jpg',
  '_DSC8081.jpg',
  '_DSC8100.jpg',
  '_DSC8106.jpg',
  '_DSC8124.jpg',
  '_DSC8129.jpg',
].map((filename) => `/esgrima/photos/${filename}`);

const maskPhotos = [
  '_DSC8889.jpg',
  '_DSC8906.jpg',
  '_DSC8893.jpg',
  '_DSC8898.jpg',
  '_DSC8908.jpg',
].map((filename) => `/esgrima/photos/mask/${filename}`);

const photographers = [
  'Alejandro G. Iñárritu',
  'Camila Restrepo',
  'Mateo Sánchez',
  'Sofía Villanueva',
  'Ricardo García',
  'Valentina Rojas',
  'Andrés Castro',
  'Isabella Silva',
  'Diego Torres',
  'Lucía Gómez',
  'Javier Domínguez',
  'Martina Ríos',
  'Pablo Morales',
  'Elena Cruz',
  'Emilio Navarro',
];

const getRandomMaskPhotos = () => [...maskPhotos]
  .sort(() => Math.random() - 0.5)
  .slice(0, 4);

function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

export default function Esgrima() {
  const [index, setIndex] = useState(0);
  const [gridPhotos, setGridPhotos] = useState(getRandomMaskPhotos);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const changePhoto = (nextIndex: number) => {
    setIndex((nextIndex + photos.length) % photos.length);
    setGridPhotos(getRandomMaskPhotos());
  };

  const next = () => changePhoto(index + 1);
  const previous = () => changePhoto(index - 1);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalOpen) {
        if (event.key === 'Escape') setIsModalOpen(false);
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        setIndex((currentIndex) => (currentIndex + 1) % photos.length);
        setGridPhotos(getRandomMaskPhotos());
      }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        setIndex((currentIndex) => (currentIndex - 1 + photos.length) % photos.length);
        setGridPhotos(getRandomMaskPhotos());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handlePanEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50) next();
    if (info.offset.y > 50) previous();
  };

  return (
    <main className="esgrima">
      <header className="esgrima__header">
        <button className="esgrima__photographers-button" type="button" onClick={() => setIsModalOpen(true)} aria-label="Ver fotógrafos">
          <CameraIcon />
        </button>
      </header>

      <section className="esgrima__stage" aria-label="Galería de esgrima">
        <div className="esgrima__mask-grid" aria-hidden="true">
          {gridPhotos.map((src) => <img key={`${index}-${src}`} className="esgrima__mask-photo" src={src} alt="" />)}
        </div>
        <div className="esgrima__primary-photo">
          <Motion.img
            className="esgrima__primary-image"
            src={photos[index]}
            alt={`Fotografía de esgrima ${index + 1}`}
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

      <AnimatePresence>
        {isModalOpen && (
          <Motion.div
            className="esgrima__modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <Motion.section
              className="esgrima__modal"
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              aria-modal="true"
              aria-labelledby="esgrima-photographers-title"
              role="dialog"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="esgrima__modal-header">
                <h1 id="esgrima-photographers-title">FOTÓGRAFOS</h1>
                <button className="esgrima__close-button" type="button" onClick={() => setIsModalOpen(false)} aria-label="Cerrar fotógrafos">&times;</button>
              </div>
              <ul className="esgrima__photographers-list">
                {photographers.map((name) => <li key={name}>{name}</li>)}
              </ul>
            </Motion.section>
          </Motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
