// app/expertpanel/sessioncall/page.jsx
"use client";

import { Suspense } from 'react';
import TimedVideoCall from '@/components/ExpertPanel/SessionCall/SessionCall';

// Loading component for Suspense
const LoadingComponent = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-white">Loading video call...</p>
    </div>
  </div>
);

export default function SessionCallPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <TimedVideoCall />
    </Suspense>
  );
}