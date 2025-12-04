import { User, FileData } from '../types';

const USERS_KEY = 'mandei_pegou_users';
const FILES_KEY = 'mandei_pegou_files';
const SESSION_KEY = 'mandei_pegou_session';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockDB = {
  // Auth
  login: async (email: string): Promise<User> => {
    await delay(800);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === email);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
    throw new Error('Usuário não encontrado.');
  },

  register: async (name: string, email: string): Promise<User> => {
    await delay(1000);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: User) => u.email === email)) {
      throw new Error('E-mail já cadastrado.');
    }
    const newUser: User = { id: crypto.randomUUID(), name, email };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // Files
  uploadFile: async (file: File, user: User, base64?: string): Promise<FileData> => {
    await delay(2000); // Fake upload time
    const files = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    
    // Default expiration: 30 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    const newFile: FileData = {
      id: Math.random().toString(36).substring(2, 9),
      userId: user.id,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      expirationDate: expirationDate.toISOString(),
      downloads: 0,
      base64Data: base64, // Only for demo small files
    };

    files.push(newFile);
    localStorage.setItem(FILES_KEY, JSON.stringify(files));
    return newFile;
  },

  getUserFiles: async (userId: string): Promise<FileData[]> => {
    await delay(500);
    const files: FileData[] = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    return files.filter(f => f.userId === userId).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  },

  getFile: async (fileId: string): Promise<FileData | null> => {
    await delay(500);
    const files: FileData[] = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    return files.find(f => f.id === fileId) || null;
  },

  incrementDownload: (fileId: string) => {
    const files: FileData[] = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    const index = files.findIndex(f => f.id === fileId);
    if (index !== -1) {
      files[index].downloads += 1;
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }
  },

  deleteFile: async (fileId: string) => {
    await delay(500);
    const files: FileData[] = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    const newFiles = files.filter(f => f.id !== fileId);
    localStorage.setItem(FILES_KEY, JSON.stringify(newFiles));
  },
  
  updateFileDescription: (fileId: string, description: string) => {
    const files: FileData[] = JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
    const index = files.findIndex(f => f.id === fileId);
    if (index !== -1) {
      files[index].description = description;
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    }
  }
};