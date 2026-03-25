// DOM 요소
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");
const searchInput = document.getElementById("searchInput");

// RSS 목록
const rssFeeds = [
    { name: "Investing.com 경제뉴스", url: "https://www.investing.com/rss/news.rss" },
    { name: "Yahoo Finance Top Stories", url: "https://finance.yahoo.com/news/rss/" },
    { name: "한국은행 경제동향", url: "https://www.bok.or.kr/portal/bbs/B0000140/rss.do" }
];

// RSS 파싱
async function fetchRSS(feedUrl) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.items || [];
}

// 저장용 데이터
let allReports = [];

// 초기 RSS 로딩
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

// 카드 렌더링 함수
function renderReports(reports) {
    listEl.innerHTML = "";

    reports.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card");

        const title = document.createElement("div");
        title.classList.add("card-title");
        title.textContent = item.title;

        const source = document.createElement("div");
        source.classList.add("card-source");
        source.textContent = item.source;

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
}

// 필터 기능
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    const filtered = allReports.filter(item => 
        item.title.toLowerCase().includes(keyword) ||
        item.source.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    );

    renderReports(filtered);
});

// 리포트 요약
function generateSummaryRSS(item) {
    // description이 비어있거나 undefined인 경우 대비
    const rawDesc = item.description || "";
    const clean = rawDesc
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    // description이 없는 경우 기본 안내문 생성
    const fallbackText = clean.length > 0 
        ? clean 
        : `${item.source}에서 제공한 "${item.title}" 항목은 본문(description) 데이터를 제공하지 않았습니다. 
아래 '전체 보기' 링크를 통해 원문을 확인하세요.`;

    // 핵심 한줄 요약 생성
    const firstSentence = fallbackText.split(".")[0] + ".";

    // 키워드 추출 (description이 있을 때만)
    const words = fallbackText.split(/\W+/);
    const freq = {};
    words.forEach(w => {
        if (w.length > 4) freq[w] = (freq[w] || 0) + 1;
    });
    const keywords = Object.keys(freq)
        .sort((a, b) => freq[b] - freq[a])
        .slice(0, 3)
        .join(", ");

    return `
📌 핵심 요약
- ${firstSentence}

📍 주요 키워드
- ${keywords || "키워드를 추출할 수 없습니다"}

📝 본문 일부
${fallbackText.slice(0, 250)}...

🔗 전체 보기
${item.link}
    `;
}

loadRSSReports();
``
async function fetchReport(url) {
  const api = `https://report-api-sigma.vercel.app/api/report?url=${encodeURIComponent(url)}`;
  const data = await fetch(api).then(r => r.json());
  console.log(data);
}
async function fetchReport(url) {
  const api = `https://report-api-sigma.vercel.app/api/report?url=${encodeURIComponent(url)}`;
  const response = await fetch(api);
  const data = await response.json();
  return data;  // { title, snippet }
}
