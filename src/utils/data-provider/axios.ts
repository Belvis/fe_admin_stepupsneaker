/**
 * @fileoverview Axios instance được cấu hình cho toàn bộ request của dự án.
 */

import { HttpError } from "@refinedev/core";
import axios from "axios";
import { TOKEN_KEY } from "../../helpers/token";

const axiosInstance = axios.create();

// Thiết lập header mặc định cho tất cả các request là application/json
axiosInstance.defaults.headers.common["Content-Type"] = "application/json";

// Intercept request để thêm token và ngôn ngữ vào header
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (config?.headers) {
      // Thêm token vào header Authorization nếu tồn tại
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // TODO: Thêm tính linh hoạt cho ngôn ngữ thay vì giá trị cứng "vi"
      config.headers["Accept-Language"] = "vi";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept response để xử lý lỗi và chuyển đổi thành HttpError
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tạo đối tượng HttpError từ response error
    const customError: HttpError = {
      ...error,
      message: error.response?.data?.errors,
      statusCode: error.response?.data.status,
    };

    return Promise.reject(customError);
  }
);

export { axiosInstance };
