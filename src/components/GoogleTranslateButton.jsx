import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

const GoogleTranslateButton = () => {
  const [isArabic, setIsArabic] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Enhanced cookie management with more robust domain handling
  const setCookie = (name, value) => {
    // Set cookie for current domain
    document.cookie = `${name}=${value}; path=/`;
    
    // Also try to set for root domain to handle subdomains
    if (window.location.hostname.indexOf('.') !== -1) {
      const rootDomain = '.' + window.location.hostname.split('.').slice(-2).join('.');
      document.cookie = `${name}=${value}; path=/; domain=${rootDomain}`;
    }
  };

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const deleteCookie = (name) => {
    // Delete from current domain path
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    
    // Also try root domain
    if (window.location.hostname.indexOf('.') !== -1) {
      const rootDomain = '.' + window.location.hostname.split('.').slice(-2).join('.');
      document.cookie = `${name}=; path=/; domain=${rootDomain}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
      // Try with a dot prefix
      document.cookie = `${name}=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }
  };

  useEffect(() => {
    // Check if already initialized
    if (window.google?.translate) {
      setInitialized(true);
    }

    // Initial language check
    const checkLanguage = () => {
      const lang = getCookie('googtrans');
      const isCurrentlyArabic = lang?.includes('/ar') || lang?.includes('/en/ar');
      setIsArabic(isCurrentlyArabic);
      
      // Apply RTL direction if Arabic is active
      if (isCurrentlyArabic) {
        applyRTL();
      } else {
        applyLTR();
      }
    };
    
    // Run initial check
    checkLanguage();

    // 1. Inject Translate script if not already loaded
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      // 2. Define global init function for Google Translate
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'ar',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setInitialized(true);
        
        // Add RTL styles when initialized
        injectRTLStyles();
        
        // Check language again after initialization
        setTimeout(checkLanguage, 500);
      };
    }

    // 3. Remove banner logic
    const removeBanner = () => {
      const iframe = document.querySelector('iframe.goog-te-banner-frame');
      const body = document.body;

      if (iframe) {
        iframe.remove();
      }

      if (body && body.style.top !== '0px') {
        body.style.top = '0px';
      }
    };

    // Repeated cleanup
    const interval = setInterval(removeBanner, 500);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    // MutationObserver to handle Google Translate DOM changes
    const observer = new MutationObserver((mutations) => {
      removeBanner();
      
      // Check if direction has changed
      const htmlElement = document.documentElement;
      const direction = getComputedStyle(htmlElement).direction;
      
      if (direction === 'rtl' && !isArabic) {
        setIsArabic(true);
      } else if (direction === 'ltr' && isArabic) {
        setIsArabic(false);
      }
    });
    
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['dir', 'class', 'style']
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    removeBanner(); // Immediate cleanup

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [isArabic]);

  // Apply RTL direction to the document
  const applyRTL = () => {
    document.documentElement.dir = 'rtl';
    document.documentElement.classList.add('rtl');
  };

  // Apply LTR direction to the document
  const applyLTR = () => {
    document.documentElement.dir = 'ltr';
    document.documentElement.classList.remove('rtl');
  };

  // Inject RTL styles into the document
  const injectRTLStyles = () => {
    if (!document.getElementById('rtl-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'rtl-styles';
      styleElement.innerHTML = `
        /* RTL base styling */
        html[dir="rtl"] body {
          direction: rtl;
          text-align: right;
        }
        
        /* Fix flex containers */
        html[dir="rtl"] .flex:not(.flex-col, .no-rtl-flip) {
          flex-direction: row-reverse;
        }
        
        /* Fix margins and padding */
        html[dir="rtl"] .ml-1, html[dir="rtl"] .ml-2, html[dir="rtl"] .ml-3, html[dir="rtl"] .ml-4 {
          margin-left: 0;
          margin-right: 0.25rem;
        }
        
        html[dir="rtl"] .mr-1, html[dir="rtl"] .mr-2, html[dir="rtl"] .mr-3, html[dir="rtl"] .mr-4 {
          margin-right: 0;
          margin-left: 0.25rem;
        }
        
        html[dir="rtl"] .pl-4 {
          padding-left: 0;
          padding-right: 1rem;
        }
        
        html[dir="rtl"] .pr-4 {
          padding-right: 0;
          padding-left: 1rem;
        }
        
        /* Fix text alignment */
        html[dir="rtl"] .text-left {
          text-align: right;
        }
        
        html[dir="rtl"] .text-right {
          text-align: left;
        }
        
        /* Style fixes for Google translate elements */
        .goog-te-gadget {
          font-size: 0 !important;
        }
        
        .goog-te-banner-frame {
          display: none !important;
        }
        
        body {
          top: 0 !important;
        }
        
        .skiptranslate {
          display: none !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
  };

  const handleTranslate = () => {
    // Save current state for comparison after reload
    const wasArabic = isArabic;
    
    // Update local state immediately for UI response
    setIsArabic(!wasArabic);
    
    // Create a cleanup function for translate cookies
    const cleanupTranslateCookies = () => {
      try {
        // Delete cookies using multiple methods to ensure they're removed
        deleteCookie('googtrans');
        
        // Additional cleanup for Google's storage
        localStorage.removeItem('googtrans');
        sessionStorage.removeItem('googtrans');
        
        // Force clear Google's translation states
        if (window.google?.translate?.TranslateElement?.getInstance) {
          const instance = window.google.translate.TranslateElement.getInstance();
          if (instance && typeof instance.restore === 'function') {
            instance.restore();
          }
        }
      } catch (e) {
        console.error('Error cleaning up translation cookies:', e);
      }
    };
    
    if (wasArabic) {
      // Switching from Arabic to English
      cleanupTranslateCookies();
      applyLTR();
      
      // Force reset translation element
      const elem = document.getElementById('google_translate_element');
      if (elem) {
        elem.innerHTML = '';
      }
    } else {
      // Switching to Arabic
      cleanupTranslateCookies(); // Clean first to avoid conflicts
      setTimeout(() => {
        setCookie('googtrans', '/en/ar');
        applyRTL();
      }, 100);
    }
    
    // Use a short timeout to ensure cookies are properly set/removed before reload
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="relative">
      {/* Hidden container for Google Translate widget */}
      <div
        id="google_translate_element"
        className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
      ></div>

      <button
        onClick={handleTranslate}
        className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 active:bg-gray-900 text-white font-semibold rounded-md transition duration-150 ease-in-out"
        aria-label={isArabic ? "Switch to English" : "Switch to Arabic"}
      >
        <Globe size={20} />
        <span>{isArabic ? 'English' : 'العربية'}</span>
      </button>
    </div>
  );
};

export default GoogleTranslateButton;