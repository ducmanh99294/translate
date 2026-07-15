import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "./client";

// Authentication

export const registerApi = (data) => {
  return apiPost("/api/auth/register", data);
};

export const verifyEmailApi = (data) => {
  return apiPost("/api/auth/verify", data);
};

export const loginApi = (email, password) => {
  return apiPost("/api/auth/login", {
    email,
    password,
  });
};

export const refreshTokenApi = () => {
  return apiPost("/api/auth/refresh-token", {});
};

export const logoutApi = () => {
  return apiPost("/api/auth/logout", {});
};

export const getMeApi = () => {
  return apiGet("/api/auth/me");
};

export const changePasswordApi = (
  currentPassword,
  newPassword
) => {
  return apiPut("/api/auth/change-password", {
    currentPassword,
    newPassword,
  });
};

// Google OAuth

// Không dùng fetch cho OAuth
export const loginWithGoogleApi = () => {
  window.location.href =
    `${import.meta.env.VITE_API_URL}/api/auth/google`;
};

// Admin

export const getAllUsersApi = () => {
  return apiGet("/api/auth");
};

export const banUserApi = (id) => {
  return apiPut(`/api/auth/${id}/ban`, {});
};

export const unbanUserApi = (id) => {
  return apiPut(`/api/auth/${id}/unban`, {});
};

export const deleteUserApi = (id) => {
  return apiDelete(`/api/auth/users/${id}`);
};