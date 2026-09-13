import { useState } from 'react';
import { resized } from '../lib/rawg';

// Loads a downsized RAWG image, falling back to the original if the resize URL fails.
export default function RawgImg({ src, width, alt = '', className = '', ...rest }) {
  const [failed, setFailed] = useState(false);

  if (!src) return <div className={`img-placeholder ${className}`} />;

  return (
    <img
      src={failed ? src : resized(src, width)}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => !failed && setFailed(true)}
      {...rest}
    />
  );
}
