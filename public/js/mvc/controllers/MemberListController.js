/**
 * @file MemberListController.js
 * @description 멤버 목록의 모델과 뷰를 연결하는 컨트롤러
 */

import { showUIError } from '../../handlers/uiHandlers.js';
import { saveTeamData } from '../../utils/api.js';

/**
 * 멤버 목록 컨트롤러 클래스
 */
export class MemberListController {
  /**
   * 생성자
   * @param {MemberModel} model - 멤버 모델
   * @param {MemberListView} view - 멤버 목록 뷰
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.isComposing = false; // IME 입력 상태 (한글 등)
    this.isFinalEnter = false; // IME 입력 완료 후 엔터키 처리 필요 여부
    
    // 모델 변경 이벤트 구독
    this.model.on('change', this.handleModelChange.bind(this));
    this.model.on('editingChange', this.handleEditingChange.bind(this));
    
    // 초기 렌더링
    this.refreshView();
    
    // 이벤트 바인딩
    this.bindEvents();
  }
  
  /**
   * 모델 변경 이벤트 핸들러
   * @param {Object} event - 이벤트 객체
   */
  handleModelChange(event) {
    console.log('MemberListController: 모델 변경 감지', event);
    
    // 변경된 부분만 최적화해서 업데이트할 수 있음
    // 여기서는 간단하게 전체 뷰 리프레시
    this.refreshView();
  }
  
  /**
   * 편집 상태 변경 이벤트 핸들러
   * @param {Object} event - 이벤트 객체
   */
  handleEditingChange(event) {
    console.log('MemberListController: 편집 상태 변경', event);
    
    // 편집 모드가 변경되면 전체 뷰를 다시 렌더링
    this.refreshView();
    
    // 편집 모드가 활성화된 경우 관련 이벤트 바인딩
    if (event.index !== -1) {
      this.bindEditModeEvents();
    }
  }
  
  /**
   * 뷰 새로고침
   */
  refreshView() {
    const state = this.model.getState();
    this.view.render(state);
    
    // 이벤트 재바인딩
    this.bindEvents();
  }
  
  /**
   * 이벤트 리스너 바인딩
   */
  bindEvents() {
    // 입력 관련 이벤트 바인딩
    this.view.bindInputEvents({
      onAdd: this.handleAddMember.bind(this),
      onEnter: this.handleInputEnter.bind(this),
      onCompositionStart: this.handleCompositionStart.bind(this),
      onCompositionEnd: this.handleCompositionEnd.bind(this)
    });
    
    // 멤버 항목 이벤트 바인딩
    this.view.bindMemberEvents({
      onDelete: this.handleDeleteMember.bind(this),
      onEdit: this.handleEditMember.bind(this)
    });
    
    // 편집 모드 이벤트 바인딩 (편집 중인 경우)
    if (this.model.getEditingIndex() !== -1) {
      this.bindEditModeEvents();
    }
  }
  
  /**
   * 편집 모드 이벤트 바인딩
   */
  bindEditModeEvents() {
    this.view.bindEditModeEvents({
      onConfirm: this.handleConfirmEdit.bind(this),
      onCancel: this.handleCancelEdit.bind(this)
    });
  }
  
  /**
   * 멤버 추가 처리
   */
  handleAddMember() {
    // IME 입력 중인 경우 처리하지 않음
    if (this.isComposing) return;
    
    const name = this.view.getInputValue();
    if (!name) {
      this.view.shakeElement(this.view.elements.input);
      // 아무 메시지도 표시하지 않음
      return;
    }
    
    // 설정 완료 여부 확인 - 추가 조건 검사만 수행하고 메시지는 표시하지 않음
    const { totalMembers, isTotalConfirmed, isTeamCountConfirmed } = this.model.getState();
    if (!isTotalConfirmed || !isTeamCountConfirmed) {
      this.view.shakeElement(this.view.elements.input);
      return;
    }
    
    // 총원 초과 검사 - 추가 조건 검사만 수행하고 메시지는 표시하지 않음
    if (this.model.getMembers().length >= totalMembers) {
      this.view.shakeElement(this.view.elements.input);
      return;
    }
    
    console.log(`멤버 추가 실행: "${name}"`);
    
    try {
      const success = this.model.addMember(name);
      
      if (success) {
        console.log('멤버가 성공적으로 추가되었습니다');
        
        // 성공 메시지도 표시하지 않음
        // 입력창 초기화 및 포커스만 수행
        this.view.clearInput();
        
        // 약간의 지연 후 포커스 (모바일 키보드 문제 방지)
        setTimeout(() => {
          if (this.view.elements.input) {
            this.view.elements.input.focus();
          }
        }, 50);
      } else {
        console.warn('멤버 추가가 처리되지 않았습니다');
        // 실패 메시지도 표시하지 않음
      }
    } catch (error) {
      console.error('멤버 추가 중 오류 발생:', error);
      // 오류 메시지도 표시하지 않음
    }
  }
  
  /**
   * 입력 필드 엔터키 처리
   * @param {Event} event - 키보드 이벤트
   */
  handleInputEnter(event) {
    if (this.isComposing) {
      // 한글 입력 중이면 플래그만 설정 (입력 완료 후 처리)
      this.isFinalEnter = true;
    } else {
      this.handleAddMember();
    }
  }
  
  /**
   * IME 입력 시작 핸들러 (한글 등)
   */
  handleCompositionStart() {
    console.log('한글 입력 시작');
    this.isComposing = true;
  }
  
  /**
   * IME 입력 종료 핸들러 (한글 등)
   */
  handleCompositionEnd() {
    console.log('한글 입력 완료');
    this.isComposing = false;
    
    // 입력 완료 후 엔터키 처리가 필요한 경우
    if (this.isFinalEnter) {
      console.log('입력 완료 후 엔터키 처리');
      this.isFinalEnter = false;
      this.handleAddMember();
      
      // 입력 후 포커스 다시 설정
      setTimeout(() => {
        if (this.view.elements.input) {
          this.view.elements.input.focus();
        }
      }, 50);
    }
  }
  
  /**
   * 멤버 삭제 처리
   * @param {number} index - 삭제할 멤버 인덱스
   */
  handleDeleteMember(index) {
    console.log(`멤버 삭제 (인덱스: ${index})`);
    
    const members = this.model.getMembers();
    const memberName = members[index];
    
    if (this.model.deleteMember(index)) {
      this.view.updateStatusMessage(`"${memberName}" 멤버가 삭제되었습니다`, 'info');
      
      // 삭제 후 입력창에 포커스
      setTimeout(() => {
        if (this.view.elements.input) {
          this.view.elements.input.focus();
        }
      }, 50);
    } else {
      this.view.updateStatusMessage('멤버 삭제에 실패했습니다', 'error');
    }
  }
  
  /**
   * 멤버 수정 시작
   * @param {number} index - 수정할 멤버 인덱스
   */
  handleEditMember(index) {
    console.log(`멤버 수정 시작 (인덱스: ${index})`);
    
    // 모델에 편집 중인 멤버 인덱스 설정
    this.model.setEditingIndex(index);
  }
  
  /**
   * 편집 확인 처리
   * @param {string} newSuffix - 새 접미사
   */
  handleConfirmEdit(newSuffix) {
    const index = this.model.getEditingIndex();
    
    if (index !== -1) {
      const success = this.model.updateMemberName(index, newSuffix);
      
      if (success) {
        this.view.updateStatusMessage('멤버 이름이 업데이트되었습니다', 'success');
      } else {
        this.view.updateStatusMessage('멤버 이름 업데이트에 실패했습니다', 'error');
      }
      
      // 편집 완료 후 입력창에 포커스
      setTimeout(() => {
        if (this.view.elements.input) {
          this.view.elements.input.focus();
        }
      }, 50);
    }
  }
  
  /**
   * 편집 취소 처리
   */
  handleCancelEdit() {
    this.model.setEditingIndex(-1);
    
    // 편집 취소 후 입력창에 포커스
    setTimeout(() => {
      if (this.view.elements.input) {
        this.view.elements.input.focus();
      }
    }, 50);
  }
  
  /**
   * 컨트롤러 정리 (메모리 누수 방지)
   */
  dispose() {
    // 구독 해제
    this.model.off('change', this.handleModelChange);
    this.model.off('editingChange', this.handleEditingChange);
  }

  /**
   * 팀 데이터 저장
   * @param {Array} teams - 팀 구성 정보 배열
   */
  async handleSaveTeamData(teams) {
    try {
      const result = await saveTeamData({ teams });
      if (result.success) {
        console.log('팀 데이터가 성공적으로 저장되었습니다.');
      } else {
        console.warn('팀 데이터 저장에 실패했습니다:', result.message);
      }
    } catch (error) {
      console.error('팀 데이터 저장 중 오류 발생:', error);
      showUIError('팀 데이터 저장 중 오류가 발생했습니다.');
    }
  }

  /**
   * 팀 구성 완료 처리
   */
  handleTeamCompositionComplete(teams) {
    console.log('팀 구성이 완료되었습니다:', teams);
    this.handleSaveTeamData(teams);
  }
} 