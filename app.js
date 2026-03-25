//-------------------------------------------
// DOM 요소
//-------------------------------------------
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");
const searchInput = document.getElementById("searchInput");

//-------------------------------------------
// RSS 피드
//-------------------------------------------
const rssFeeds = [
    { name: "Investing.com 경제뉴스", url: "https://www.investing.com/rss/news.rss" },
    { name: "Yahoo Finance Top Stories", url: "https://finance.yahoo.com/news/rss/" },
    { name: "한국은행 경제동향", url: "https://www.bok.or.kr/portal/bbs/B0000140/rss.do" }
];

//-------------------------------------------
// RSS → JSON 변환
//-------------------------------------------
async function fetchRSS(feedUrl) {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const res = await fetch(api);
    const data = await res.json();
    return data.items || [];
}

//-------------------------------------------
// Vercel API fetchHTML
//-------------------------------------------
async function fetchHTML(url) {
    try {
        const api = `https://report-api-sigma.vercel.app/api/report?url=${encodeURIComponent(url)}`;
        const response = await fetch(api);
        return await response.json();
    } catch (e) {
        return { snippet: "" };
    }
}

//-------------------------------------------
// 텍스트 정리
//-------------------------------------------
function cleanText(raw) {
    if (!raw) return "";
    return raw
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

//-------------------------------------------
// 요약 HTML 생성
//-------------------------------------------
function formatSummary(text, url) {
    if (!text || text.length < 10) {
        return `
❗ 본문을 자동으로 가져오지 못했습니다.<br><br>
🔗 <a href="${url}" target="_blank">전체 보기 (원문 페이지 열기)</a>
        `;
    }

    const first = text.split(".")[0] + ".";

    return `
📌 <b>핵심 요약</b><br>
- ${first}<br><br>

📝 <b>본문 일부</b><br>
${text.slice(0, 400)}...<br><br>

🔗 <b>전체 보기:</b> 
<a href="${url}" target="_blank">원문 페이지 열기</a>
    `;
}

//-------------------------------------------
// 목록 렌더링
//-------------------------------------------
let allReports = [];

function renderReports(reports) {
    listEl.innerHTML = "";

    reports.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <div><b>${item.title}</b></div>
            <div>${item.source}</div>
            <div>${item.pubDate || ""}</div>
        `;

        card.addEventListener("click", () => handleClick(item));

        listEl.appendChild(card);
    });
}

//-------------------------------------------
// 리포트 클릭 처리
//-------------------------------------------
async function handleClick(item) {
    summaryEl.textContent = "⏳ 요약 생성 중...";

    // 1) RSS 본문 우선 사용
    const cleaned = cleanText(item.description);
    if (cleaned.length > 50) {
        summaryEl.innerHTML = formatSummary(cleaned, item.link);
        return;
    }

    // 2) HTML 자동 fetch
    const result = await fetchHTML(item.link);
    const htmlText = cleanText(result.snippet);
    summaryEl.innerHTML = formatSummary(htmlText, item.link);
}

//-------------------------------------------
// 검색 기능
//-------------------------------------------
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allReports.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        cleanText(item.description).toLowerCase().includes(keyword)
    );
    renderReports(filtered);
});

//-------------------------------------------
// 초기 RSS 로딩
//-------------------------------------------
async function loadRSSReports() {
    summaryEl.textContent = "📡 RSS 불러오는 중...";

    for (const feed of rssFeeds) {
        const items = await fetchRSS(feed.url);

        const parsed = items.map(item => ({
            title: item.title,
            description: item.description,
            link: item.link,
            pubDate: item.pubDate,
            source: feed.name
        }));

        allReports.push(...parsed);
    }

    summaryEl.textContent = "리포트를 선택하세요.";
    renderReports(allReports);
}

loadRSSReports();
``
