// ---------------------------------------------------------------------------
// Two count-up clocks for one ungraded paper.
//   MAIN:   counts up from May 18, 2026, 8:00 AM Eastern (paper submitted)
//   RETAKE: counts up from June 4, 2026, 8:00 AM Eastern (optional retake due)
// On both dates US Eastern is on daylight time (EDT, UTC-4), not EST (UTC-5).
// ---------------------------------------------------------------------------

const START_MAIN   = new Date("2026-05-18T08:00:00-04:00");
const START_RETAKE = new Date("2026-06-04T08:00:00-04:00");

const HOUR = 3600;
const DAY = 24 * HOUR;

// Plainly-stated things, sorted ascending by how long they take in hours.
const ACTIVITIES = [
  { name: "watch a feature-length film", hours: 2 },
  { name: "bake a loaf of bread from scratch", hours: 4 },
  { name: "binge a full season of television", hours: 12 },
  { name: "drive from New York to Chicago", hours: 13 },
  { name: "fly to Tokyo and back", hours: 28 },
  { name: "read a 300-page novel", hours: 30 },
  { name: "drive across the country, coast to coast", hours: 45 },
  { name: "read the entire Lord of the Rings trilogy", hours: 60 },
  { name: "learn to solve a Rubik's Cube", hours: 72 },
  { name: "learn 100 words of a new language", hours: 168 },
  { name: "grow vegetables from seed to harvest", hours: 672 },
  { name: "write a 50,000-word novel", hours: 720 },
  { name: "train for a 5K from scratch", hours: 1008 },
  { name: "hike the entire Appalachian Trail", hours: 3960 },
  { name: "gestate a human being", hours: 6720 },
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
    return `in ${days} day${days === 1 ? "" : "s"}`;
  }
  if (secondsRemaining >= HOUR) {
    const hrs = Math.ceil(secondsRemaining / HOUR);
    return `in ${hrs} hour${hrs === 1 ? "" : "s"}`;
  }
  const mins = Math.max(1, Math.ceil(secondsRemaining / 60));
  return `in ${mins} minute${mins === 1 ? "" : "s"}`;
}

function elapsedSecondsSince(start) {
  const s = Math.floor((Date.now() - start.getTime()) / 1000);
  return s < 0 ? 0 : s;
}

// ---------------------------------------------------------------------------
// Clocks
// ---------------------------------------------------------------------------

function makeClock(prefix) {
  return {
    days: document.getElementById(`${prefix}-days`),
    hours: document.getElementById(`${prefix}-hours`),
    minutes: document.getElementById(`${prefix}-minutes`),
    seconds: document.getElementById(`${prefix}-seconds`),
  };
}

const mainClock = makeClock("m");
const retakeClock = makeClock("r");

function renderClock(clock, elapsedSeconds) {
  clock.days.textContent = Math.floor(elapsedSeconds / DAY);
  clock.hours.textContent = pad(Math.floor((elapsedSeconds % DAY) / HOUR));
  clock.minutes.textContent = pad(Math.floor((elapsedSeconds % HOUR) / 60));
  clock.seconds.textContent = pad(elapsedSeconds % 60);
}

// ---------------------------------------------------------------------------
// Activities (driven by the main clock — the longest-running wait)
// ---------------------------------------------------------------------------

const list = document.getElementById("activityList");
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

  list.innerHTML = "";

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
      ? `~${durationLabel(activity.hours)}`
      : unlockLabel(costSeconds - elapsedSeconds);

    li.appendChild(name);
    li.appendChild(meta);
    list.appendChild(li);
  }
}

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------

function tick() {
  const mainElapsed = elapsedSecondsSince(START_MAIN);
  renderClock(mainClock, mainElapsed);
  renderClock(retakeClock, elapsedSecondsSince(START_RETAKE));
  buildActivityList(mainElapsed);
}

tick();
setInterval(tick, 1000);
