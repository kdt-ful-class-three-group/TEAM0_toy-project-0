import shuffleArray from "../utils/shuffleArray.js";
import { isOdd } from "../utils/odd-or-even-decision.js";
import TeamMember from "../models/TeamMember.js";

/**
 * @function distributeTeams
 * @param {Array<string>} members - 분배할 멤버들의 배열
 * @returns {Object} odd와 even 팀으로 분배된 TeamMember 인스턴스들
 * @description
 * 주어진 멤버 배열을 홀수/짝수 인덱스를 기준으로 팀을 분배합니다.
 * 1. 멤버 배열을 무작위로 섞습니다.
 * 2. 섞인 배열을 순회하며 인덱스의 홀짝 여부에 따라 팀을 배정합니다.
 * 3. 각 멤버를 TeamMember 인스턴스로 생성하여 해당 팀에 추가합니다.
 * 
 * @example
 * const members = ["멤버1", "멤버2", "멤버3", "멤버4"];
 * const teams = distributeTeams(members);
 * console.log(teams.odd);  // 홀수 팀 멤버 목록
 * console.log(teams.even); // 짝수 팀 멤버 목록
 */
const distributeTeams = (members) => {
    const teams = {
        odd: [],
        even: []
    };

    // 멤버 배열 섞기
    const shuffledResult = shuffleArray([...members]);
    const shuffledMembers = shuffledResult.shuffledArray;

    // 팀 분배
    shuffledMembers.forEach((member, index) => {
        if (isOdd(index)) {
            const memberObj = new TeamMember(member, 'odd', teams.odd.length);
            teams.odd.push(memberObj);
        } else {
            const memberObj = new TeamMember(member, 'even', teams.even.length);
            teams.even.push(memberObj);
        }
    });

    return {
        teams,
        shuffledMembers // 섞인 순서도 함께 반환
    };
};

export default distributeTeams; 