/**
 * @fileoverview Auth Provider định nghĩa các phương thức để quản lý xác thực người dùng.
 * Auth Provider là core cho các hook của thư viện refine.
 * Supported hooks:
 * [useLogin]{@link https://refine.dev/docs/authentication/hooks/use-login/} sẽ sử dụng phương thức {@link AuthBindings.login}
 * [useLogout]{@link https://refine.dev/docs/authentication/hooks/use-logout/} sẽ sử dụng phương thức {@link AuthBindings.logout}
 * [useRegister]{@link https://refine.dev/docs/authentication/hooks/use-register/} sẽ sử dụng phương thức {@link AuthBindings.register}
 * [useUpdatePassword]{@link https://refine.dev/docs/authentication/hooks/use-update-password/} sẽ sử dụng phương thức {@link AuthBindings.updatePassword}
 * [useForgotPassword]{@link https://refine.dev/docs/authentication/hooks/use-forgot-password/} sẽ sử dụng phương thức {@link AuthBindings.forgotPassword}
 * [useGetIdentity]{@link https://refine.dev/docs/authentication/hooks/use-get-identity/} sẽ sử dụng phương thức {@link AuthBindings.getIdentity}
 * [useOnError]{@link https://refine.dev/docs/authentication/hooks/use-on-error/} sẽ sử dụng phương thức {@link AuthBindings.onError}
 * [usePermissions]{@link https://refine.dev/docs/authentication/hooks/use-permissions/} sẽ sử dụng phương thức {@link AuthBindings.getPermissions}
 * @see {@link https://refine.dev/docs/authentication/auth-provider/ | Auth Provider - Refine}
 * @param {string} url URL của auth api.
 * @returns Đối tượng AuthBindings cung cấp các phương thức liên quan đến xác thực.
 */

import { AuthBindings } from "@refinedev/core";
import { notification } from "antd";
import { AxiosInstance } from "axios";
import { axiosInstance } from "../utils/data-provider/axios";
import { TOKEN_KEY } from "../helpers/token";

const httpClient: AxiosInstance = axiosInstance;

export const authProvider = (url: string): AuthBindings => ({
  login: async ({ email, password, remember }) => {
    try {
      const token = await httpClient
        .post(`${url}/login`, {
          email,
          password,
        })
        .then((res) => {
          const token = res.data.token ?? null;
          if (remember) {
            localStorage.setItem("SUNS_USER_INFO_EMAIL", email);
            localStorage.setItem("SUNS_USER_INFO_PASS", password);
          } else {
            localStorage.removeItem("SUNS_USER_INFO_EMAIL");
            localStorage.removeItem("SUNS_USER_INFO_PASS");
          }
          return token;
        });

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);

        return Promise.resolve({
          success: true,
          redirectTo: "/",
        });
      } else {
        return Promise.resolve({
          success: false,
          error: {
            message: "Đăng nhập thất bại",
            name: "Sai mật khẩu hoặc email",
          },
        });
      }
    } catch (error: any) {
      return Promise.resolve({
        success: false,
        error: {
          message: "Đăng nhập thất bại",
          name: error.message,
        },
      });
    }
  },
  register: async ({ email, password }) => {
    try {
      const response = await httpClient.post(`${url}/login`, {
        email,
        password,
      });

      const token = response.data.token ?? null;

      if (token) localStorage.setItem(TOKEN_KEY, token);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: "Register failed",
          name: "Invalid email or password",
        },
      };
    }
  },
  updatePassword: async () => {
    notification.success({
      message: "Updated Password",
      description: "Password updated successfully",
    });
    return {
      success: true,
    };
  },
  forgotPassword: async ({ email }) => {
    notification.success({
      message: "Reset Password",
      description: `Reset password link sent to "${email}"`,
    });
    return {
      success: true,
    };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem(TOKEN_KEY);

      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }

    return {};
  },
  check: async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      error: {
        message: "Check failed",
        name: "Token not found",
      },
      logout: true,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    try {
      const response = await httpClient.get(`${url}/admin/me`).then((res) => {
        return res.data.content;
      });

      return response;
    } catch (error) {
      console.error("Error fetching identity:", error);
      return null;
    }
  },
});
