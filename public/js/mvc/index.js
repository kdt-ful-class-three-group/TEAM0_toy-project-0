/**
 * @file mvc/index.js
 * @description MVC 패턴 모듈 통합 및 초기화를 담당하는 파일
 */

// 모델
import { MemberModel } from './models/MemberModel.js';

// 뷰
import { MemberListView } from './views/MemberListView.js';

// 컨트롤러
import { MemberListController } from './controllers/MemberListController.js';

// 외부 사용을 위한 export
export { MemberModel, MemberListView, MemberListController };

/**
 * MemberList 컴포넌트를 MVC 패턴으로 초기화
 * @param {HTMLElement} container - 컴포넌트 컨테이너
 * @returns {Object} - { model, view, controller } 객체
 */
export function initMemberListMVC(container) {
  if (!container) {
    throw new Error('MVC 초기화: 컨테이너가 제공되지 않았습니다');
  }
  
  console.log('MVC 패턴으로 MemberList 초기화 시작', container);
  
  try {
    // 모델, 뷰, 컨트롤러 인스턴스 생성
    const model = new MemberModel();
    console.log('MVC 패턴: 모델 생성 완료');
    
    const view = new MemberListView(container);
    console.log('MVC 패턴: 뷰 생성 완료');
    
    const controller = new MemberListController(model, view);
    console.log('MVC 패턴: 컨트롤러 생성 완료');
    
    // 초기 렌더링 수행
    const initialState = model.getState();
    view.render(initialState);
    console.log('MVC 패턴: 초기 렌더링 완료');
    
    // 정리 함수 제공 (메모리 누수 방지)
    const dispose = () => {
      console.log('MVC 패턴: 리소스 정리');
      controller.dispose();
      model.dispose();
    };
    
    console.log('MVC 패턴으로 MemberList 초기화 완료');
    
    return { model, view, controller, dispose };
  } catch (error) {
    console.error('MVC 초기화 중 오류 발생:', error);
    throw error;
  }
} 