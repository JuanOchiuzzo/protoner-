import React, { useState, useRef, useCallback } from 'react';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  zoomLevel?: number;
  lensSize?: number;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  className = '',
  zoomLevel = 2.5,
  lensSize = 150
}) => {
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [imageRect, setImageRect] = useState<DOMRect | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setImageRect(rect);
      setIsZooming(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRect || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
  }, [imageRect]);

  const getLensStyle = () => {
    if (!imageRect) return {};

    // Calcular a posição da lente centralizada no cursor
    const lensX = mousePos.x - lensSize / 2;
    const lensY = mousePos.y - lensSize / 2;

    // Limitar a lente dentro da imagem
    const maxX = imageRect.width - lensSize;
    const maxY = imageRect.height - lensSize;
    const clampedX = Math.max(0, Math.min(maxX, lensX));
    const clampedY = Math.max(0, Math.min(maxY, lensY));

    return {
      left: `${clampedX}px`,
      top: `${clampedY}px`,
      width: `${lensSize}px`,
      height: `${lensSize}px`,
    };
  };

  const getZoomStyle = () => {
    if (!imageRect) return {};

    // Calcular a área da imagem original que deve ser mostrada ampliada
    const backgroundX = -(mousePos.x * zoomLevel - lensSize / 2);
    const backgroundY = -(mousePos.y * zoomLevel - lensSize / 2);

    return {
      backgroundImage: `url(${src})`,
      backgroundSize: `${imageRect.width * zoomLevel}px ${imageRect.height * zoomLevel}px`,
      backgroundPosition: `${backgroundX}px ${backgroundY}px`,
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <div className="relative inline-block">
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`${className} cursor-crosshair`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        draggable={false}
      />
      
      {/* Lens overlay */}
      {isZooming && imageRect && (
        <>
          {/* Lens circle */}
          <div
            className="absolute pointer-events-none border-2 border-blue-400 rounded-full shadow-lg opacity-80 transition-opacity duration-200"
            style={getLensStyle()}
          />
          
          {/* Zoomed content */}
          <div
            className="absolute pointer-events-none border-2 border-blue-400 rounded-full shadow-2xl z-10 transition-opacity duration-200"
            style={{
              ...getLensStyle(),
              ...getZoomStyle(),
            }}
          />
          
          {/* Lens effect overlay */}
          <div
            className="absolute pointer-events-none rounded-full shadow-inner transition-opacity duration-200"
            style={{
              ...getLensStyle(),
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(0.5px)',
              border: '3px solid rgba(59, 130, 246, 0.6)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
            }}
          />
        </>
      )}
      
      {/* Instruction hint */}
      {!isZooming && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
            🔍 Passe o mouse para ampliar
          </div>
        </div>
      )}
    </div>
  );
};