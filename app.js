// DOM 요소
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");
const searchInput = document.getElementById("searchInput");

// RSS 피드 목록
const rssFeeds = [
    { name: "Investing.com 경제뉴스", url: "https://www.investing.com/rss/news.rss" },
    { name: "Yahoo Finance Top Stories", url: "https://finance.yahoo.com/news/rss/" },
    { name: "한국은행 경제동향", url: "https://www.bok.or.kr/portal/bbs/B0000140/rss.do" }
];

// RSS → JSON 파싱
async function fetchRSS(feedUrl) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.items || [];
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

// 카드 UI 렌더링
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

        card.addEventListener("click", async () => {
            summaryEl.textContent = "📡 리포트 불러오는 중...";

            // API 호출: 실제 HTML 가져옴
            const result = await fetchReport(item.link);

            // HTML 요약
            const summary = summarizeHTML(result.snippet);

            // 화면 출력
            summaryEl.textContent = summary;
        });

        listEl.appendChild(card);
    });
}

// 검색 기능
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    const filtered = allReports.filter(item => 
        item.title.toLowerCase().includes(keyword) ||
        item.source.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    );

    renderReports(filtered);
});

// Vercel API 호출
async function fetchReport(url) {
  const api = `https://report-api-sigma.vercel.app/api/report?url=${encodeURIComponent(url)}`;
  const response = await fetch(api);
  const data = await response.json();
  return data;
}

// HTML 요약
function summarizeHTML(html) {
  const text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const firstSentence = text.split(".")[0] + ".";

  return `
📌 리포트 요약
- ${firstSentence}

📝 본문 일부:
${text.slice(0, 300)}...

  
원문 전체는 링크에서 확인하세요.
  `;
}

loadRSSReports();
