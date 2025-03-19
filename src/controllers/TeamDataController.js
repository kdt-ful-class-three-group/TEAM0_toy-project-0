import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_CONFIG } from '../config/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), SERVER_CONFIG.DATA.ROOT_DIR);
const CURRENT_DIR = path.join(DATA_DIR, SERVER_CONFIG.DATA.CURRENT_DIR);
const ARCHIVING_DIR = path.join(DATA_DIR, SERVER_CONFIG.DATA.ARCHIVING_DIR);
const HISTORY_DIR = path.join(DATA_DIR, SERVER_CONFIG.DATA.HISTORY_DIR);

export class TeamDataController {
  constructor() {
    this.initializeDirectories();
  }

  async initializeDirectories() {
    try {
      await fs.mkdir(CURRENT_DIR, { recursive: true });
      await fs.mkdir(ARCHIVING_DIR, { recursive: true });
      await fs.mkdir(HISTORY_DIR, { recursive: true });
    } catch (error) {
      console.error('디렉토리 초기화 중 오류 발생:', error);
    }
  }

  async saveTeamData(teamData) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `team-${timestamp}.json`;
      const filePath = path.join(CURRENT_DIR, fileName);

      // 현재 디렉토리의 기존 파일을 아카이빙으로 이동
      const currentFiles = await fs.readdir(CURRENT_DIR);
      for (const file of currentFiles) {
        const oldPath = path.join(CURRENT_DIR, file);
        const newPath = path.join(ARCHIVING_DIR, file);
        await fs.rename(oldPath, newPath);
      }

      // 새로운 팀 데이터 저장
      await fs.writeFile(filePath, JSON.stringify(teamData, null, 2));

      // 히스토리 기록
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: 'SAVE_TEAM_DATA',
        fileName: fileName,
        details: '새로운 팀 구성 정보가 저장되었습니다.'
      };
      await this.appendHistory(historyEntry);

      return { success: true, message: '팀 데이터가 성공적으로 저장되었습니다.' };
    } catch (error) {
      console.error('팀 데이터 저장 중 오류 발생:', error);
      return { success: false, message: '팀 데이터 저장 중 오류가 발생했습니다.' };
    }
  }

  async appendHistory(entry) {
    try {
      const historyFile = path.join(HISTORY_DIR, 'history.json');
      let history = [];
      
      try {
        const existingData = await fs.readFile(historyFile, 'utf-8');
        history = JSON.parse(existingData);
      } catch (error) {
        // 파일이 없거나 읽기 실패 시 빈 배열로 시작
      }

      history.push(entry);
      await fs.writeFile(historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('히스토리 기록 중 오류 발생:', error);
    }
  }

  async getCurrentTeamData() {
    try {
      const files = await fs.readdir(CURRENT_DIR);
      if (files.length === 0) {
        return { success: false, message: '현재 저장된 팀 데이터가 없습니다.' };
      }

      const latestFile = files[files.length - 1];
      const filePath = path.join(CURRENT_DIR, latestFile);
      const data = await fs.readFile(filePath, 'utf-8');
      
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      console.error('팀 데이터 조회 중 오류 발생:', error);
      return { success: false, message: '팀 데이터 조회 중 오류가 발생했습니다.' };
    }
  }
} 