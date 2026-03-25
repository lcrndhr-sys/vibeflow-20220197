// DOM 요소
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");

// RSS 피드 목록 (안전하게 작동하는 3개)
const rssFeeds = [
    {
        name: "Investing.com 경제 분석",
        url: "https://www.investing.com/rss/news_25.rss"
    },
    {
        name: "Reuters 비즈니스 뉴스",
        url: "https://feeds.reuters.com/reuters/businessNews"
    },
    {
        name: "Yahoo Finance Top Stories",
        url: "https://finance.yahoo.com/news/rss/"
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
