import { ENV_BACKEND_URL } from "./environment";

export const BASE_URL = `${ENV_BACKEND_URL}/admin`;
export const BASE_URL_PUBLIC = `${ENV_BACKEND_URL}`;

export const API_ENDPOINTS = {
  user: `/admin/user`,
  category: `admin/category`,
  subcategory: `admin/sub-category`,
  course: `admin/course`,
  material: `admin/material-content`,
  syllabus: `admin/syllabus`,
  materialType: `${BASE_URL_PUBLIC}/material`,
  attachment: `admin/upload`,
  attachments: `admin/uploads`,
  auth: `${BASE_URL_PUBLIC}/access`,
  topic: `admin/topic`,
  brightcove: `/brightcove`,
};
