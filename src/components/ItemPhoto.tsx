import { useState } from 'react';
import { EyeOff, Package } from 'lucide-react';

interface ItemPhotoProps {
  src: string;
  alt: string;
  className?: string;
  hiddenForVerification?: boolean;
}

export function ItemPhoto({
  src,
  alt,
  className = '',
  hiddenForVerification = false,
}: ItemPhotoProps) {
  const [hasError, setHasError] = useState(false);

  if (hiddenForVerification) {
    return (
      <div
        className={`relative overflow-hidden bg-slate-900 select-none ${className}`}
        aria-label="Detailed item photograph hidden for ownership verification"
      >
        {!hasError ? (
          <img
            src={src}
            alt="Obscured preview"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="h-full w-full object-cover scale-110 blur-2xl opacity-35"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-950/75 to-slate-900/90 flex flex-col items-center justify-center px-4 text-center">
          <div className="h-11 w-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-2.5">
            <EyeOff className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-white">
            Detailed photo hidden
          </p>
          <p className="text-xs text-slate-300 mt-1 max-w-[260px]">
            Visual details are masked during claims to protect rightful owners.
          </p>
        </div>
      </div>
    );
  }

  if (hasError || !src) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4 text-slate-500 ${className}`}
      >
        <Package className="h-7 w-7 mb-1.5 text-slate-400" />
        <span className="text-xs font-medium text-center line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
}
