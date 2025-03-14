class TeamMember {
    #team;
    #idIndex;
    #id;
    #memberName;
    #isPM;

    constructor(member, team, index) {
        this.#team = team;
        this.#idIndex = index;
        this.#id = `${team}-${index + 1}`;
        this.#memberName = member;
        this.#isPM = false; // 기본값 고정
    }

    // Getters
    get team() {
        return this.#team;
    }

    get idIndex() {
        return this.#idIndex;
    }

    get id() {
        return this.#id;
    }

    get memberName() {
        return this.#memberName;
    }

    get isPM() {
        return this.#isPM;
    }

    // Setters
    set team(newTeam) {
        this.#team = newTeam;
        this.#id = `${newTeam}-${this.#idIndex + 1}`; // 팀이 변경되면 ID도 업데이트
    }

    set memberName(newName) {
        if (typeof newName === 'string' && newName.trim()) {
            this.#memberName = newName;
        } else {
            throw new Error('멤버 이름은 비어있지 않은 문자열이어야 합니다.');
        }
    }

    // isPM은 setter 대신 메서드로 제공 (false로 고정된 값을 외부에서 변경하지 못하도록)
    assignPM() {
        this.#isPM = true;
    }

    unassignPM() {
        this.#isPM = false;
    }

    // 객체 정보를 반환하는 메서드
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