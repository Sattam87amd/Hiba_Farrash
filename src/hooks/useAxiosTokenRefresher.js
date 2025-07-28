// hooks/useAxiosTokenRefresher.js
import { useEffect } from 'react';
import axios from 'axios';

const useAxiosTokenRefresher = () => {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // If refresh token call itself failed, reject immediately
        const isRefreshRequest = originalRequest.url.includes('/user/refreshToken');
        if (isRefreshRequest) return Promise.reject(error);

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          typeof window !== "undefined"
        ) {
          originalRequest._retry = true;

          try {
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/user/refreshToken`,
              {},
              { withCredentials: true }
            );

            const newToken = data.token;
            localStorage.setItem("userToken", newToken);

            // Update token in the failed request and retry it
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshErr) {
            console.error("🔁 Token refresh failed:", refreshErr);
            // Optional: clear token and redirect user
            localStorage.removeItem("userToken");
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
};

export default useAxiosTokenRefresher;
