/**
 * @file componentStyles.js
 * @description 각 컴포넌트별 스타일을 정의합니다.
 */

import { createThemeStyles } from './theme.js';

/**
 * 멤버 목록 컴포넌트 스타일
 */
export const memberListStyles = `
  ${createThemeStyles()}
  
  /* 멤버 목록 컨테이너 스타일 */
  .member-list-container {
    background-color: var(--colors-background-secondary);
    border-radius: var(--layout-borderRadius-md);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  /* 헤더 스타일 */
  .member-list-header {
    padding: var(--spacing-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--colors-background-tertiary);
    border-bottom: 1px solid var(--colors-border-primary);
  }
  
  .member-list-title {
    font-size: var(--typography-fontSize-lg);
    font-weight: var(--typography-fontWeight-semibold);
    margin: 0;
  }
  
  .member-count {
    background-color: var(--colors-accent-primary);
    color: var(--colors-text-primary);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--layout-borderRadius-round);
    font-size: var(--typography-fontSize-sm);
    font-weight: var(--typography-fontWeight-medium);
  }
  
  /* 콘텐츠 영역 */
  .member-list-content {
    padding: var(--spacing-md);
    overflow-y: auto;
    flex-grow: 1;
  }
  
  /* 빈 상태 스타일 */
  .empty-state {
    text-align: center;
    padding: var(--spacing-xl) var(--spacing-md);
    color: var(--colors-text-tertiary);
  }
  
  .empty-state__icon {
    font-size: 32px;
    margin-bottom: var(--spacing-md);
    opacity: 0.6;
  }
  
  .empty-state__title {
    font-size: var(--typography-fontSize-md);
    margin-bottom: var(--spacing-sm);
    color: var(--colors-text-secondary);
    font-weight: var(--typography-fontWeight-medium);
  }
  
  .empty-state__description {
    color: var(--colors-text-tertiary);
    font-size: var(--typography-fontSize-sm);
  }
  
  /* 멤버 입력 영역 */
  .member-input-container {
    padding: var(--spacing-md);
    border-top: 1px solid var(--colors-border-primary);
    background-color: var(--colors-background-tertiary);
  }
  
  .member-input-wrapper {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  .member-input {
    flex-grow: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--layout-borderRadius-md);
    border: 1px solid var(--colors-border-primary);
    background-color: rgba(255, 255, 255, 0.05);
    color: var(--colors-text-primary);
    font-size: var(--typography-fontSize-sm);
  }
  
  .member-input:focus {
    outline: none;
    border-color: var(--colors-accent-primary);
    box-shadow: 0 0 0 2px var(--colors-accent-tertiary);
  }
  
  .add-member-button {
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--colors-accent-primary);
    color: white;
    border: none;
    border-radius: var(--layout-borderRadius-md);
    font-weight: var(--typography-fontWeight-medium);
    cursor: pointer;
    transition: background-color var(--animation-duration-normal) var(--animation-timing-ease);
  }
  
  .add-member-button:hover {
    background-color: var(--colors-accent-secondary);
  }
  
  .add-member-button:disabled,
  .member-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* 상태 메시지 */
  .member-status-message {
    font-size: var(--typography-fontSize-xs);
    color: var(--colors-text-tertiary);
    margin-top: var(--spacing-sm);
    min-height: 18px;
  }
  
  /* 멤버 목록 스타일 */
  .member-list-wrapper {
    border-radius: var(--layout-borderRadius-md);
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.03);
    transition: all var(--animation-duration-normal) var(--animation-timing-ease);
  }
  
  .member-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .member-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--colors-border-secondary);
    transition: background-color var(--animation-duration-normal) var(--animation-timing-ease);
  }
  
  .member-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .member-item:last-child {
    border-bottom: none;
  }
  
  .member-item__name {
    font-size: var(--typography-fontSize-sm);
    font-weight: var(--typography-fontWeight-medium);
    color: var(--colors-text-primary);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .member-name {
    font-weight: var(--typography-fontWeight-medium);
  }
  
  .member-suffix-numeric {
    color: var(--colors-accent-primary);
    font-weight: var(--typography-fontWeight-regular);
    opacity: 0.9;
  }
  
  .member-suffix-text {
    color: var(--colors-text-secondary);
    font-weight: var(--typography-fontWeight-regular);
    background-color: rgba(255, 255, 255, 0.08);
    padding: 2px 6px;
    border-radius: var(--layout-borderRadius-sm);
    font-size: var(--typography-fontSize-xs);
  }
  
  .member-item__actions {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  /* 편집 모드 */
  .member-item.editing {
    background-color: var(--colors-accent-tertiary);
    padding: var(--spacing-md) var(--spacing-md);
  }
  
  .edit-container {
    width: 100%;
  }
  
  .suffix-input {
    margin: 0 var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--colors-border-primary);
    border-radius: var(--layout-borderRadius-sm);
    background-color: rgba(255, 255, 255, 0.06);
    color: var(--colors-text-primary);
    font-size: var(--typography-fontSize-sm);
    transition: all var(--animation-duration-normal) var(--animation-timing-ease);
  }
  
  .suffix-input:focus {
    outline: none;
    border-color: var(--colors-accent-primary);
    box-shadow: 0 0 0 2px var(--colors-accent-tertiary);
  }
  
  .edit-actions {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }
  
  .suffix-help {
    font-size: var(--typography-fontSize-xs);
    color: var(--colors-text-tertiary);
    margin-top: var(--spacing-sm);
  }
  
  /* 메시지 타입 */
  .info {
    color: var(--colors-feedback-info);
  }
  
  .error {
    color: var(--colors-feedback-error);
  }
  
  .success {
    color: var(--colors-feedback-success);
  }
  
  .warning {
    color: var(--colors-feedback-warning);
  }
  
  /* 오류 메시지 */
  .error-message {
    color: var(--colors-feedback-error);
    padding: var(--spacing-sm);
    background-color: rgba(248, 113, 113, 0.1);
    border-radius: var(--layout-borderRadius-sm);
    border-left: 3px solid var(--colors-feedback-error);
    margin: var(--spacing-sm) 0;
    font-size: var(--typography-fontSize-sm);
  }
`;

/**
 * 팀 결과 컴포넌트 스타일
 */
export const teamResultStyles = `
  ${createThemeStyles()}
  
  .team-result-container {
    padding: 0;
    margin-bottom: var(--spacing-md);
  }
  
  .card {
    background-color: var(--colors-background-secondary);
    border-radius: var(--layout-borderRadius-md);
    overflow: hidden;
  }
  
  .card.animate {
    animation: fadeIn var(--animation-duration-normal) var(--animation-timing-ease);
  }
  
  .card__content {
    padding: var(--spacing-md);
  }
  
  .card__title {
    font-size: var(--typography-fontSize-lg);
    font-weight: var(--typography-fontWeight-semibold);
    color: var(--colors-text-primary);
    margin: 0 0 var(--spacing-md) 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .team-info {
    font-size: var(--typography-fontSize-sm);
    color: var(--colors-text-secondary);
    font-weight: var(--typography-fontWeight-regular);
  }
  
  .status-message {
    font-size: var(--typography-fontSize-sm);
    color: var(--colors-text-tertiary);
    text-align: center;
    padding: var(--spacing-md) 0;
    margin-bottom: var(--spacing-md);
  }
  
  .status-message.success {
    color: var(--colors-feedback-success);
  }
  
  .team-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: var(--layout-borderRadius-md);
    padding: var(--spacing-lg);
    margin-top: var(--spacing-md);
  }
  
  .placeholder-item {
    color: var(--colors-text-tertiary);
    font-size: var(--typography-fontSize-sm);
    text-align: center;
  }
  
  .team-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
    margin-top: var(--spacing-md);
  }
  
  .team-item {
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: var(--layout-borderRadius-md);
    padding: var(--spacing-md);
    border: 1px solid var(--colors-border-primary);
  }
  
  .team-item__title {
    font-size: var(--typography-fontSize-md);
    font-weight: var(--typography-fontWeight-semibold);
    color: var(--colors-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--colors-border-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .team-size {
    font-size: var(--typography-fontSize-xs);
    color: var(--colors-text-tertiary);
    font-weight: var(--typography-fontWeight-regular);
  }
  
  .team-item__members {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .team-item__member {
    font-size: var(--typography-fontSize-sm);
    color: var(--colors-text-secondary);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: rgba(255, 255, 255, 0.04);
    border-radius: var(--layout-borderRadius-sm);
    transition: background-color var(--animation-duration-normal) var(--animation-timing-ease);
  }
  
  .team-item__member:hover {
    background-color: rgba(255, 255, 255, 0.08);
  }
  
  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }
`;

/**
 * 폼 패널 컴포넌트 스타일
 */
export const formPanelStyles = `
  ${createThemeStyles()}
  
  .form-panel {
    padding: var(--spacing-md);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .form-section {
    background-color: var(--colors-background-secondary);
    border-radius: var(--layout-borderRadius-md);
    overflow: hidden;
  }
  
  .form-section__header {
    padding: var(--spacing-md);
    background-color: var(--colors-background-tertiary);
    border-bottom: 1px solid var(--colors-border-primary);
  }
  
  .form-section__title {
    font-size: var(--typography-fontSize-md);
    font-weight: var(--typography-fontWeight-semibold);
    color: var(--colors-text-primary);
    margin: 0;
  }
  
  .form-section__content {
    padding: var(--spacing-md);
  }
  
  .form-group {
    margin-bottom: var(--spacing-md);
  }
  
  .form-group:last-child {
    margin-bottom: 0;
  }
  
  .form-label {
    display: block;
    font-size: var(--typography-fontSize-sm);
    color: var(--colors-text-secondary);
    margin-bottom: var(--spacing-xs);
  }
  
  .form-control {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--colors-border-primary);
    border-radius: var(--layout-borderRadius-md);
    color: var(--colors-text-primary);
    font-size: var(--typography-fontSize-sm);
  }
  
  .form-control:focus {
    outline: none;
    border-color: var(--colors-accent-primary);
    box-shadow: 0 0 0 2px var(--colors-accent-tertiary);
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }
`;

/**
 * 팀 디스트리뷰터 컴포넌트 스타일
 */
export const teamDistributorStyles = `
  ${createThemeStyles()}
  
  :host {
    display: block;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  
  .team-distributor-container {
    width: 100%;
    height: 100%;
  }
  
  .team-distributor-layout {
    display: grid;
    grid-template-areas: 
      "version main config";
    grid-template-columns: var(--layout-versionBarWidth) 1fr var(--layout-sidebarWidth);
    height: 100vh;
    width: 100%;
    overflow: hidden;
    background-color: var(--colors-background-primary);
  }
  
  .version-area {
    grid-area: version;
    padding: var(--spacing-md);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: var(--colors-background-secondary);
    border-right: 1px solid var(--colors-border-primary);
    color: var(--colors-text-secondary);
  }
  
  .app-name {
    font-size: var(--typography-fontSize-md);
    font-weight: var(--typography-fontWeight-semibold);
    color: var(--colors-text-primary);
  }
  
  .version-info {
    font-size: var(--typography-fontSize-xs);
    opacity: 0.6;
  }
  
  .main-area {
    grid-area: main;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  
  .config-area {
    grid-area: config;
    overflow-y: auto;
    background-color: var(--colors-background-secondary);
    border-left: 1px solid var(--colors-border-primary);
  }
`;

/**
 * 메인 패널 컴포넌트 스타일
 */
export const mainPanelStyles = `
  ${createThemeStyles()}
  
  :host {
    display: block;
    padding: var(--spacing-md);
    color: var(--colors-text-primary);
    overflow-y: auto;
    height: 100vh;
  }
  
  .main-panel {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    gap: var(--spacing-md);
    height: calc(100vh - var(--spacing-md) * 2);
    width: 100%;
  }
  
  .completion-message {
    background-color: var(--colors-accent-primary);
    color: var(--colors-text-primary);
    padding: var(--spacing-md);
    border-radius: var(--layout-borderRadius-md);
    text-align: center;
    font-weight: var(--typography-fontWeight-medium);
    margin-top: var(--spacing-sm);
    box-shadow: var(--shadows-sm);
    display: none;
    grid-column: span 1;
  }
  
  .completion-message.show {
    display: block;
  }
`;

// 모든 컴포넌트 스타일 내보내기
export default {
  memberListStyles,
  teamResultStyles,
  formPanelStyles,
  teamDistributorStyles,
  mainPanelStyles
}; 