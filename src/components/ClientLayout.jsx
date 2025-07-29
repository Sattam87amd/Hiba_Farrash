// components/ClientLayout.jsx
'use client'; // ✅ required

import useAxiosTokenRefresher from '@/hooks/useAxiosTokenRefresher';

export default function ClientLayout({ children }) {
  useAxiosTokenRefresher(); // 🔁 Token refresh happens here on all pages
  return <>{children}</>;
}
