/**
 * @file FormPanel.js
 * @description 모든 폼 컴포넌트를 통합하는 패널 컴포넌트
 */

import { BaseComponent } from '../BaseComponent.js';
import { formPanelStyles } from '../../styles/componentStyles.js';

/**
 * 폼 요소들을 한 패널에 통합하는 컴포넌트
 * @extends BaseComponent
 */
export class FormPanel extends BaseComponent {
  constructor() {
    super({
      useShadow: true,
      styleSheet: null,
      styles: formPanelStyles,
      useCommonStyles: true,
      useUtilityStyles: true
    });
  }

  initialize() {
    // 초기화 코드가 필요한 경우 여기에 추가
  }

  render() {
    // FormPanel은 단순히 다른 컴포넌트들을 포함하는 컨테이너 역할
    this.shadowRoot.innerHTML = `
      <div class="form-panel">
        <team-config></team-config>
        <total-members-config></total-members-config>
        <member-input></member-input>
      </div>
    `;
  }
} 