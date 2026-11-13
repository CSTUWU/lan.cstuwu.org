import React from 'react';
import Image from 'next/image';
import { getMapImage } from '@/lib/mockData';

interface MapThumbnailProps {
  mapName: string;
  className?: string;
  widthClass?: string;
  heightClass?: string;
}

export default function MapThumbnail({
  mapName,
  className = '',
  widthClass = 'w-8',
  heightClass = 'h-5',
}: MapThumbnailProps) {
  const mapSrc = getMapImage(mapName);

  return (
    <div
      className={`relative ${widthClass} ${heightClass} overflow-hidden border border-gunmetal shrink-0 clip-tactical bg-surface ${className}`}
    >
      <Image
        src={mapSrc}
        alt={mapName}
        fill
        className="object-cover"
        sizes="64px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
}

