// DOM 요소
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");

// RSS 피드 목록
const rssFeeds = [
    {
        name: "Investing.com 경제뉴스",
        url: "https://www.investing.com/rss/news.rss"
    },
    {
        name: "Yahoo Finance Top Stories",
        url: "https://finance.yahoo.com/news/rss/"
    },
    {
        name: "한국은행 경제동향",
        url: "https://www.bok.or.kr/portal/bbs/B0000140/rss.do"
    }
];

// RSS 파싱
async function fetchRSS(feedUrl) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.items || [];
}

// 로딩
async function loadRSSReports() {
    summaryEl.textContent = "📡 RSS 데이터 로딩 중...";

    for (const feed of rssFeeds) {
        try {
            const items = await fetchRSS(feed.url);

            items.forEach(item => {
                const card = document.createElement("div");
                card.classList.add("card");

                // 카드 구성 요소
                const title = document.createElement("div");
                title.classList.add("card-title");
                title.textContent = item.title;

                const source = document.createElement("div");
                source.classList.add("card-source");
                source.textContent = feed.name;

                const date = document.createElement("div");
                date.classList.add("card-date");
                date.textContent = item.pubDate || "";

                card.appendChild(title);
                card.appendChild(source);
                card.appendChild(date);

                card.addEventListener("click", () => {
                    summaryEl.textContent = generateSummaryRSS(item);
                });

                listEl.appendChild(card);
            });

        } catch (error) {
            console.error("RSS 로딩 오류:", error);
        }
    }

    summaryEl.textContent = "리포트를 선택하세요.";
}

// 개선된 요약 함수
function generateSummaryRSS(item) {
    const cleanDescription = item.description
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const firstSentence = cleanDescription.split(".")[0] + ".";

    const words = cleanDescription.split(/\W+/);
    const freq = {};
    words.forEach(w => {
        if (w.length > 4) freq[w] = (freq[w] || 0) + 1;
    });
    const keywords = Object.keys(freq)
        .sort((a, b) => freq[b] - freq[a])
        .slice(0, 3);

    return `
📌 핵심 요약
- ${firstSentence}

📍 주요 키워드
- ${keywords.join(", ")}

📝 본문 일부
${cleanDescription.slice(0, 220)}...

🔗 전체 보기
${item.link}
    `;
}

loadRSSReports();
