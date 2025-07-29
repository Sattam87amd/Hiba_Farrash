// hooks/useAxiosTokenRefresher.js
import { useEffect } from 'react';
import axios from 'axios';

const useAxiosTokenRefresher = () => {
  useEffect(() => {
    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
      failedQueue.forEach(prom => {
        if (error) {
          prom.reject(error);
        } else {
          prom.resolve(token);
        }
      });
      failedQueue = [];
    };

    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        // Don't retry refresh request itself
        if (originalRequest.url.includes('/user/refreshToken')) {
          return Promise.reject(error);
        }

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          typeof window !== 'undefined'
        ) {
          originalRequest._retry = true;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axios(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          isRefreshing = true;

          try {
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_PROD_API_URL}/api/userauth/user/refreshToken`,
              {},
              { withCredentials: true }
            );

            const newToken = data.token;
            localStorage.setItem('userToken', newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            processQueue(null, newToken);
            return axios(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('userToken');
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
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
