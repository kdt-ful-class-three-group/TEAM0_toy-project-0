/**
 * @function renderTeamList
 * @description 팀 리스트의 innerHTML 템플릿을 반환합니다.
 * @param {Array} teams 팀 목록
 * @returns {string} HTML
 */
export const renderTeamList = (teams = []) => {
  if (!teams.length) {
    return `
      <div class="card">
        <div class="card__content">
          <div class="status-message">
            팀이 아직 생성되지 않았습니다.
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="card__content">
        ${teams.map((team, index) => `
          <div class="team-item">
            <h3 class="team-item__title">Team ${index + 1}</h3>
            <div class="team-item__members">
              ${team.map(member => `
                <span class="team-item__member">${member}</span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}; 