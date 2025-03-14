/**
 * @fileoverview 팀 멤버 정보 관리 모델
 * @author Kongukjae
 * @version 1.0.0
 * 
 * @description
 * 이 모듈은 각 팀 멤버의 정보를 관리하는 클래스를 제공합니다.
 * 멤버의 기본 정보(이름, 팀, ID)와 역할(PM 여부) 등을 캡슐화하여 관리합니다.
 */

/**
 * @class TeamMember
 * @classdesc 팀 멤버의 정보를 관리하는 클래스입니다.
 * 
 * @property {string} #team - 멤버가 속한 팀 (private)
 * @property {number} #idIndex - 멤버의 인덱스 번호 (private)
 * @property {string} #id - 팀-인덱스 형식의 고유 ID (private)
 * @property {string} #memberName - 멤버의 이름 (private)
 * @property {boolean} #isPM - PM 역할 여부 (private)
 * 
 * @example
 * const member = new TeamMember("홍길동", "odd", 0);
 * console.log(member.getInfo());
 * // 출력:
 * // {
 * //   team: "odd",
 * //   idIndex: 0,
 * //   id: "odd-1",
 * //   memberName: "홍길동",
 * //   isPM: false
 * // }
 */
class TeamMember {
    #team;
    #idIndex;
    #id;
    #memberName;
    #isPM;

    /**
     * TeamMember 인스턴스를 생성합니다.
     * @constructor
     * @param {string} member - 멤버의 이름
     * @param {string} team - 소속될 팀 (odd/even)
     * @param {number} index - 멤버의 인덱스 번호
     * 
     * @example
     * const member = new TeamMember("홍길동", "odd", 0);
     */
    constructor(member, team, index) {
        this.#team = team;
        this.#idIndex = index;
        this.#id = `${team}-${index + 1}`;
        this.#memberName = member;
        this.#isPM = false;
    }

    /**
     * 멤버가 속한 팀을 반환합니다.
     * @type {string}
     */
    get team() {
        return this.#team;
    }

    /**
     * 멤버의 인덱스 번호를 반환합니다.
     * @type {number}
     */
    get idIndex() {
        return this.#idIndex;
    }

    /**
     * 멤버의 고유 ID를 반환합니다.
     * @type {string}
     */
    get id() {
        return this.#id;
    }

    /**
     * 멤버의 이름을 반환합니다.
     * @type {string}
     */
    get memberName() {
        return this.#memberName;
    }

    /**
     * 멤버의 PM 역할 여부를 반환합니다.
     * @type {boolean}
     */
    get isPM() {
        return this.#isPM;
    }

    /**
     * 멤버의 팀을 변경합니다.
     * 팀이 변경되면 ID도 자동으로 업데이트됩니다.
     * @param {string} newTeam - 새로운 팀 이름
     * 
     * @example
     * const member = new TeamMember("홍길동", "odd", 0);
     * member.team = "even";  // 팀 변경
     * console.log(member.id);  // "even-1" 출력
     */
    set team(newTeam) {
        this.#team = newTeam;
        this.#id = `${newTeam}-${this.#idIndex + 1}`;
    }

    /**
     * 멤버의 이름을 변경합니다.
     * @param {string} newName - 새로운 이름
     * @throws {Error} 빈 문자열이나 공백만 있는 경우 에러 발생
     * 
     * @example
     * const member = new TeamMember("홍길동", "odd", 0);
     * member.memberName = "김철수";  // 이름 변경
     * member.memberName = "";  // Error: 멤버 이름은 비어있지 않은 문자열이어야 합니다.
     */
    set memberName(newName) {
        if (typeof newName === 'string' && newName.trim()) {
            this.#memberName = newName;
        } else {
            throw new Error('멤버 이름은 비어있지 않은 문자열이어야 합니다.');
        }
    }

    /**
     * 멤버에게 PM 역할을 부여합니다.
     * @method assignPM
     * @description
     * PM(Project Manager) 역할을 부여하는 메서드입니다.
     * 이미 PM인 경우에도 안전하게 동작합니다.
     * 
     * @example
     * // 기본 사용법
     * const member = new TeamMember("홍길동", "odd", 0);
     * member.assignPM();
     * console.log(member.isPM);  // true
     * 
     * // 팀 내 PM 지정 예시
     * const teamMembers = [
     *   new TeamMember("홍길동", "odd", 0),
     *   new TeamMember("김철수", "odd", 1)
     * ];
     * // 첫 번째 멤버를 PM으로 지정
     * teamMembers[0].assignPM();
     */
    assignPM() {
        this.#isPM = true;
    }

    /**
     * 멤버의 PM 역할을 해제합니다.
     * @method unassignPM
     * @description
     * PM(Project Manager) 역할을 해제하는 메서드입니다.
     * PM이 아닌 경우에도 안전하게 동작합니다.
     * 
     * @example
     * // 기본 사용법
     * const member = new TeamMember("홍길동", "odd", 0);
     * member.assignPM();    // PM 지정
     * console.log(member.isPM);  // true
     * member.unassignPM();  // PM 해제
     * console.log(member.isPM);  // false
     * 
     * // PM 교체 시나리오
     * const teamMembers = [
     *   new TeamMember("홍길동", "odd", 0),
     *   new TeamMember("김철수", "odd", 1)
     * ];
     * teamMembers[0].assignPM();     // 홍길동을 PM으로 지정
     * teamMembers[0].unassignPM();   // 홍길동의 PM 해제
     * teamMembers[1].assignPM();     // 김철수를 새로운 PM으로 지정
     */
    unassignPM() {
        this.#isPM = false;
    }

    /**
     * 멤버의 모든 정보를 객체 형태로 반환합니다.
     * @method getInfo
     * @returns {Object} 멤버 정보 객체
     * @returns {string} returns.team - 소속 팀
     * @returns {number} returns.idIndex - 인덱스 번호
     * @returns {string} returns.id - 고유 ID
     * @returns {string} returns.memberName - 멤버 이름
     * @returns {boolean} returns.isPM - PM 여부
     * 
     * @example
     * const member = new TeamMember("홍길동", "odd", 0);
     * member.assignPM();
     * console.log(member.getInfo());
     * // {
     * //   team: "odd",
     * //   idIndex: 0,
     * //   id: "odd-1",
     * //   memberName: "홍길동",
     * //   isPM: true
     * // }
     */
    getInfo() {
        return {
            team: this.#team,
            idIndex: this.#idIndex,
            id: this.#id,
            memberName: this.#memberName,
            isPM: this.#isPM
        };
    }
}

export default TeamMember; 