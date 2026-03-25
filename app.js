// DOM 요소
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");
const searchInput = document.getElementById("searchInput");

// RSS 피드
const rssFeeds = [
    { name: "Investing.com 경제뉴스", url: "https://www.investing.com/rss/news.rss" },
    { name: "Yahoo Finance Top Stories", url: "https://finance.yahoo.com/news/rss/" },
    { name: "한국은행 경제동향", url: "https://www.bok.or.kr/portal/bbs/B0000140/rss.do" }
];

// RSS → JSON
async function fetchRSS(feedUrl) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.items || [];
}

// Vercel API 통해 HTML 크롤링
async function fetchHTML(url) {
    const api = `https://report-api-sigma.vercel.app/api/report?url=${encodeURIComponent(url)}`;
    const response = await fetch(api);
    return response.json();   // { title, snippet }
}

// 전체 리포트 저장
let allReports = [];

// RSS 로딩
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

// 카드 렌더링
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

        card.addEventListener("click", () => handleReportClick(item));

        listEl.appendChild(card);
    });
}

// 클릭 시 요약 처리 (본문 있으면 RSS 기반, 없으면 HTML 자동 fetch)
async function handleReportClick(item) {
    summaryEl.textContent = "📡 리포트 본문 확인 중...";

    // 1) RSS본문이 있는 경우 → RSS 요약
    const cleaned = cleanText(item.description);
    if (cleaned.length > 30) {
        summaryEl.innerHTML = formatSummary(cleaned, item.link);
        return;
    }

    // 2) RSS 본문이 없으면 → Vercel API로 HTML 가져오기
    summaryEl.textContent = "🔍 RSS 본문 없음 → HTML 크롤링 중...";

    const result = await fetchHTML(item.link);   // {snippet}
    const htmlText = cleanText(result.snippet);

    summaryEl.innerHTML = formatSummary(htmlText, item.link);
}

// HTML/텍스트 정리
function cleanText(raw) {
    if (!raw) return "";
    return raw
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// 요약 구성 + 링크 하이퍼링크 처리
function formatSummary(text, url) {
    const first = text.length > 0 ? text.split(".")[0] + "." : "본문 정보를 가져올 수 없습니다.";

    return `
📌 <b>핵심 요약</b><br>
- ${first}<br><br>

📝 <b>본문 일부</b><br>
${text.slice(0, 400)}...<br><br>

🔗 <b>전체 보기:</b> <a href="${url}" target="_blank" style="color:blue;">리포트 페이지 열기</a>
    `;
}

// 검색
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    const filtered = allReports.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.source.toLowerCase().includes(keyword) ||
        cleanText(item.description).toLowerCase().includes(keyword)
    );

    renderReports(filtered);
});

// 실행
loadRSSReports();
