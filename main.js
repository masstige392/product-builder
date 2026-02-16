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
const countdownLabel = document.getElementById("countdownLabel");
const topHeader = document.querySelector(".top-header");
const joinForm = document.querySelector("form.form-grid");
const submissionList = document.getElementById("submissionList");
const joinStatus = document.getElementById("joinStatus");
const reportForm = document.getElementById("reportForm");
const reportStatus = document.getElementById("reportStatus");
const STORAGE_KEY = "today-ad-submissions";

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

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function updateCountdown() {
  if (!countdownLabel) {
    return;
  }

  const now = new Date();
  const nextDraw = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const remaining = nextDraw - now;

  if (remaining <= 0) {
    renderTodayAd();
  }

  countdownLabel.textContent = `다음 광고 추첨까지 ${formatRemaining(remaining)}`;
}

function setupHeaderMotion() {
  if (!topHeader) {
    return;
  }

  let lastScrollY = window.scrollY;
  let headerHeight = topHeader.offsetHeight;
  let targetOffset = 0;
  let currentOffset = 0;
  let ticking = false;

  topHeader.classList.add("is-floating");

  function renderHeaderPosition() {
    currentOffset += (targetOffset - currentOffset) * 0.22;

    if (Math.abs(targetOffset - currentOffset) < 0.2) {
      currentOffset = targetOffset;
    }

    topHeader.style.transform = `translateY(-${currentOffset}px)`;

    if (Math.abs(targetOffset - currentOffset) > 0.2) {
      requestAnimationFrame(renderHeaderPosition);
    } else {
      ticking = false;
    }
  }

  function queueRender() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(renderHeaderPosition);
    }
  }

  window.addEventListener("resize", () => {
    headerHeight = topHeader.offsetHeight;
    targetOffset = Math.min(targetOffset, headerHeight);
    queueRender();
  });

  window.addEventListener("scroll", () => {
    const current = window.scrollY;
    const delta = current - lastScrollY;
    lastScrollY = current;

    if (delta > 0) {
      targetOffset = Math.min(headerHeight, targetOffset + delta);
    } else if (delta < 0) {
      targetOffset = Math.max(0, targetOffset + delta * 1.35);
    }

    if (current < 12) {
      targetOffset = 0;
    }

    queueRender();
  });
}

function readStoredSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeStoredSubmissions(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function handleJoinForm() {
  if (!joinForm || !location.pathname.endsWith("/join.html")) {
    return;
  }

  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(joinForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const adCopy = String(formData.get("ad_copy") || "").trim();
    const consent = formData.get("consent");

    if (!name || !email || !adCopy || !consent) {
      if (joinStatus) {
        joinStatus.textContent = "모든 항목을 입력하고 동의해 주세요.";
      }
      return;
    }

    const items = readStoredSubmissions();
    items.unshift({
      name,
      email,
      adCopy,
      createdAt: new Date().toISOString()
    });
    writeStoredSubmissions(items.slice(0, 100));

    joinForm.reset();
    if (joinStatus) {
      joinStatus.textContent = "제출 완료. Archive 페이지에서 로컬 저장 목록을 확인할 수 있습니다.";
    }
  });
}

function renderArchiveSubmissions() {
  if (!submissionList || !location.pathname.endsWith("/archive.html")) {
    return;
  }

  const items = readStoredSubmissions();
  const selectedYear = new URLSearchParams(window.location.search).get("year");
  submissionList.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "저장된 제출 내역이 없습니다. Join에서 먼저 제출해 주세요.";
    submissionList.appendChild(li);
    return;
  }

  const filtered = selectedYear
    ? items.filter((item) => String(new Date(item.createdAt).getFullYear()) === selectedYear)
    : items;

  if (!filtered.length) {
    const li = document.createElement("li");
    li.textContent = `${selectedYear}년 제출 내역이 없습니다.`;
    submissionList.appendChild(li);
    return;
  }

  filtered.slice(0, 20).forEach((item) => {
    const li = document.createElement("li");
    const date = new Date(item.createdAt).toLocaleDateString("ko-KR");
    li.textContent = `${date}: ${item.adCopy} (${item.name})`;
    submissionList.appendChild(li);
  });
}

function handleReportForm() {
  if (!reportForm || !location.pathname.endsWith("/report.html")) {
    return;
  }

  reportForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(reportForm);
    const reportType = String(formData.get("report_type") || "").trim();
    const detail = String(formData.get("detail") || "").trim();
    const email = String(formData.get("email") || "").trim();

    if (!reportType || !detail || !email) {
      if (reportStatus) {
        reportStatus.textContent = "모든 항목을 입력해 주세요.";
      }
      return;
    }

    const subject = `[Today Ad Report] ${reportType}`;
    const body = [
      `Report Type: ${reportType}`,
      `Reply Email: ${email}`,
      "",
      "Detail:",
      detail
    ].join("\n");

    const mailto = `mailto:csg090203@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    if (reportStatus) {
      reportStatus.textContent = "메일 앱이 열리지 않으면 csg090203@gmail.com 으로 직접 보내주세요.";
    }
  });
}

if (adLine && dateLabel && countdownLabel) {
  renderTodayAd();
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

setupHeaderMotion();
handleJoinForm();
renderArchiveSubmissions();
handleReportForm();
