"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

const ConnectMyCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Google Calendar API configuration
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "1005929437623-dqoqr9eilrjs3vld2kpirde891ltdpbt.apps.googleusercontent.com";
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "AIzaSyDfSM30E-N9FFRkkfIrCCBc3Ag2zBbaFH4";
  const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';

  useEffect(() => {
    initializeGoogleAPI();
    checkExistingAuth();
  }, []);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const initializeGoogleAPI = async () => {
    try {
      // Clear any previous errors
      setError("");
      
      // Check if environment variables are loaded
      if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
        console.warn('Using fallback credentials');
      }

      // Load Google API scripts
      await loadScript('https://apis.google.com/js/api.js');
      await loadScript('https://accounts.google.com/gsi/client');
      
      // Wait for scripts to be fully loaded
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Initialize Google API without discovery docs (we'll load them later)
      await new Promise((resolve) => {
        gapi.load('client', resolve);
      });

      // Initialize with just the API key first
      await gapi.client.init({
        apiKey: GOOGLE_API_KEY,
      });

      setIsInitialized(true);
      console.log('Google API initialized successfully');

    } catch (error) {
      console.error('Error initializing Google API:', error);
      // Still set as initialized since we can work without discovery docs
      setIsInitialized(true);
    }
  };

  const checkExistingAuth = () => {
    const savedAuth = localStorage.getItem('google_calendar_auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsConnected(true);
      setUserEmail(authData.email);
    }
  };

  const handleAuthCallback = async (response) => {
    console.log('Auth response:', response);
    
    if (response.error) {
      console.error('Authentication error:', response.error);
      setError(`Authentication failed: ${response.error}`);
      setIsConnecting(false);
      return;
    }

    if (!response.access_token) {
      console.error('No access token received');
      setError('Authentication failed: No access token received');
      setIsConnecting(false);
      return;
    }

    try {
      // Set the access token
      gapi.client.setToken({ access_token: response.access_token });

      // Get user profile info using a direct fetch since gapi might have issues
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${response.access_token}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userInfo = await profileResponse.json();
      
      // Save authentication data
      const authData = {
        access_token: response.access_token,
        email: userInfo.email,
        name: userInfo.name,
        expires_at: Date.now() + ((response.expires_in || 3600) * 1000)
      };

      localStorage.setItem('google_calendar_auth', JSON.stringify(authData));
      
      setIsConnected(true);
      setUserEmail(userInfo.email);
      setIsConnecting(false);

      // Test calendar access
      await testCalendarAccess();

    } catch (error) {
      console.error('Error during authentication:', error);
      setError('Failed to connect to Google Calendar');
      setIsConnecting(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsConnecting(true);
    setError("");

    // Check if Google client ID is available
    if (!GOOGLE_CLIENT_ID) {
      setError("Google Client ID is not configured");
      setIsConnecting(false);
      return;
    }

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        ux_mode: 'popup',
        callback: (response) => {
          handleAuthCallback(response);
        },
        error_callback: (error) => {
          console.error('OAuth error:', error);
          setError('Authentication failed. Please try again.');
          setIsConnecting(false);
        },
      });

      tokenClient.requestAccessToken({
        prompt: 'consent',
      });
    } catch (error) {
      console.error('Error initializing token client:', error);
      setError('Failed to initialize Google Sign-In');
      setIsConnecting(false);
    }
  };

  const testCalendarAccess = async () => {
    try {
      // Load calendar API if not already loaded
      if (!gapi.client.calendar) {
        await gapi.client.load('calendar', 'v3');
      }

      const response = await gapi.client.calendar.calendarList.list();
      console.log('Connected calendars:', response.result.items);
      
      // Optional: Get upcoming events from primary calendar
      const eventsResponse = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
      
      console.log('Upcoming events:', eventsResponse.result.items);
    } catch (error) {
      console.error('Error testing calendar access:', error);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('google_calendar_auth');
    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken(null);
    }
    setIsConnected(false);
    setUserEmail("");
    setError("");
  };

  const createCalendarEvent = async (eventData) => {
    try {
      const authData = JSON.parse(localStorage.getItem('google_calendar_auth'));
      
      // Check if token is expired
      if (Date.now() > authData.expires_at) {
        setError('Session expired. Please reconnect.');
        handleDisconnect();
        return;
      }

      // Load calendar API if not already loaded
      if (!gapi.client.calendar) {
        await gapi.client.load('calendar', 'v3');
      }

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: eventData.attendees || [],
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      console.log('Event created:', response.result);
      return response.result;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const getUpcomingEvents = async (maxResults = 10) => {
    try {
      // Load calendar API if not already loaded
      if (!gapi.client.calendar) {
        await gapi.client.load('calendar', 'v3');
      }

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.result.items;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  };

  return (
    <div className="flex flex-col items-start justify-start min-h-screen p-1">
      {/* Header Section */}
      <div className="text-start mb-6 w-full">
        <h2 className="text-xl md:text-2xl font-semibold">Connect my calendar</h2>
        <p className="text-gray-600 text-sm md:text-base pt-2 font-semibold">
          Connect your primary calendar to Shourk to avoid scheduling conflicts and <br className="hidden md:block" />
          manually updating multiple calendars.
        </p>
      </div>

      {/* Error Message - Only show if there's a real blocking error */}
      {error && !isConnecting && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full max-w-md md:max-w-lg">
          {error}
        </div>
      )}

      {/* Card Container */}
      <div className="bg-[#F7F7F7] rounded-2xl mt-6 md:mt-14 md:ml-10 p-4 py-8 flex flex-row items-center gap-4 w-full max-w-md md:max-w-lg shadow-md">
        {/* Google Calendar Icon */}
        <div className="w-10 md:w-16 h-10 md:h-16 relative">
          <Image
            src="/googlecalendar.png"
            alt="Google Calendar"
            layout="fill"
            objectFit="contain"
          />
        </div>

        {/* Text Section */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-black font-semibold">
            Google <br className="hidden md:block" /> Calendar
          </p>
          {isConnected && (
            <p className="text-green-600 text-xs mt-1">
              Connected as {userEmail}
            </p>
          )}
        </div>

        {/* Connect/Disconnect Button */}
        <button
          onClick={isConnected ? handleDisconnect : handleGoogleSignIn}
          disabled={isConnecting}
          className={`${
            isConnected 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-black hover:bg-gray-800'
          } text-white text-sm px-10 md:px-20 py-2 md:py-3 md:mr-10 rounded-lg w-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {/* Connection Status */}
      {isConnected && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg w-full max-w-md md:max-w-lg md:ml-10">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <p className="text-green-800 font-medium">
              Successfully connected to Google Calendar
            </p>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Shourk can now access your calendar to prevent scheduling conflicts
          </p>
        </div>
      )}
    </div>
  );
};

// Helper functions that can be used elsewhere in your app
export const calendarAPI = {
  createEvent: async (eventData) => {
    try {
      const authData = JSON.parse(localStorage.getItem('google_calendar_auth'));
      
      if (!authData || Date.now() > authData.expires_at) {
        throw new Error('Authentication expired. Please reconnect.');
      }

      // Load calendar API if not already loaded
      if (!gapi.client.calendar) {
        await gapi.client.load('calendar', 'v3');
      }

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: eventData.attendees || [],
      };

      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return response.result;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  getEvents: async (maxResults = 10) => {
    try {
      const authData = JSON.parse(localStorage.getItem('google_calendar_auth'));
      
      if (!authData || Date.now() > authData.expires_at) {
        throw new Error('Authentication expired. Please reconnect.');
      }

      // Load calendar API if not already loaded
      if (!gapi.client.calendar) {
        await gapi.client.load('calendar', 'v3');
      }

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.result.items;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  isConnected: () => {
    const authData = localStorage.getItem('google_calendar_auth');
    if (!authData) return false;
    
    const parsed = JSON.parse(authData);
    return Date.now() < parsed.expires_at;
  }
};

export default ConnectMyCalendar;