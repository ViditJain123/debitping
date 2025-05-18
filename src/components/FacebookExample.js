'use client';

import { useState, useEffect } from 'react';
import { fbUtils, useFacebookSDKLoaded } from '../utils/facebook';
import FacebookLikeButton from './FacebookLikeButton';

export default function FacebookExample() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loginStatus, setLoginStatus] = useState(null);

  useEffect(() => {
    // Poll for FB to be available since there's no official event
    const checkSDKLoaded = setInterval(() => {
      if (window.FB) {
        setSdkLoaded(true);
        clearInterval(checkSDKLoaded);
        
        // Check login status once SDK is loaded
        fbUtils.getLoginStatus(setLoginStatus);
      }
    }, 500);
    
    return () => clearInterval(checkSDKLoaded);
  }, []);

  const handleShare = () => {
    fbUtils.share({
      href: window.location.href,
      quote: 'Check out this amazing WhatsApp automation tool!',
      hashtag: '#WhatsAppAutomation'
    });
  };

  const handleLogin = () => {
    fbUtils.login((response) => {
      setLoginStatus(response);
      console.log('Login response:', response);
    });
  };

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-2">Facebook Integration Example</h2>
      
      <div className="mb-4">
        <p>SDK Status: {sdkLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
        {loginStatus && (
          <p>Login Status: {loginStatus.status}</p>
        )}
      </div>
      
      {/* Facebook Like Button */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Facebook Like Button</h3>
        <FacebookLikeButton />
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleLogin}
          disabled={!sdkLoaded}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >
          Login with Facebook
        </button>
        
        <button 
          onClick={handleShare}
          disabled={!sdkLoaded}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >
          Share on Facebook
        </button>
      </div>
    </div>
  );
}
