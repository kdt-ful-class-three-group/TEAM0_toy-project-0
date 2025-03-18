/**
 * @file componentStyles.js
 * @description 각 컴포넌트의 스타일을 정의합니다.
 * 이 파일은 모든 컴포넌트에서 재사용 가능한 스타일 모듈을 제공합니다.
 */

/**
 * NavComponent의 스타일
 * @type {string}
 */
export const navStyles = `
  :host {
    display: block;
    background-color: var(--color-dark-3, #2d2d2d);
    height: 100vh;
    overflow-y: auto;
    border-right: var(--border-dark, 1px solid #333);
  }
  
  .nav {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: var(--nav-padding, 1rem);
    height: 100%;
  }
  
  .nav__section--bottom {
    padding-top: var(--space-4, 1rem);
    border-top: var(--border-dark, 1px solid #333);
    margin-top: auto;
  }
  
  .nav__version {
    color: var(--color-text-tertiary, #888);
    font-size: var(--text-xs, 0.75rem);
    text-align: center;
  }
`;

/**
 * TeamDistributor의 스타일
 * @type {string}
 */
export const teamDistributorStyles = `
  :host {
    display: block;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: var(--color-dark-1, #121212);
  }
  
  .team-distributor-layout {
    display: grid;
    grid-template-columns: var(--nav-width, 240px) var(--main-width, 1fr) var(--sidebar-width, 320px);
    gap: 1px;
    height: 100vh;
    overflow: hidden;
    max-width: 100vw;
  }
  
  /* 슬롯 스타일링 */
  ::slotted([slot="nav"]) {
    height: 100%;
    background-color: var(--color-dark-3, #2d2d2d);
    border-right: var(--border-dark, 1px solid #333);
  }
  
  ::slotted([slot="main"]) {
    height: 100%;
    background-color: var(--color-dark-2, #1e1e1e);
  }
  
  ::slotted([slot="form"]) {
    height: 100%;
    background-color: var(--color-dark-2, #1e1e1e);
    border-left: var(--border-dark, 1px solid #333);
  }
`;

/**
 * FormPanel의 스타일
 * @type {string}
 */
export const formPanelStyles = `
  :host {
    display: block;
    background-color: var(--color-dark-2, #1e1e1e);
    padding: var(--section-padding, 1.5rem);
    border-left: var(--border-dark, 1px solid #333);
    height: 100vh;
    overflow-y: auto;
    min-width: 0;
    box-sizing: border-box;
  }
  
  .form-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
  }
`;

/**
 * MainPanel의 스타일
 * @type {string}
 */
export const mainPanelStyles = `
  :host {
    display: block;
    background-color: var(--color-dark-2, #1e1e1e);
    padding: var(--section-padding, 1.5rem);
    height: 100vh;
    overflow-y: auto;
    min-width: 0;
  }
  
  .main-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4, 1rem);
    height: 100%;
  }
  
  .panel-header {
    margin-bottom: var(--space-4, 1rem);
  }
  
  .panel-title {
    font-size: var(--text-xl, 1.5rem);
    font-weight: 600;
    color: var(--color-text-primary, #ffffff);
    margin-bottom: var(--space-2, 0.5rem);
  }
  
  .panel-description {
    font-size: var(--text-sm, 0.875rem);
    color: var(--color-text-secondary, #b3b3b3);
  }
`;

/**
 * TeamConfig의 스타일
 * @type {string}
 */
export const teamConfigStyles = `
  :host {
    display: block;
    margin-bottom: var(--space-4);
  }
  
  .team-config {
    background-color: var(--color-dark-3);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }
  
  .team-config__header {
    margin-bottom: var(--space-4);
  }
  
  .team-config__title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  .team-config__description {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }
  
  .team-config__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .form-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }
  
  .form-input {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--input-border);
    border-radius: var(--radius-md);
    background-color: var(--input-bg);
    color: var(--input-text);
    font-size: var(--text-base);
  }
  
  .form-input:focus {
    outline: 2px solid var(--color-primary);
    border-color: var(--color-primary);
  }
`;

/**
 * MemberInput의 스타일
 * @type {string}
 */
export const memberInputStyles = `
  :host {
    display: block;
    margin-bottom: var(--space-4);
  }
  
  .member-input {
    background-color: var(--color-dark-3);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }
  
  .member-input__header {
    margin-bottom: var(--space-4);
  }
  
  .member-input__title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  .member-input__description {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }
  
  .member-input__form {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }
  
  .member-input__field {
    flex: 1;
  }
  
  .member-list {
    margin-top: var(--space-4);
  }
  
  .member-list__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
    padding: 0 var(--space-2);
  }
  
  .member-list__title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }
  
  .member-list__actions {
    display: flex;
    gap: var(--space-2);
  }
`;

/**
 * TeamResult의 스타일
 * @type {string}
 */
export const teamResultStyles = `
  :host {
    display: block;
  }
  
  .team-result {
    background-color: var(--color-dark-3);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }
  
  .team-result__header {
    margin-bottom: var(--space-4);
  }
  
  .team-result__title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }
  
  .team-result__description {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }
  
  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-4);
  }
  
  .team-card {
    background-color: var(--color-dark-2);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
  }
  
  .team-card__header {
    margin-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--space-2);
  }
  
  .team-card__title {
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--color-text-primary);
  }
  
  .team-card__member-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .team-card__member-item {
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-border-light);
  }
  
  .team-card__member-item:last-child {
    border-bottom: none;
  }
`;

/**
 * 컴포넌트 스타일 객체
 * @type {Object}
 */
export const componentStyles = {
  NavComponent: navStyles,
  TeamDistributor: teamDistributorStyles,
  FormPanel: formPanelStyles,
  MainPanel: mainPanelStyles,
  TeamConfig: teamConfigStyles,
  MemberInput: memberInputStyles,
  TeamResult: teamResultStyles
}; 