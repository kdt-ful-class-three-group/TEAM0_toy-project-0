import { BaseComponent } from './BaseComponent.js';
import { NavComponent } from './NavComponent.js';
import { MemberList } from './MemberList.js';
import { TeamDistributor } from './TeamDistributor.js';

// 폼 컴포넌트 임포트
import { TeamConfig } from './form/TeamConfig.js';
import { TotalMembersConfig } from './form/TotalMembersConfig.js';
import { MemberInput } from './form/MemberInput.js';
import { TeamResult } from './form/TeamResult.js';
import { FormPanel } from './form/FormPanel.js';
import { MainPanel } from './form/MainPanel.js';

/**
 * @function registerComponents
 * @description 모든 Web Component를 등록합니다.
 */
export function registerComponents() {
  console.trace("checkpoint - Web Component 등록 시작");

  // 컴포넌트 정의 목록 구성
  const componentDefinitions = [
    { name: "nav-component", constructor: NavComponent },
    { name: "member-list", constructor: MemberList },
    { name: "team-distributor", constructor: TeamDistributor },
    { name: "team-config", constructor: TeamConfig },
    { name: "total-members-config", constructor: TotalMembersConfig },
    { name: "member-input", constructor: MemberInput },
    { name: "team-result", constructor: TeamResult },
    { name: "form-panel", constructor: FormPanel },
    { name: "main-panel", constructor: MainPanel }
  ];
  
  // 컴포넌트 등록
  componentDefinitions.forEach(({ name, constructor }) => {
    if (!customElements.get(name)) {
      customElements.define(name, constructor);
      console.debug(`컴포넌트 등록: ${name}`);
    }
  });

  console.info("모든 웹 컴포넌트 등록 완료");
}

// BaseComponent 클래스 내보내기
export { BaseComponent }; 