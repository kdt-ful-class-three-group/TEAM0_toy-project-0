import fs from 'fs';
import path from 'path';

export class StaticFileModel {
  constructor(publicDir) {
    this.publicDir = publicDir;
  }

  async getFile(filePath) {
    try {
      const content = await fs.promises.readFile(filePath);
      return content;
    } catch (error) {
      throw error;
    }
  }

  async fileExists(filePath) {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getFilePath(url) {
    let filePath = path.join(this.publicDir, url);
    
    if (!path.extname(filePath)) {
      const extensions = ['html', 'css', 'js'];
      for (const ext of extensions) {
        const testPath = `${filePath}.${ext}`;
        if (fs.existsSync(testPath)) {
          return testPath;
        }
      }
      
      if (url !== '/index.html') {
        return path.join(this.publicDir, 'index.html');
      }
    }
    
    return filePath;
  }
} 