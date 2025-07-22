// hooks/useAxiosTokenRefresher.js
import { useEffect } from 'react';
import axios from 'axios';

const useAxiosTokenRefresher = () => {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

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

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshErr) {
            console.error("Token refresh failed:", refreshErr);
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
