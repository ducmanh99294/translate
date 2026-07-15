import { apiGet, apiPost } from "./client";

// Lấy danh sách series
export const getSeriesApi = () => {
  return apiGet("/api/series");
};

// Lấy chi tiết series
export const getSeriesByIdApi = (id) => {
  return apiGet(`/api/series/${id}`);
};

// Tạo series
export const createSeriesApi = (data) => {
  return apiPost("/api/series", data);
};

// Lấy danh sách chapter của series
export const getSeriesChaptersApi = (id) => {
  return apiGet(`/api/series/${id}/chapters`);
};