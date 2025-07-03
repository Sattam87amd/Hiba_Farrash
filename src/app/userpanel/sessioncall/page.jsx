// pages/userpanel/sessioncall/page.jsx - User video call page
"use client";

import { Suspense } from 'react';
import UserSessionCall from '@/components/UserPanel/SessionCall/UserSessionCall';

function UserVideoCallPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-bold mb-2">Loading Patient Video Call</h2>
          <p className="text-gray-300">Please wait...</p>
        </div>
      </div>
    }>
      <UserSessionCall />
    </Suspense>
  );
}

export default UserVideoCallPage;