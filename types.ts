export interface User {
  id: string;
  name: string;
  email: string;
}

export interface FileData {
  id: string;
  userId: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  expirationDate: string; // ISO String
  downloads: number;
  maxDownloads?: number;
  description?: string; // AI Generated description
  base64Data?: string; // Storing small files in localstorage for demo
}

export enum ViewState {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  DOWNLOAD = 'DOWNLOAD',
  SUPPORT = 'SUPPORT'
}

export interface RouteParams {
  fileId?: string;
}