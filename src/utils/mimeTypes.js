import path from 'path';
import { MIME_CONFIG } from '../config/mime.js';

export const getContentType = (filePath) => {
  const extname = path.extname(filePath).toLowerCase();
  return MIME_CONFIG.TYPES[extname] || MIME_CONFIG.TYPES['default'];
}; 