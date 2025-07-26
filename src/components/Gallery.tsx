import React, { useEffect, useState } from 'react';
import { useLightboxStore } from '../store/lightboxStore';
import Lightbox from 'yet-another-react-lightbox';
import { ChevronLeft, ChevronRight, Copy, X } from 'lucide-react';
import styled from 'styled-components';

const REGION = 'eu-west-2';
const BUCKET = 'giovannyarias-photos';

interface GalleryGridProps {
  blur?: boolean;
}

const GalleryGrid = styled.div<GalleryGridProps>`
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  filter: ${({ blur }) => (blur ? 'blur(8px)' : 'none')};
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: 1000px) {
    gap: 24px;
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Gallery: React.FC = () => {
const [mainImages, setMainImages] = useState<{
    position: any; url: string; contentId: string; numPhotos: number;
}[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = useLightboxStore(state => state.isLightboxOpen);
  const setOpen = useLightboxStore(state => state.setLightboxOpen);
  const [index, setIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('https://5ftuls8bej.execute-api.eu-west-2.amazonaws.com/PROD/content');
        if (!res.ok) throw new Error('No se pudo descargar el contenido');
        const data = await res.json();

        const allImages: string[] = [];
        const mains: { url: string; contentId: string; position: number; numPhotos: number }[] = [];

        data.forEach((item: any) => {
          item.photos.forEach((photo: any) => {
            const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${item.date}_${item.contentId}/${photo.fileName}`;
            allImages.push(url);
            if (photo.main) {
              mains.push({ url, contentId: item.contentId, position: photo.position, numPhotos: item.photos.length });
            }
          });
        });

        console.log('Mains:', mains);

        setMainImages(mains);
        setLightboxImages(allImages);
      } catch (e: any) {
        setError(e.message || 'Error al descargar contenido');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleOpenLightbox = (imgUrl: string) => {
    const idx = lightboxImages.findIndex(url => url === imgUrl);
    setIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  return (
  <>
    <GalleryGrid blur={open}>
      {mainImages.map((img) => (
        <div
          key={img.url}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#eee',
            cursor: 'pointer',
            position: 'relative',
          }}
          onClick={() => handleOpenLightbox(img.url)}
        >
          <img
            src={img.url}
            alt={`Main ${img.contentId}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: img.position ? img.position : 'top',
              display: 'block',
            }}
          />
          {img.numPhotos > 1 && <Copy className='more-images-icon'/>}
        </div>
      ))}
    </GalleryGrid>
    <Lightbox
      open={open}
      close={() => setOpen(false)}
      slides={lightboxImages.map(url => ({ src: url }))}
      index={index}
      on={{ view: ({ index: i }) => setIndex(i) }}
      render={{
        iconPrev: () => <ChevronLeft />,
        iconNext: () => <ChevronRight />,
        iconClose: () => <X />,
      }}
    />
  </>
  );
};

export default Gallery;
