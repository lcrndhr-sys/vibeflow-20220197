// 1) 더미 데이터
const reports = [
    { title: "반도체 산업 전망", company: "삼성증권", url: "https://example.com/a" },
    { title: "정유·화학 업종 분석", company: "미래에셋", url: "https://example.com/b" },
    { title: "2차전지 시장 분석", company: "신한투자", url: "https://example.com/c" },
    { title: "2026 경기전망 리포트", company: "KB증권", url: "https://example.com/d" },
    { title: "IT 산업 트렌드", company: "NH투자", url: "https://example.com/e" }
];

// UI 요소
const listEl = document.getElementById("reportList");
const summaryEl = document.getElementById("summary");

// 2) 목록 렌더링
reports.forEach((r, index) => {
    const li = document.createElement("li");
    li.textContent = `${r.company} - ${r.title}`;
    li.addEventListener("click", () => {
        summaryEl.textContent = generateSummary(r);
    });
    listEl.appendChild(li);
});

// 3) 요약 생성 로직 (Copilot이 읽었다고 가정)
function generateSummary(report) {
    return `
[요약 생성됨]
${report.company}에서 발행한 "${report.title}" 리포트는 업계 동향과 향후 전망을 분석하고 있으며,
주요 이슈, 리스크 요인, 투자 포인트 등을 제시합니다.

(※ 실제 URL 분석은 아직 연결하지 않은 상태입니다)
    `;
}
