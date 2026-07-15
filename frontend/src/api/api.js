import { request } from "./base";

export const apiGet = (url) =>
  request("GET", url);

export const apiPost = (url, data) =>
  request("POST", url, data);

export const apiPut = (url, data) =>
  request("PUT", url, data);

export const apiDelete = (url) =>
  request("DELETE", url);

export const apiPatch = (url, data) =>
  request("PATCH", url, data);