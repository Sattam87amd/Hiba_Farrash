'use client';
import React, { useEffect } from 'react';

const Page = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutId = urlParams.get('checkoutId');
    if (!checkoutId) return;

    // Step 1: Inject wpwlOptions BEFORE widget
    const preOptionsScript = document.createElement('script');
    preOptionsScript.type = 'text/javascript';
    preOptionsScript.innerHTML = `
      var wpwlOptions = {
        paymentTarget: "_top",
        brandDetection: true,
        onReady: function () {
          if (window.wpwl && typeof window.wpwl.configure === 'function') {
            window.wpwl.configure({ paymentTarget: "_top" });
          }
        }
      };
    `;
    document.head.appendChild(preOptionsScript);

    // Step 2: Load paymentWidgets.js
    const widgetScript = document.createElement('script');
    widgetScript.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
    widgetScript.async = true;
    document.head.appendChild(widgetScript);

    // Step 3: Add the required 3D Secure wpwlOptions AFTER widget loads
    const secureScript = document.createElement('script');
    secureScript.type = 'text/javascript';
    secureScript.innerHTML = `
      var wpwlOptions = {
        paymentTarget: "_top"
      };
    `;
    widgetScript.onload = () => {
      document.head.appendChild(secureScript);
    };

    // Cleanup on unmount
    return () => {
      document.head.removeChild(preOptionsScript);
      document.head.removeChild(widgetScript);
      if (document.head.contains(secureScript)) {
        document.head.removeChild(secureScript);
      }
    };
  }, []);

  return (
    <div>
      <style>
        {`
          .wpwl-brand-MADA {
            background-image: url('https://example.com/mada-logo.png'); /* Replace with official logo */
            background-size: contain;
            background-repeat: no-repeat;
          }
        `}
      </style>

      <form
        action="https://shourk.com/userpanel/wallet/callback"
        className="paymentWidgets"
        data-brands="MADA VISA MASTER"
      ></form>
    </div>
  );
};

export default Page;
