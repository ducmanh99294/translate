import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "./client";

// Series Glossary

// Lấy danh sách glossary của một series
export const getGlossaryApi = (seriesId) => {
  return apiGet(`/api/series/${seriesId}/glossary`);
};

// Tạo glossary mới cho series
export const createGlossaryApi = (seriesId, data) => {
  return apiPost(`/api/series/${seriesId}/glossary`, data);
};

// Glossary

// Cập nhật glossary
export const updateGlossaryApi = (id, data) => {
  return apiPatch(`/api/glossary/${id}`, data);
};

// Xóa glossary
export const deleteGlossaryApi = (id) => {
  return apiDelete(`/api/glossary/${id}`);
};