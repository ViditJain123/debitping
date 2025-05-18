'use client';

import { useEffect } from 'react';

export default function FacebookSDK() {
  useEffect(() => {
    // Only execute on client side
    if (typeof window !== 'undefined') {
      window.fbAsyncInit = function() {
        FB.init({
          appId      : '1234446691535897',
          xfbml      : true,
          version    : 'v22.0'
        });
        FB.AppEvents.logPageView();
      };

      // Load the SDK
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  }, []);

  return null; // This component doesn't render anything
}
