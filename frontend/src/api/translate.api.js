import { apiPost } from "./client";

// Dịch nội dung trên trang
export const translateOnPageApi = (data) => {
  return apiPost("/api/translate/on-page", data);
};