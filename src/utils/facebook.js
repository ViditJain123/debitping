'use client';

/**
 * Utility functions for interacting with the Facebook SDK
 */
export const fbUtils = {
  /**
   * Share content on Facebook
   * @param {Object} options - Share options
   * @param {string} options.href - URL to share
   * @param {string} options.quote - Text to share along with the URL
   * @param {string} options.hashtag - A hashtag to append to the share
   */
  share: (options) => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.ui({
        method: 'share',
        ...options
      }, (response) => {
        console.log('FB Share response:', response);
      });
    } else {
      console.error('Facebook SDK not loaded');
    }
  },

  /**
   * Login with Facebook
   * @param {Function} callback - Callback function after login attempt
   * @param {Array} scope - Requested permissions
   */
  login: (callback, scope = ['public_profile', 'email']) => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.login((response) => {
        if (callback) callback(response);
      }, { scope: scope.join(',') });
    } else {
      console.error('Facebook SDK not loaded');
    }
  },

  /**
   * Check if user is logged in to Facebook
   * @param {Function} callback - Callback with login status
   */
  getLoginStatus: (callback) => {
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.getLoginStatus((response) => {
        if (callback) callback(response);
      });
    } else {
      console.error('Facebook SDK not loaded');
    }
  }
};

/**
 * Hook to check if Facebook SDK is loaded
 * @returns {boolean} Whether the SDK is loaded
 */
export const useFacebookSDKLoaded = () => {
  return typeof window !== 'undefined' && !!window.FB;
};
