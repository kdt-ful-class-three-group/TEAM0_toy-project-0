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
    background-color: #121212;
    height: 100vh;
    overflow-y: auto;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .nav {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
    height: 100%;
  }
  
  .nav__section--bottom {
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: auto;
  }
  
  .nav__version {
    color: rgba(255, 255, 255, 0.4);
    font-size: 12px;
    text-align: center;
    padding: 8px 0;
  }
  
  .nav__title {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
    background-color: #121212;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .team-distributor-container {
    width: 100%;
    height: 100%;
  }
  
  .team-distributor-layout {
    display: grid;
    grid-template-columns: 240px 1fr 320px;
    gap: 1px;
    height: 100vh;
    overflow: hidden;
    max-width: 100vw;
    background-color: rgba(255, 255, 255, 0.02);
  }
  
  /* 슬롯 스타일링 */
  ::slotted([slot="nav"]) {
    height: 100%;
    background-color: #121212;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  ::slotted([slot="main"]) {
    height: 100%;
    background-color: #121212;
    border-left: 1px solid rgba(255, 255, 255, 0.02);
    border-right: 1px solid rgba(255, 255, 255, 0.02);
  }
  
  ::slotted([slot="form"]) {
    height: 100%;
    background-color: #121212;
    border-left: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

/**
 * FormPanel의 스타일
 * @type {string}
 */
export const formPanelStyles = `
  :host {
    display: block;
    background-color: #121212;
    padding: 20px;
    border-left: 1px solid rgba(255, 255, 255, 0.05);
    height: 100vh;
    overflow-y: auto;
    min-width: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .form-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .form-panel__title {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .form-section {
    margin-bottom: 24px;
  }
  
  .form-section__title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 12px;
  }
`;

/**
 * MainPanel의 스타일
 * @type {string}
 */
export const mainPanelStyles = `
  :host {
    display: block;
    background-color: #121212;
    padding: 20px;
    height: 100vh;
    overflow-y: auto;
    min-width: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .main-panel {
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100%;
  }
  
  .panel-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .panel-title {
    font-size: 22px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
  }
  
  .panel-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .content-section {
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
  }
  
  .result-container {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .result-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    text-align: center;
    padding: 24px;
  }
  
  .result-empty__icon {
    font-size: 32px;
    margin-bottom: 16px;
    opacity: 0.6;
  }
  
  .result-empty__title {
    font-size: 16px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
  }
  
  .result-empty__message {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }
`;

/**
 * TeamConfig의 스타일
 * @type {string}
 */
export const teamConfigStyles = `
  :host {
    display: block;
    margin-bottom: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .team-config {
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .team-config__header {
    margin-bottom: 16px;
  }
  
  .team-config__title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
  }
  
  .team-config__description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .team-config__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .form-input {
    padding: 12px 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.06);
    color: #ffffff;
    font-size: 14px;
    transition: all 0.2s ease;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25);
  }
  
  .form-button {
    display: inline-block;
    padding: 12px 16px;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    margin-top: 8px;
  }
  
  .form-button:hover {
    background-color: #4338ca;
  }
  
  .form-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.4);
  }
`;

/**
 * MemberInput의 스타일
 * @type {string}
 */
export const memberInputStyles = `
  :host {
    display: block;
    margin-bottom: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .member-input {
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 16px;
  }
  
  .member-input__header {
    margin-bottom: 16px;
  }
  
  .member-input__title {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
  }
  
  .member-input__description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }
  
  .member-input__form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .member-input__field {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.06);
    color: #ffffff;
    font-size: 14px;
    transition: all 0.2s ease;
  }
  
  .member-input__field:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.25);
  }
  
  .member-input__button {
    display: inline-block;
    padding: 12px 16px;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }
  
  .member-input__button:hover {
    background-color: #4338ca;
  }
  
  .member-input__status {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    padding: 8px 0;
  }
  
  .member-list {
    margin-top: 16px;
    list-style: none;
    padding: 0;
  }
  
  .member-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .member-list-item:last-child {
    border-bottom: none;
  }
  
  .member-name {
    color: #ffffff;
    font-size: 14px;
  }
  
  .member-remove {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .member-remove:hover {
    background-color: rgba(239, 68, 68, 0.2);
    color: white;
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