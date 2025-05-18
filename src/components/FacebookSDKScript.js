'use client';

import Script from 'next/script';

export default function FacebookSDKScript() {
  return (
    <>
      <Script
        id="facebook-jssdk"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.fbAsyncInit = function() {
              FB.init({
                appId: '1234446691535897',
                xfbml: true,
                version: 'v22.0'
              });
              FB.AppEvents.logPageView();
            };
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src="https://connect.facebook.net/en_US/sdk.js"
      />
    </>
  );
}
