import { HTTP_ERRORS } from '@shared/constants/http-errors';
import axios from 'axios';
import { environment } from 'environments/environment.development';
import { GET, POST } from './utils.api';

const backendUrl = environment.BACKEND_URL || 'http://localhost:8100';
console.log('Backend URL:', backendUrl);

const Axios = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // This is required to send cookies (access & refresh tokens)
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

function onRefreshed() {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: () => void) {
  refreshSubscribers.push(callback);
}

// No request interceptor needed — cookies are sent automatically
Axios.interceptors.response.use(
  (response) => {
    console.log('Axios response:', response);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/signup')
    ) {
      originalRequest._retry = true;

      return new Promise((resolve, reject) => {
        addRefreshSubscriber(() => {
          Axios(originalRequest).then(resolve).catch(reject);
        });

        if (!isRefreshing) {
          isRefreshing = true;
          POST(`${backendUrl}/auth/refresh`)
            .then(() => {
              isRefreshing = false;
              onRefreshed();
            })
            .catch((refreshError) => {
              isRefreshing = false;
              console.error('Token refresh failed:', refreshError);
              reject({
                status: 401,
                message: HTTP_ERRORS[401] || 'Unauthorized',
              });
            });
        }
      });
    }

    const errorMessage =
      error.response?.data?.message ||
      HTTP_ERRORS[error.response?.status] ||
      'Something went wrong. Please try again later';

    return Promise.reject({
      status: error.response?.status || 500,
      message: errorMessage,
    });
  }
);

export default Axios;
