const { WebhookClient } = require('dialogflow-fulfillment');
const fetch = require('node-fetch');

// Fulfillment 핸들러
exports.dialogflowFirebaseFulfillment = (request, response) => {
    const agent = new WebhookClient({ request, response });

    // counselor API 호출 로직 추가
    async function getCounselorResponse(data) {
        const counselorApiUrl = 'https://us-central1-client-tcmk.cloudfunctions.net/dialogflowFirebaseFulfillment';
        
        try {
            const counselorResponse = await fetch(counselorApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return await counselorResponse.json();
        } catch (error) {
            console.error("Error fetching counselor's response:", error);
            return null;
        }
    }

    // 특정 인텐트 처리 로직
    function handleAssignmentsRequest(agent) {
        const userInput = agent.query;

        // counselor API에 데이터 전송 후 응답 처리
        return getCounselorResponse({ query: userInput })
            .then(counselorData => {
                if (counselorData) {
                    agent.add(`Counselor says: ${counselorData.message}`);
                } else {
                    agent.add(`Sorry, the counselor could not respond at this time.`);
                }
            });
    }

    // 인텐트와 함수 매핑
    let intentMap = new Map();
    intentMap.set('Assignments Intent', handleAssignmentsRequest);

    agent.handleRequest(intentMap);
};
