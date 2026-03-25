// DOM 요소
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");

// RSS 피드 목록 (작동 테스트용)
const rssFeeds = [
    {
        name: "한국은행 경제동향",
        url: "https://www.bok.or.kr/portal/bbs/B0000140/rss.do"
    },
    {
        name: "Investing.com 경제뉴스",
        url: "https://www.investing.com/rss/news.rss"
    },
    {
        name: "OECD 경제리포트",
        url: "https://oecdcrossanalytics.org/feed/"
    }
];

// RSS 파싱 함수 (rss2json API 사용)
async function fetchRSS(feedUrl) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.items || [];
}

// 초기 RSS 로딩
async function loadRSSReports() {
    summaryEl.textContent = "📡 RSS 데이터 로딩 중...";

    for (const feed of rssFeeds) {
        try {
            const items = await fetchRSS(feed.url);

            items.forEach(item => {
                const li = document.createElement("li");
                li.textContent = `[${feed.name}] ${item.title}`;
                
                li.addEventListener("click", () => {
                    summaryEl.textContent = generateSummaryRSS(item);
                });

                listEl.appendChild(li);
            });

        } catch (error) {
            console.error("RSS 로딩 오류:", error);
        }
    }

    summaryEl.textContent = "리포트를 선택하세요.";
}

// 요약 생성 함수
function generateSummaryRSS(item) {
    const cleanDescription = item.description
        .replace(/<[^>]*>/g, "")      // HTML 제거
        .replace(/\s+/g, " ")         // 공백 정리
        .trim();

    return `
📄 제목: ${item.title}

📝 자동 요약:
${cleanDescription.slice(0, 250)}...

🔗 전체 보기:
${item.link}
    `;
}

// 실행
loadRSSReports();
