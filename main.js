const ads = [
  "오늘의 한 줄: 클릭은 짧게, 기억은 길게.",
  "당신의 일상에 딱 맞는 서비스, 지금 시작하세요.",
  "광고도 콘텐츠다. 좋은 메시지는 스킵되지 않습니다.",
  "작은 배너 하나가 큰 전환을 만듭니다.",
  "보는 순간 이해되는 광고, 오늘 바로 경험하세요.",
  "매일 바뀌는 한 줄, 매일 달라지는 브랜드 인상.",
  "짧지만 강한 문장으로 고객의 시간을 아껴드립니다.",
  "첫 3초를 잡으면, 나머지 30초는 자연스럽습니다.",
  "눈에 띄는 디자인보다 중요한 건 기억에 남는 메시지.",
  "한 번 본 광고가 다시 떠오르는 순간, 전환이 시작됩니다."
];

const adLine = document.getElementById("adLine");
const dateLabel = document.getElementById("dateLabel");
const refreshBtn = document.getElementById("refreshBtn");

function getDayIndex(date = new Date()) {
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = Math.floor(utcMidnight / 86400000);
  return dayNumber % ads.length;
}

function formatDateKR(date = new Date()) {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
}

function renderTodayAd() {
  const now = new Date();
  const index = getDayIndex(now);
  adLine.textContent = ads[index];
  dateLabel.textContent = `${formatDateKR(now)} 기준`;
}

refreshBtn.addEventListener("click", renderTodayAd);
renderTodayAd();
