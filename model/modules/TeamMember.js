/**
 * @class TeamMember
 * @description 팀 멤버의 정보를 관리하는 클래스
 * 각 멤버는 팀 소속, ID, PM 여부 등의 정보를 가집니다.
 */
class TeamMember {
  #team;
  #idIndex;
  #id;
  #memberName;
  #isPM;

  /**
   * @constructor
   * @param {string} member - 멤버의 이름
   * @param {string} team - 소속될 팀 (odd/even)
   * @param {number} index - 멤버의 인덱스 번호
   */
  constructor(member, team, index) {
    this.#team = team;
    this.#idIndex = index;
    this.#id = `${team}-${index + 1}`;
    this.#memberName = member;
    this.#isPM = false; // 기본값 고정
  }

  /**
   * @getter team
   * @returns {string} 멤버가 속한 팀명
   */
  get team() {
    return this.#team;
  }

  /**
   * @getter idIndex
   * @returns {number} 멤버의 인덱스 번호
   */
  get idIndex() {
    return this.#idIndex;
  }

  /**
   * @getter id
   * @returns {string} 팀명-인덱스 형식의 고유 ID
   */
  get id() {
    return this.#id;
  }

  /**
   * @getter memberName
   * @returns {string} 멤버의 이름
   */
  get memberName() {
    return this.#memberName;
  }

  /**
   * @getter isPM
   * @returns {boolean} PM 여부
   */
  get isPM() {
    return this.#isPM;
  }

  /**
   * @setter team
   * @param {string} newTeam - 변경할 팀명
   * @description 팀 변경 시 자동으로 ID도 업데이트됨
   */
  set team(newTeam) {
    this.#team = newTeam;
    this.#id = `${newTeam}-${this.#idIndex + 1}`;
  }

  /**
   * @setter memberName
   * @param {string} newName - 변경할 멤버 이름
   * @throws {Error} 빈 문자열이나 공백만 있는 경우 에러 발생
   */
  set memberName(newName) {
    if (typeof newName === "string" && newName.trim()) {
      this.#memberName = newName;
    } else {
      throw new Error("멤버 이름은 비어있지 않은 문자열이어야 합니다.");
    }
  }

  /**
   * @method assignPM
   * @description PM 역할 부여 메서드
   * - PM(Project Manager) 역할을 부여합니다
   * - 이미 PM인 경우에도 안전하게 true로 설정됩니다
   * - 한 번 PM으로 지정된 후에는 unassignPM() 메서드로만 해제 가능합니다
   * @example
   * const member = new TeamMember("홍길동", "odd", 0);
   * member.assignPM(); // isPM이 true로 설정됨
   */
  assignPM() {
    this.#isPM = true;
  }

  /**
   * @method unassignPM
   * @description PM 역할 해제 메서드
   * - PM(Project Manager) 역할을 해제합니다
   * - PM이 아닌 경우에도 안전하게 false로 설정됩니다
   * - PM 역할이 해제된 후에는 assignPM() 메서드로만 재지정 가능합니다
   * @example
   * const member = new TeamMember("홍길동", "odd", 0);
   * member.assignPM();    // PM 지정
   * member.unassignPM();  // PM 해제
   */
  unassignPM() {
    this.#isPM = false;
  }

  /**
   * @method getInfo
   * @returns {Object} 멤버의 모든 정보를 담은 객체
   * @description
   * 멤버의 private 필드들을 외부에서 접근 가능한 형태로 반환합니다.
   * JSON 직렬화 등에 사용됩니다.
   */
  getInfo() {
    return {
      team: this.#team,
      idIndex: this.#idIndex,
      id: this.#id,
      memberName: this.#memberName,
      isPM: this.#isPM,
    };
  }
}

export default TeamMember;
