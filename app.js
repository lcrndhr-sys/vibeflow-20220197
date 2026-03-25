// DOM 요소
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");
const searchInput = document.getElementById("searchInput");

// RSS 피드 (안정적으로 작동하는 3종)
const rssFeeds = [
    { name: "Investing.com 경제뉴스", url: "https://www.investing.com/rss/news.rss" },
    { name: "Yahoo Finance Top Stories", url: "https://finance.yahoo.com/news/rss/" },
    { name: "한국은행 경제동향", url: "https://www.bok.or.kr/portal/bbs/B0000140/rss.do" }
];

// RSS → JSON 변환
async function fetchRSS(feedUrl) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.items || [];
}

// 전체 리포트 저장
let allReports = [];

// 1) RSS 데이터 로딩
async function loadRSSReports() {
    summaryEl.textContent = "📡 RSS 데이터 로딩 중...";

    for (const feed of rssFeeds) {
        try {
            const items = await fetchRSS(feed.url);

            const parsed = items.map(item => ({
                title: item.title,
                description: item.description,
                link: item.link,
                pubDate: item.pubDate,
                source: feed.name
            }));

            allReports = [...allReports, ...parsed];
        } catch (err) {
            console.error("RSS 오류:", err);
        }
    }

    summaryEl.textContent = "리포트를 선택하세요.";
    renderReports(allReports);
}

// 2) 카드 UI 렌더링
function renderReports(reports) {
    listEl.innerHTML = "";

    reports.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <div class="card-title">${item.title}</div>
            <div class="card-source">${item.source}</div>
            <div class="card-date">${item.pubDate || ""}</div>
        `;

        card.addEventListener("click", () => {
            summaryEl.textContent = summarizeDescription(item);
        });

        listEl.appendChild(card);
    });
}

// 3) 검색 기능
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    const filtered = allReports.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.source.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    );

    renderReports(filtered);
});

// 4) 요약 알고리즘 (본문 기반 요약)
function summarizeDescription(item) {
    const raw = item.description || "";
    const clean = raw
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const firstSentence = clean.split(".")[0] + ".";

    return `
📌 핵심 요약
- ${firstSentence}

📝 본문 일부:
${clean.slice(0, 300)}...

🔗 전체 보기:
${item.link}
    `;
}

// 실행
loadRSSReports();
