import Image from 'next/image';

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

interface TeamLogoAvatarProps {
  src: string;
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
}

export default function TeamLogoAvatar({ src, name, size = 'md', className = '' }: TeamLogoAvatarProps) {
  return (
    <div className={`relative ${sizeMap[size]} bg-surface border border-gunmetal shrink-0 overflow-hidden ${className}`}>
      <Image
        src={src || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80'}
        fill
        className="object-cover"
        alt={name}
      />
    </div>
  );
}
