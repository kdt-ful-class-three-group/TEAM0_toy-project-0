/**
 * @fileoverview 팀 분배 핵심 로직
 * @author Kongukjae
 * @version 1.0.0
 */

import shuffleArray from "../utils/shuffleArray.js";
import { isOdd } from "../utils/odd-or-even-decision.js";
import TeamMember from "../models/TeamMember.js";

/**
 * @class TeamDistributor
 * @description 팀 분배를 담당하는 핵심 클래스
 */
class TeamDistributor {
    constructor() {
        this.teams = {
            odd: [],
            even: []
        };
    }

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

    #addToTeam(member, teamType) {
        const memberObj = new TeamMember(
            member, 
            teamType, 
            this.teams[teamType].length
        );
        this.teams[teamType].push(memberObj);
    }
}

export default TeamDistributor; 