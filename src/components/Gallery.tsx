import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import Lightbox from 'yet-another-react-lightbox';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import styled from 'styled-components';
import { CloseButton, ProgressCircle } from '@chakra-ui/react';
import { ContainerCentered } from './SharedStyled';

const REGION = 'eu-west-2';
const BUCKET = 'giovannyarias-photos';

const GalleryGrid = styled.div<{ $blur?: boolean }>`
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
  filter: ${({ $blur }) => ($blur ? 'blur(8px)' : 'none')};
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: 1000px) {
    gap: 24px;
    grid-template-columns: repeat(3, 1fr);
  }
`;

const CloseConatiner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: #fff;
`;

const Gallery: React.FC = () => {
const [mainImages, setMainImages] = useState<{
    position: any; url: string; urlThumbnail?: string; contentId: string; numPhotos: number;
}[]>([]);

  const [loading, setLoading] = useState(true);
  const showBlur = useAppStore(state => state.showBlur);
  const setShowBlur = useAppStore(state => state.setShowBlur);
  const setShowHeader = useAppStore(state => state.setShowHeader);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('https://5ftuls8bej.execute-api.eu-west-2.amazonaws.com/PROD/content');
        if (!res.ok) throw new Error('No se pudo descargar el contenido');
        const data = await res.json();

        const allImages: string[] = [];
        const mains: { url: string; urlThumbnail?: string; contentId: string; position: number; numPhotos: number }[] = [];

        data.forEach((item: any) => {
          item.photos.forEach((photo: any) => {
            const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${item.date}_${item.contentId}/${photo.fileName}`;
            const urlThumbnail = photo.thumbnail ? `https://${BUCKET}.s3.${REGION}.amazonaws.com/${item.date}_${item.contentId}/${photo.thumbnail}` : url;
            allImages.push(url);
            if (photo.main) {
              mains.push({ url, urlThumbnail, contentId: item.contentId, position: photo.position, numPhotos: item.photos.length });
            }
          });
        });

        setMainImages(mains);
        setLightboxImages(allImages);
      } catch (e: any) {
        console.log('Error fetching content:', e);
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
    setShowBlur(true);
    setShowHeader(false);
  };

  return (
  <>
    {
      loading &&
      <ContainerCentered>
        <ProgressCircle.Root size="lg" value={null}>
          <ProgressCircle.Circle>
            <ProgressCircle.Track />
            <ProgressCircle.Range strokeLinecap="round" />
          </ProgressCircle.Circle>
        </ProgressCircle.Root>
      </ContainerCentered>
    }
    { 
      !loading &&
      <GalleryGrid $blur={showBlur}>
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
              src={img.urlThumbnail ?? img.url}
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
    }      
    <Lightbox
      open={open}
      close={() => { setOpen(false); setShowBlur(false); setShowHeader(true); }}
      slides={lightboxImages.map(url => ({ src: url }))}
      index={index}
      on={{ view: ({ index: i }) => setIndex(i) }}
      render={{
        iconPrev: () => <ChevronLeft />,
        iconNext: () => <ChevronRight />,
        iconClose: () => <CloseConatiner><CloseButton /></CloseConatiner>
      }}
    />
  </>
  );
};

export default Gallery;
