import { apiGet, apiPut } from "./client";

// Lấy tiến độ đọc của user
export const getProgressApi = (seriesId) => {
  return apiGet(`/api/progress/${seriesId}`);
};

// Cập nhật tiến độ đọc
export const updateProgressApi = (seriesId, data) => {
  return apiPut(`/api/progress/${seriesId}`, data);
};