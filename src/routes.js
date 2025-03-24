/**
 * API 라우팅을 담당하는 파일
 */
import { TeamDataController } from "./controllers/TeamDataController.js";
import { validateTeamData } from "./utils/validators.js";

// 상수 정의
const HTTP_HEADERS = {
  JSON: { "Content-Type": "application/json; charset=utf-8" }
};

const ERROR_MESSAGES = {
  NOT_FOUND: "API 엔드포인트를 찾을 수 없습니다.",
  INVALID_DATA: "유효하지 않은 데이터 형식입니다.",
  INVALID_JSON: "유효하지 않은 JSON 형식입니다.",
  METHOD_NOT_ALLOWED: "지원하지 않는 HTTP 메서드입니다.",
  INTERNAL_ERROR: "서버 내부 오류가 발생했습니다."
};

export class Router {
  constructor() {
    this.teamDataController = new TeamDataController();
    this.routes = {
      "/api/teams": this.handleTeamsRoute.bind(this),
    };
  }

  /**
   * JSON 응답을 보내는 헬퍼 메서드
   * @param {Object} res - HTTP 응답 객체
   * @param {number} statusCode - HTTP 상태 코드
   * @param {Object} data - 응답으로 보낼 데이터
   */
  sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, HTTP_HEADERS.JSON);
    res.end(JSON.stringify(data));
  }

  /**
   * 요청된 경로에 맞는 핸들러를 찾아 실행합니다.
   * @param {Object} req - HTTP 요청 객체
   * @param {Object} res - HTTP 응답 객체
   * @returns {boolean} 라우팅 처리 여부 (true: 처리됨, false: 처리되지 않음)
   */
  async handleRequest(req, res) {
    const handler = this.routes[req.url];

    if (handler) {
      await handler(req, res);
      return true;
    }

    if (req.url.startsWith("/api/")) {
      this.sendJsonResponse(res, 404, { error: ERROR_MESSAGES.NOT_FOUND });
      return true;
    }

    return false;
  }

  /**
   * /api/teams 경로에 대한 요청 처리
   * @param {Object} req - HTTP 요청 객체
   * @param {Object} res - HTTP 응답 객체
   */
  async handleTeamsRoute(req, res) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        let data = {};
        // 요청 메서드가 "POST"인지 확인합니다. 
        // POST 요청은 클라이언트가 서버에 데이터를 전송할 때 사용됩니다.
        if (req.method === "POST") {
          // 클라이언트로부터 받은 데이터의 본문을 JSON 형식으로 파싱합니다.
          // 이 데이터는 팀 정보를 포함하고 있습니다.
          data = JSON.parse(body);
          console.log("클라이언트에서 받은 데이터:", JSON.stringify(data, null, 2));

          // 파싱된 데이터의 유효성을 검사합니다.
          // validateTeamData 함수는 데이터가 유효한지 확인하고, 
          // 유효하지 않은 경우 오류 메시지와 함께 오류 정보를 반환합니다.
          const validation = validateTeamData(data);
          // 데이터가 유효하지 않은 경우, 400 상태 코드와 함께 오류 메시지를 응답합니다.
          if (!validation.valid) {
            this.sendJsonResponse(res, 400, {
              success: false,
              message: ERROR_MESSAGES.INVALID_DATA,
              errors: validation.errors,
            });
            return; // 오류가 발생했으므로 이후 코드를 실행하지 않고 종료합니다.
          }
        }

        // 요청 메서드에 따라 다른 처리를 수행합니다.
        // POST 요청인 경우, 클라이언트에서 보낸 데이터를 저장하고, 성공적인 응답을 반환합니다.
        // GET 요청인 경우, 현재 팀 데이터를 가져와서 응답합니다.
        // 그 외의 요청 메서드인 경우, 허용되지 않는 메서드라는 405 상태 코드를 반환합니다.
        if (req.method === "POST") {
          const result = await this.teamDataController.saveTeamData(data);
          this.sendJsonResponse(res, 200, result);
        } else if (req.method === "GET") {
          const result = await this.teamDataController.getCurrentTeamData();
          this.sendJsonResponse(res, 200, result);
        } else {
          this.sendJsonResponse(res, 405, { error: ERROR_MESSAGES.METHOD_NOT_ALLOWED });
        }
      } catch (error) {
        console.error("API 요청 처리 중 오류 발생:", error);

        // SyntaxError가 발생하고, 오류 메시지에 "JSON"이 포함되어 있는 경우
        // 클라이언트가 보낸 JSON 데이터가 잘못된 형식임을 의미합니다.
        // 이 경우 400 상태 코드와 함께 INVALID_JSON 오류 메시지를 응답합니다.
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
          this.sendJsonResponse(res, 400, { error: ERROR_MESSAGES.INVALID_JSON });
          return;
        }

        this.sendJsonResponse(res, 500, { error: ERROR_MESSAGES.INTERNAL_ERROR });
      }
    });
  }
}
