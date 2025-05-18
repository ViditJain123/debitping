'use client';

import { useEffect, useRef } from 'react';
import { useFacebookSDKLoaded } from '../utils/facebook';

export default function FacebookLikeButton() {
  const buttonRef = useRef(null);
  const isSdkLoaded = useFacebookSDKLoaded();
  
  useEffect(() => {
    // Parse XFBML when the SDK is loaded and the button is rendered
    if (isSdkLoaded && buttonRef.current) {
      if (window.FB) {
        window.FB.XFBML.parse(buttonRef.current.parentElement);
      }
    }
  }, [isSdkLoaded]);

  return (
    <div ref={buttonRef} className="my-4">
      <div
        className="fb-like"
        data-share="true"
        data-width="450"
        data-show-faces="true">
      </div>
    </div>
  );
}
