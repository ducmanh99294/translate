import { apiGet, apiPost } from "./client";

// Lấy thông tin chapter theo id
export const getChapterApi = (id) => {
  return apiGet(`/api/chapter/${id}`);
};

// Import chapter
export const importChapterApi = (data) => {
  return apiPost("/api/chapter/import", data);
};

// Lấy trạng thái import/chapter
export const getChapterStatusApi = (id) => {
  return apiGet(`/api/chapter/${id}/status`);
};