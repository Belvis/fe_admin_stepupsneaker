import { AxiosInstance } from "axios";
import { stringify } from "query-string";
import { axiosInstance } from "../utils/data-provider/axios";
import { INotificationResponse } from "../interfaces";

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_API_BASE_PATH}/notifications`;

const httpClient: AxiosInstance = axiosInstance;

export const getAllNotifications = async (
  segment: string,
  query: { pageSize: number; sortBy?: string }
): Promise<{
  totalElements: number;
  data: INotificationResponse[];
}> => {
  const path = segment === "Tất cả" ? "" : "/unread";
  const response = await httpClient.get(
    `${API_BASE_URL}${path}?${stringify(query)}`
  );
  return {
    totalElements: response.data.content.totalElements,
    data: response.data.content.data,
  };
};

export const markNotificationAsRead = async (notificationId: string) => {
  await httpClient.put(`${API_BASE_URL}/read/${notificationId}`);
};

export const readAllNotifications = async () => {
  await httpClient.get(`${API_BASE_URL}/read-all`);
};
