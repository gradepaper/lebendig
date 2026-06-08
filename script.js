// ---------------------------------------------------------------------------
// Grading counter — counts UP from May 18, 2026, 8:00 AM Eastern.
// On that date US Eastern is on daylight time (EDT, UTC-4), not EST (UTC-5).
// ---------------------------------------------------------------------------

const START = new Date("2026-05-18T08:00:00-04:00");

const HOUR = 3600;
const DAY = 24 * HOUR;

// Factual-ish timeframes, expressed in hours. Sorted ascending by duration.
const ACTIVITIES = [
  { name: "watch a feature-length film", hours: 2 },
  { name: "bake a loaf of sourdough from scratch", hours: 4 },
  { name: "binge an entire season of TV", hours: 12 },
  { name: "read a 300-page novel", hours: 30 },
  { name: "read the whole Lord of the Rings trilogy", hours: 60 },
  { name: "learn to juggle three balls", hours: 48 },          // ~2 days
  { name: "learn to solve a Rubik's Cube", hours: 72 },        // ~3 days
  { name: "build a personal website from scratch", hours: 96 },// ~4 days
  { name: "learn 100 words of a new language", hours: 168 },   // 1 week
  { name: "pick up a brand-new hobby", hours: 504 },           // 3 weeks
  { name: "grow radishes from seed to harvest", hours: 672 },  // 4 weeks
  { name: "write a 50,000-word novel draft", hours: 720 },     // 30 days
  { name: "train for a 5K from the couch", hours: 1008 },      // 6 weeks
  { name: "get into noticeably better shape", hours: 2016 },   // 12 weeks
  { name: "hike the full Appalachian Trail", hours: 3960 },    // ~165 days
  { name: "gestate a human baby", hours: 6720 },               // 280 days
].sort((a, b) => a.hours - b.hours);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pad(n) {
  return String(n).padStart(2, "0");
}

// Turn a duration in hours into a friendly "how long it takes" string.
function durationLabel(hours) {
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  const days = hours / 24;
  if (days < 14) {
    const d = Math.round(days);
    return `${d} day${d === 1 ? "" : "s"}`;
  }
  const weeks = days / 7;
  if (weeks < 9) {
    return `${Math.round(weeks)} weeks`;
  }
  const months = days / 30.44;
  return `${Math.round(months)} months`;
}

// "unlocks in 2 days" style label for time remaining until an activity unlocks.
function unlockLabel(secondsRemaining) {
  if (secondsRemaining >= DAY) {
    const days = Math.ceil(secondsRemaining / DAY);
    return `unlocks in ${days} day${days === 1 ? "" : "s"}`;
  }
  if (secondsRemaining >= HOUR) {
    const hrs = Math.ceil(secondsRemaining / HOUR);
    return `unlocks in ${hrs} hour${hrs === 1 ? "" : "s"}`;
  }
  const mins = Math.max(1, Math.ceil(secondsRemaining / 60));
  return `unlocks in ${mins} minute${mins === 1 ? "" : "s"}`;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const els = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  list: document.getElementById("activityList"),
};

let renderedSignature = "";

function buildActivityList(elapsedSeconds) {
  // Only rebuild the DOM when the set of unlocked activities changes, so the
  // list doesn't churn every second.
  const unlockedCount = ACTIVITIES.filter(
    (a) => a.hours * HOUR <= elapsedSeconds
  ).length;
  const signature = `${unlockedCount}`;
  if (signature === renderedSignature) return;
  renderedSignature = signature;

  els.list.innerHTML = "";

  for (const activity of ACTIVITIES) {
    const costSeconds = activity.hours * HOUR;
    const unlocked = costSeconds <= elapsedSeconds;

    const li = document.createElement("li");
    li.className = `activity ${unlocked ? "active" : "locked"}`;

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = activity.name;

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = unlocked
      ? `takes ~${durationLabel(activity.hours)}`
      : unlockLabel(costSeconds - elapsedSeconds);

    li.appendChild(name);
    li.appendChild(meta);
    els.list.appendChild(li);
  }
}

function tick() {
  const now = Date.now();
  let elapsedSeconds = Math.floor((now - START.getTime()) / 1000);
  if (elapsedSeconds < 0) elapsedSeconds = 0;

  const days = Math.floor(elapsedSeconds / DAY);
  const hours = Math.floor((elapsedSeconds % DAY) / HOUR);
  const minutes = Math.floor((elapsedSeconds % HOUR) / 60);
  const seconds = elapsedSeconds % 60;

  els.days.textContent = days;
  els.hours.textContent = pad(hours);
  els.minutes.textContent = pad(minutes);
  els.seconds.textContent = pad(seconds);

  buildActivityList(elapsedSeconds);
}

tick();
setInterval(tick, 1000);
