/**
 * @fileoverview 팀 분배 핵심 로직
 * @author Kongukjae
 * @version 1.0.0
 * 
 * @description
 * 이 모듈은 주어진 멤버 목록을 무작위로 섞어 홀수/짝수 팀으로 나누는 핵심 로직을 제공합니다.
 * Fisher-Yates 알고리즘을 사용하여 멤버를 섞고, 인덱스의 홀짝 여부에 따라 팀을 배정합니다.
 * 
 * @module TeamDistributor
 * @requires shuffleArray
 * @requires isOdd
 * @requires TeamMember
 */

import shuffleArray from "../utils/shuffleArray.js";
import { isOdd } from "../utils/odd-or-even-decision.js";
import TeamMember from "../models/TeamMember.js";

/**
 * @class TeamDistributor
 * @classdesc 팀 분배를 담당하는 핵심 클래스입니다.
 * 멤버들을 홀수/짝수 팀으로 나누고 관리하는 기능을 제공합니다.
 * 
 * @property {Object} teams - 팀 멤버들을 저장하는 객체
 * @property {Array<TeamMember>} teams.odd - 홀수 팀 멤버 목록
 * @property {Array<TeamMember>} teams.even - 짝수 팀 멤버 목록
 */
class TeamDistributor {
    /**
     * TeamDistributor 인스턴스를 생성합니다.
     * @constructor
     */
    constructor() {
        /**
         * @private
         * @type {Object}
         */
        this.teams = {
            odd: [],
            even: []
        };
    }

    /**
     * 주어진 멤버 배열을 섞어서 팀으로 분배합니다.
     * @method distribute
     * @param {Array<string>} members - 분배할 멤버들의 이름 배열
     * @returns {Object} 분배 결과
     * @returns {Object} result.teams - odd와 even 팀으로 분배된 TeamMember 인스턴스들
     * @returns {Array<string>} result.shuffledMembers - 섞인 순서의 멤버 배열
     * 
     * @example
     * const distributor = new TeamDistributor();
     * const members = ["멤버1", "멤버2", "멤버3", "멤버4"];
     * const { teams, shuffledMembers } = distributor.distribute(members);
     * console.log(teams.odd);  // 홀수 팀 멤버 목록
     * console.log(teams.even); // 짝수 팀 멤버 목록
     */
    distribute(members) {
        const shuffledResult = shuffleArray([...members]);
        const shuffledMembers = shuffledResult.shuffledArray;

        shuffledMembers.forEach((member, index) => {
            if (isOdd(index)) {
                this.#addToTeam(member, 'odd');
            } else {
                this.#addToTeam(member, 'even');
            }
        });

        return {
            teams: this.teams,
            shuffledMembers
        };
    }

    /**
     * 멤버를 지정된 팀에 추가합니다.
     * @private
     * @method #addToTeam
     * @param {string} member - 추가할 멤버의 이름
     * @param {('odd'|'even')} teamType - 추가할 팀 유형
     * @throws {Error} 잘못된 팀 유형이 지정된 경우
     */
    #addToTeam(member, teamType) {
        if (!this.teams[teamType]) {
            throw new Error(`Invalid team type: ${teamType}`);
        }
        
        const memberObj = new TeamMember(
            member, 
            teamType, 
            this.teams[teamType].length
        );
        this.teams[teamType].push(memberObj);
    }

    /**
     * 현재 팀 상태를 반환합니다.
     * @method getTeamStatus
     * @returns {Object} 현재 팀 상태
     * @returns {Array<TeamMember>} result.odd - 홀수 팀 멤버 목록
     * @returns {Array<TeamMember>} result.even - 짝수 팀 멤버 목록
     */
    getTeamStatus() {
        return {
            odd: this.teams.odd.map(member => member.getInfo()),
            even: this.teams.even.map(member => member.getInfo())
        };
    }
}

export default TeamDistributor; 