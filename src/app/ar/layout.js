// app/ar/layout.js
export default function ArLayout({ children }) {
  // Set direction to RTL for Arabic page
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
