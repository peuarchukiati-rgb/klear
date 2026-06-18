import { useState, useRef, useEffect } from "react";
import { PhaseProgress } from "./Progress";

// ─────────────────────────────────────────────────────────────
// Klear — built for Agentic AI Build Week · Builder Experience
// Engine: I→P→S→D (STORE-first). Paste the team's mess → get one
// shared state every human and every AI copilot reads the same way.
// ─────────────────────────────────────────────────────────────

const SAMPLE = `Chad: ok bros we're actually doing this — dropship store goes live before the weekend
Cody: wait we're doing the LED face masks?? I thought we locked the posture corrector
Chad: nah we pivoted to face masks on the call last night — way better margins, supplier's cheaper
Cody: ...nobody told me 💀 I've been cutting TikTok creatives for the posture thing all morning
Chad: oof my bad. ok Cody you own the ads — new creatives + the TikTok, premium not scammy
Dylan: I'll build the Shopify store. and Chad drop me the product link + which AliExpress supplier + the ad budget
Chad: it's all in my head, I'll type it up tonight — $30 retail, supplier is the Shenzhen one, ad spend $500 to start
Cody: and are we still calling the store "GlowGod" or did that change too 😭
Dylan: we go live Friday right? ~4 days. also who's setting up payment + refunds, we cannot get chargeback-banned`;

const SYSTEM_PROMPT = `You are Klear — an engine that converts a team's messy working conversation into one shared, unambiguous project state that every human teammate and every AI copilot can read identically. You eliminate "context drift": the failure mode where each person (and each AI assistant) walks away from a discussion with a slightly different picture, and the work silently diverges.

You run the I→P→S→D lens (Intake → Process → Store → Dispatch). Every piece of knowledge work moves through these four beats. Your job is to read the raw conversation and locate the team across them, with one rule above all others:

ROOT-CAUSE HEURISTIC (most important):
When work feels chaotic or stuck, the visible symptom is usually at PROCESS or DISPATCH (people doing things by hand, redoing work, re-explaining). But the root cause is almost always an EMPTY STORE: decisions, intent, and shared context were never written into a durable substrate that anyone — human or AI — can pick up and continue from. So every regeneration starts from someone's head. Hunt for the STORE gap FIRST. Do not stop at the surface symptom.

SIGNAL MAP (read for these patterns, in any language — these are how people naturally talk about each beat):
- INTAKE signals: "need to learn / keep up / find info / update", "people want it / lots of demand / many use cases" (demand piling up at the front door).
- PROCESS bottleneck signals: "prep / figure out / write up / design / do it myself / sit and make it", "takes time / eats my whole day / wastes time on…".
- STORE gap signals ◄ catch these most sharply (this is the root cause most often): "it's all in my head / I just remember it", "redo it every time / start from scratch / have to re-explain", "no system / scattered / can't find it".
- DISPATCH bottleneck signals: "send / ship / post / reply / deliver to client", "schedule / deploy / hand off".

HARD GUARDRAILS (never break):
- Never invent. If it is not in the conversation, it is not in the output. "Not stated in input" is always better than a guess.
- Never generic. "The team should communicate better" is generic — cut it. "Decision to drop Supabase auth was made verbally and never written down, so the frontend dev may still be building against it" is specific — keep it.
- Show inference, never hide it. When you must infer something the team did not say explicitly, mark it and frame it as a question back to them ("inferred — confirm?"). Confidence is a feature, not a weakness.
- Extract real words. Anchor claims to what people actually said, not paraphrase that drifts.

ISOLATION CHECK (front-door falsification — run before you trust your own read):
Before locking the state, glance back at the raw input and judge how cleanly you could separate the team's real working signal from tangents, side-chatter, or one person speaking for another. Report this as isolation_confidence.
- high  = clear working conversation, the team's intent and decisions are unambiguous.
- medium = real signal is there but mixed with tangents, or you had to guess which line meant what.
- low   = the signal is buried, voices blur together, or you selected lines because they "fit the pattern" more than because you were sure.
If isolation_confidence is "low", do NOT proceed silently — put a one-line caution in isolation_note ("this state is only as reliable as the paste"). Surfacing the doubt is the feature; hiding it is the failure.

You will receive a raw conversation. Respond with ONLY a valid JSON object, no markdown fences, no preamble. Match the input's language for all human-readable string values (if the team wrote in Thai, write the values in Thai; if English, English). Use this exact schema:

{
  "project": {
    "goal": "one sentence: what is this team actually trying to ship",
    "track_or_context": "the track / arena / context if stated, else 'Not stated in input'",
    "hard_deadline": "the deadline if stated, else 'Not stated in input'",
    "confidence": "high | medium | low — how confident you are the goal above is what the team really means"
  },
  "decisions": [
    { "decision": "a decision the team actually made", "quote": "the short verbatim phrase it came from", "risk": "if this decision was made verbally and someone might still be acting on the old plan, say so here; else empty string" }
  ],
  "store_gap": {
    "finding": "the single most important thing that was decided or known but NOT written into shared substrate — the thing living only in someone's head right now",
    "why_it_bites": "concretely, who will diverge or redo work because of this gap",
    "fix": "the one specific artifact to write down right now to close it (e.g. 'a 4-line companion.md pinning the track + deadline + mock-data decision')"
  },
  "next_actions": [
    { "who": "person's name from the conversation", "action": "their single clearest next action", "depends_on": "what/who they are blocked by, or empty string", "merge_point": "where their work rejoins the team — what they hand back and to whom" }
  ],
  "open_loops": [
    "unresolved question still hanging in the conversation, verbatim-ish"
  ],
  "isolation_confidence": "high | medium | low — how cleanly you could separate real signal from tangent in this conversation",
  "isolation_note": "if confidence is low, one line on what was ambiguous; else empty string"
}`;

const COMPANION_SYSTEM = `You are Klear's handoff writer. Given a structured project state (JSON), write a single companion.md file: a portable context substrate that any teammate OR any AI copilot can load to instantly share the team's exact state and know what to do next. This is the STORE artifact that closes the gap.

Write it so a receiver — human or AI — reads it and knows: what we're building, what's locked, what's still open, their own next action, and where their work rejoins the team. Match the language of the input state values.

Respond with ONLY the raw markdown content of companion.md. No fences, no preamble, no commentary. Keep it tight — a working file, not an essay. Use this structure:

# companion.md — <project goal, short>
> One shared state. Every human and every AI copilot reads this the same way.

**Track:** ...
**Hard deadline:** ...
**Status confidence:** ...

## Locked decisions
- ... (note any that were verbal-only and carry risk)

## ⚠️ Close this gap first
<the store_gap finding, why it bites, and the exact artifact to write>

## Who does what next
- **<name>** — <action>. Blocked by: <...>. Rejoins at: <merge_point>.

## Open loops
- ...

## How to use this file
Drop this into any AI copilot's context (or hand to a teammate) before continuing. Update it whenever a decision changes — it is the single source of truth, not the chat log.`;

// ── Living loop, part 1: split the shared state into one companion PER person.
// Each one is a portable packet: their slice + a Pack Back block that
// tells the receiver (or their AI) exactly what to send back to close the loop.
const COMPANIONS_SYSTEM = `You are Klear's companion splitter. Given one structured project state (JSON), write a SEPARATE companion file for each person who has a next action — their personal slice of the shared state, portable enough to hand to them or drop into their own AI copilot.

The crucial part is the Pack Back block: every knowledge-work handoff must be able to return. So each companion ends with an exact template the receiver fills in and sends back — that returned text is what re-merges into the shared state and keeps the folder alive. Never invent; pull only from the state. Match the language of the state's string values.

Produce exactly ONE companion per UNIQUE person — if the same name appears more than once in next_actions, merge their actions into that person's single companion. Never emit two companions for the same name.

Respond with ONLY a valid JSON array, no markdown fences, no preamble. One object per unique person from next_actions. Use this exact schema:

[
  {
    "who": "the person's name, exactly as in next_actions",
    "companion_md": "the full markdown content of THIS person's companion file, following the structure below"
  }
]

Each companion_md must follow this structure exactly (fill from the state; keep it tight — a working file, not an essay):

# companion — <who> · <project goal, short>
> Your slice of one shared state. Do the work, fill the Pack Back block, send it back — that's how the folder stays live.

**Mission:** <this person's action>
**Blocked by:** <their depends_on, or "nothing — you can start now">
**Rejoins at:** <their merge_point>

## Locked context you must respect
- <the decisions that constrain this person — flag any that were verbal-only and carry risk>

## ⚠ The gap this closes
<one line from store_gap: what was decided-but-not-written that this person's work depends on>

## 📤 Pack back when done — copy the block below, fill it in, paste it back into Klear
———
## Handoff back — <who>
- Done: <what you completed>
- New decisions / info: <anything decided or discovered, else "none">
- Now blocked by: <new blocker, else "nothing">
- Hand to: <who picks it up next, or the merge point>
———`;

// ── Living loop, part 2: a returned handoff re-enters the engine and MERGES into
// the state. This is the "Living" — the folder updates as work comes back.
const MERGE_SYSTEM = `You are Klear's merge engine. You receive the current shared project state (JSON) and a handoff that one teammate sent back after doing their part. Fold the handoff into the state and return the UPDATED state, plus a changelog of exactly what moved.

RULES (never break):
- Apply ONLY what the handoff actually says. Never invent progress, decisions, or blockers that are not in the returned text.
- Resolve, don't pile up: if the handoff closes an open_loop or fills the store_gap, remove/relieve it — don't leave stale items. If the store_gap is now written down, say so in store_gap.finding.
- Re-point next_actions to the NEW reality: a person who reported their work done should have their action updated to their next real step, or be dropped if they have nothing left. If they unblocked someone, clear that person's depends_on.
- New decisions or info in the handoff become entries in decisions (with the verbal-risk flag if they were not written anywhere durable).
- Mark anything you infer and frame it as a question ("inferred — confirm?"). Keep the same language as the state values.

You receive a JSON object: { "current_state": <state>, "from": "<person name>", "handoff": "<the returned text>" }.

Respond with ONLY a valid JSON object, no markdown fences, no preamble:

{
  "updated_state": { ...the full state, same exact schema as before, with the handoff folded in... },
  "changelog": [
    { "kind": "resolved | added | changed | risk", "text": "one concrete line on what moved, naming who/what" }
  ]
}`;

// Sample returned handoff — pairs with SAMPLE so the loop demos in one click.
const SAMPLE_HANDBACK = `Cody: done — new creatives cut for the face masks, TikTok's scheduled, locked the name "GlowGod".
premium-not-scammy like we said, used the $30 retail in the ad.
couldn't finish the landing copy — still waiting on Chad's supplier + price doc to confirm $30 holds.
new idea: run a $50 test ad first before the full $500 to see if the creative converts — I'll set it up.
Dylan you're unblocked on store visuals — logo + brand colors are in the drive.`;

async function callClaude(system, userContent, expectJSON, apiKey, lang) {
  const sys = lang
    ? system + `\n\nOUTPUT LANGUAGE (top priority): the input is in ${lang}. Write EVERY human-readable string value in ${lang}, matching the input. Never switch or translate languages.`
    : system;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120000); // 2-min safety timeout
  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // Required for calling the Anthropic API directly from a browser.
        // The key stays in the user's browser; nothing is proxied through us.
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        system: sys,
        messages: [{ role: "user", content: userContent }],
      }),
      signal: ctrl.signal,
    });
  } catch (e) {
    if (e.name === "AbortError") throw new Error("The engine took too long (over 2 minutes). Try again, or trim the input a little.");
    throw e;
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let detail = "";
    try {
      const e = await res.json();
      detail = e?.error?.message ? " — " + e.error.message : "";
    } catch {
      /* ignore parse error */
    }
    throw new Error("Engine request failed (" + res.status + ")" + detail);
  }
  const data = await res.json();
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  if (!expectJSON) return text.trim();
  const clean = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Tolerate stray prose/markdown around the JSON: slice to the outermost { } or [ ].
    const s = clean.search(/[[{]/);
    const e = Math.max(clean.lastIndexOf("}"), clean.lastIndexOf("]"));
    if (s !== -1 && e > s) return JSON.parse(clean.slice(s, e + 1));
    throw new Error("The engine returned a response we couldn't read. Try again.");
  }
}

// Brand palette — Klear warm CI, in light (cream editorial) and dark (warm espresso).
const LIGHT = {
  void: "#F5F0E8", panel: "#EDE6D8", line: "#D9D1C0",
  ink: "#2A2A28", mute: "#595544",          // muted darkened for readability on cream
  signal: "#5E7359", drift: "#B4503C", beam: "#A8842E",
  gapBg: "#F3E7DF", noteBg: "#F4EEDD",      // warm accent-card tints
};
const DARK = {
  void: "#17130D", panel: "#211B13", line: "#3A3225",
  ink: "#EFE8D8", mute: "#9C9580",
  signal: "#A2CD98", drift: "#D2715A", beam: "#D4B96A",  // brighter sage so filled buttons pop on espresso
  gapBg: "#2A1C16", noteBg: "#241E13",
};
// Reassigned per-render from the active theme (see App). Module-level so the
// style helpers below read the current palette without prop-threading.
let C = LIGHT;

const STAGES = [
  { k: "I", label: "Intake" },
  { k: "P", label: "Process" },
  { k: "S", label: "Store" },
  { k: "D", label: "Dispatch" },
];

// Phase labels shown by <PhaseProgress> so each async step looks alive, not frozen.
const RUN_STEPS = ["Reading the room", "Mapping the state", "Hunting the STORE gap", "Writing companion"];
const SPLIT_STEPS = ["Reading the state", "Splitting per person", "Writing Pack Back blocks"];
const MERGE_STEPS = ["Reading the handoff", "Merging into the state", "Diffing the change"];

const ENV_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

// Detect input language so output values match it (Thai if Thai script present, else English).
const LANG = (t) => (/[฀-๿]/.test(t || "") ? "Thai" : "English");

export default function App() {
  const [raw, setRaw] = useState("");
  const [apiKey, setApiKey] = useState(ENV_KEY);
  const [showKey, setShowKey] = useState(false);
  const [state, setState] = useState(null);
  const [companion, setCompanion] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | reading | done | error
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  // ── Living loop state ──
  const [version, setVersion] = useState(1);       // bumps on every merge — the folder is alive
  const [companions, setCompanions] = useState([]); // per-person packets
  const [tab, setTab] = useState(0);
  const [splitting, setSplitting] = useState(false);
  const [handFrom, setHandFrom] = useState("");
  const [handText, setHandText] = useState("");
  const [merging, setMerging] = useState(false);
  const [log, setLog] = useState([]);               // running update log (newest-first), minimal
  const [handedBack, setHandedBack] = useState([]); // names that have handed back — for ✓ + convergence
  const [phaseStep, setPhaseStep] = useState(0);   // active step index for <PhaseProgress>
  const [lang, setLang] = useState("English");      // output language, matched to the input
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("klear-theme") || "light"; } catch { return "light"; }
  });
  const outRef = useRef(null);

  // Active palette for this render — read by every C.* reference below.
  C = theme === "dark" ? DARK : LIGHT;

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try { localStorage.setItem("klear-theme", next); } catch { /* ignore */ }
      return next;
    });
  }

  useEffect(() => {
    if (phase === "done" && outRef.current) {
      outRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  async function run() {
    if (!raw.trim()) return;
    if (!apiKey.trim()) {
      setErr("Add your Anthropic API key first (the field just above the paste box).");
      setPhase("error");
      return;
    }
    const l = LANG(raw);
    setLang(l);
    setPhase("reading");
    setErr("");
    setState(null);
    setCompanion("");
    setCompanions([]);
    setLog([]);
    setHandedBack([]);
    setVersion(1);
    setPhaseStep(0);
    let step = 0;
    const tick = setInterval(() => { step = Math.min(step + 1, 2); setPhaseStep(step); }, 1100);
    try {
      const s = await callClaude(SYSTEM_PROMPT, raw, true, apiKey.trim(), l);
      clearInterval(tick);
      setState(s);
      setPhaseStep(3);
      const md = await callClaude(COMPANION_SYSTEM, JSON.stringify(s), false, apiKey.trim(), l);
      setCompanion(md);
      setPhase("done");
    } catch (e) {
      clearInterval(tick);
      setErr(e.message || "Something broke. Try again.");
      setPhase("error");
    }
  }

  // One companion per unique person (defensive dedup) from an engine list.
  function buildCompanions(list) {
    const seen = new Set();
    return (Array.isArray(list) ? list : []).filter((c) => {
      const key = (c?.who || "").trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Living loop · part 1 — split the shared state into one companion per person.
  async function splitCompanions() {
    if (!state) return;
    setSplitting(true);
    setErr("");
    setPhaseStep(0);
    let step = 0;
    const tick = setInterval(() => { step = Math.min(step + 1, SPLIT_STEPS.length - 1); setPhaseStep(step); }, 900);
    try {
      const list = await callClaude(COMPANIONS_SYSTEM, JSON.stringify(state), true, apiKey.trim(), lang);
      const arr = buildCompanions(list);
      setCompanions(arr);
      setTab(0);
      setHandFrom((arr[0] && arr[0].who) || "");
      setHandedBack([]); // fresh round
      setLog([]);
    } catch (e) {
      setErr(e.message || "Couldn't split into companions. Try again.");
    } finally {
      clearInterval(tick);
      setSplitting(false);
    }
  }

  // Living loop · part 2 — a returned handoff re-enters the engine and merges in.
  async function mergeHandoff() {
    if (!state || !handText.trim()) return;
    setMerging(true);
    setErr("");
    setPhaseStep(0);
    let step = 0;
    const tick = setInterval(() => { step = Math.min(step + 1, MERGE_STEPS.length - 1); setPhaseStep(step); }, 900);
    try {
      const from = handFrom;
      const payload = JSON.stringify({ current_state: state, from, handoff: handText.trim() });
      const res = await callClaude(MERGE_SYSTEM, payload, true, apiKey.trim(), lang);
      const updated = res?.updated_state;
      if (updated) {
        const items = Array.isArray(res?.changelog) ? res.changelog : [];
        const newVersion = version + 1;
        setState(updated);
        setPhaseStep(MERGE_STEPS.length - 1);
        // Regenerate companions from the NEW state — the loop keeps going:
        // people with no work left drop out, newly-added tasks appear automatically.
        const list = await callClaude(COMPANIONS_SYSTEM, JSON.stringify(updated), true, apiKey.trim(), lang);
        const fresh = buildCompanions(list);
        setCompanions(fresh);
        setTab(0);
        const nextOpen = fresh.find((c) => c.who !== from && !handedBack.includes(c.who)) || fresh[0];
        setHandFrom((nextOpen && nextOpen.who) || "");
        setHandedBack((hb) => (hb.includes(from) ? hb : [...hb, from]));
        setLog((lg) => [{ version: newVersion, from, items }, ...lg]);
        setVersion(newVersion);
      }
      setHandText("");
      if (outRef.current) outRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setErr(e.message || "Merge failed. Try again.");
    } finally {
      clearInterval(tick);
      setMerging(false);
    }
  }

  function downloadNamed(name, body) {
    const blob = new Blob([body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadMd() {
    const blob = new Blob([companion], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "companion.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyMd() {
    navigator.clipboard.writeText(companion);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const conf = (v) => ({ high: C.signal, medium: C.drift, low: C.drift }[v] || C.mute);

  return (
    <div style={{ minHeight: "100vh", background: C.void, color: C.ink, fontFamily: "'Sarabun', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .disp { font-family: 'Playfair Display', serif; }
        textarea::placeholder, input::placeholder { color: ${C.mute}; opacity: .6; }
        textarea:focus, input:focus { outline: none; border-color: ${C.beam} !important; }
        .btn:focus-visible { outline: 2px solid ${C.beam}; outline-offset: 2px; }
        @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes rise { from{opacity:0; transform:translateY(8px)} to{opacity:1; transform:translateY(0)} }
        .rise { animation: rise .5s ease both; }
        @media (prefers-reduced-motion: reduce){ .rise{animation:none} }
      `}</style>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(24px,5vw,64px) clamp(18px,4vw,40px) 120px" }}>
        {/* ── HERO ── */}
        <header style={{ marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span className="disp" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: C.ink }}>Klear</span>
              <span className="mono" style={{ fontSize: 11, color: C.mute, letterSpacing: 1 }}>the clarity layer for your team + its AI</span>
            </div>
            <button onClick={toggleTheme} className="mono btn" style={pill(C.line, C.ink)} aria-label="Toggle light/dark">
              {theme === "dark" ? "☀ light" : "☾ dark"}
            </button>
          </div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: 3, color: C.beam, textTransform: "uppercase", marginBottom: 18 }}>
            Builder Experience · Agentic AI Build Week
          </div>
          <h1 className="disp" style={{ fontSize: "clamp(34px,6vw,60px)", lineHeight: 1.02, margin: 0, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Your team already<br />decided. Your AI<br />
            <span style={{ color: C.drift }}>didn't get the memo.</span>
          </h1>
          <p style={{ fontSize: "clamp(15px,2.2vw,18px)", color: C.mute, maxWidth: 580, marginTop: 22, lineHeight: 1.6 }}>
            Turn conversations, notes, files, and ideas into one shared understanding your whole team — and every AI copilot — reads the same way.
          </p>
        </header>

        {/* ── INPUT ── */}
        <section>
          {/* API key */}
          <div style={{ marginBottom: 18 }}>
            <label className="mono" style={{ fontSize: 12, letterSpacing: 1.5, color: C.mute, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Anthropic API key {ENV_KEY ? "(loaded from .env)" : "(stays in your browser)"}
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-…"
                autoComplete="off"
                spellCheck={false}
                style={{
                  flex: 1, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10,
                  color: C.ink, padding: "11px 14px", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace",
                }}
              />
              <button onClick={() => setShowKey((v) => !v)} className="mono btn" style={pill(C.line, C.ink)}>
                {showKey ? "hide" : "show"}
              </button>
            </div>
            <p className="mono" style={{ fontSize: 11, color: C.mute, marginTop: 6, lineHeight: 1.5 }}>
              Used directly from your browser → Anthropic. Never stored, never sent anywhere else.
              No key? Get one at console.anthropic.com.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <label className="mono" style={{ fontSize: 12, letterSpacing: 1.5, color: C.mute, textTransform: "uppercase" }}>
              Paste anything — chat, notes, a half-decision
            </label>
            <button
              onClick={() => setRaw(SAMPLE)}
              className="mono btn"
              style={{ background: "none", border: "none", color: C.beam, fontSize: 12, cursor: "pointer", padding: 0 }}
            >
              try a sample →
            </button>
          </div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Chad: wait did we lock the face masks or the posture corrector?&#10;Cody: face masks, pivoted last night&#10;Dylan: ok but who's setting up payment + refunds…"
            rows={9}
            style={{
              width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12,
              color: C.ink, padding: "16px 18px", fontSize: 14, lineHeight: 1.6, resize: "vertical",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          />
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 16 }}>
            <button
              onClick={run}
              disabled={phase === "reading" || !raw.trim()}
              className="btn disp"
              style={{
                background: phase === "reading" ? C.line : C.signal,
                color: phase === "reading" ? C.mute : C.void,
                border: "none", borderRadius: 10, padding: "13px 26px", fontSize: 15, fontWeight: 700,
                cursor: phase === "reading" || !raw.trim() ? "default" : "pointer",
                opacity: !raw.trim() ? 0.5 : 1, transition: "all .2s",
              }}
            >
              {phase === "reading" ? "Reading the room…" : "Find the shared state"}
            </button>
          </div>
          {phase === "reading" && (
            <div style={{ marginTop: 16 }}>
              <PhaseProgress c={C} steps={RUN_STEPS} activeIndex={phaseStep} />
            </div>
          )}
          {phase === "error" && (
            <p className="mono" style={{ color: C.drift, fontSize: 13, marginTop: 14 }}>
              {err}
            </p>
          )}
        </section>

        {/* ── OUTPUT ── */}
        {phase === "done" && state && (
          <div ref={outRef} style={{ marginTop: 56 }}>
            {/* state version — proof the folder is alive */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
              <span className="mono" style={{
                fontSize: 12, color: version > 1 ? C.signal : C.mute, border: `1px solid ${version > 1 ? C.signal : C.line}`,
                borderRadius: 999, padding: "4px 12px", letterSpacing: 1,
              }}>
                shared state · v{version}{version > 1 ? " · live" : ""}
              </span>
              {version > 1 && (
                <span className="mono" style={{ fontSize: 11, color: C.mute }}>
                  updated from a teammate's handoff — same folder, new truth
                </span>
              )}
            </div>

            {/* update log — minimal running history; latest in full, older collapsed to one line */}
            {log.length > 0 && (
              <div className="rise" style={{ ...card(), borderColor: C.beam, background: C.noteBg }}>
                <Eyebrow color={C.beam}>⟳ Update log — what each handoff changed</Eyebrow>
                <div style={{ marginTop: 10, display: "grid", gap: 14 }}>
                  {log.map((entry, idx) => {
                    const oneLine = entry.items.map((c) => c.text).join(" · ");
                    return (
                      <div key={idx} style={{ opacity: idx === 0 ? 1 : 0.65 }}>
                        <div className="mono" style={{ fontSize: 11, color: C.beam, letterSpacing: 0.5, marginBottom: idx === 0 ? 6 : 2 }}>
                          v{entry.version} · {entry.from} handed back
                        </div>
                        {idx === 0 ? (
                          <div style={{ display: "grid", gap: 6 }}>
                            {entry.items.map((c, i) => (
                              <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                                <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: kindColor(c.kind), minWidth: 64 }}>{c.kind}</span>
                                <span style={{ fontSize: 14, lineHeight: 1.5 }}>{c.text}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mono" style={{ fontSize: 12, color: C.mute, lineHeight: 1.5 }}>
                            {oneLine.slice(0, 110)}{oneLine.length > 110 ? "…" : ""}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Pipeline state={state} />

            {/* project header */}
            <div className="rise" style={card()}>
              <Eyebrow>Project state</Eyebrow>
              <h2 className="disp" style={{ fontSize: 24, margin: "6px 0 4px", fontWeight: 700 }}>
                {state.project.goal}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 14 }}>
                <Meta label="Track" value={state.project.track_or_context} />
                <Meta label="Deadline" value={state.project.hard_deadline} accent={C.drift} />
                <Meta label="Read confidence" value={state.project.confidence} accent={conf(state.project.confidence)} />
              </div>
            </div>

            {/* STORE gap — the hero finding */}
            <div className="rise" style={{ ...card(), borderColor: C.drift, background: C.gapBg }}>
              <Eyebrow color={C.drift}>⚠ Close this gap first — it's the root cause</Eyebrow>
              <p style={{ fontSize: 16, lineHeight: 1.55, margin: "8px 0 12px", fontWeight: 500 }}>
                {state.store_gap.finding}
              </p>
              <p style={{ fontSize: 14, color: C.mute, lineHeight: 1.6, margin: "0 0 12px" }}>
                <strong style={{ color: C.ink }}>Why it bites: </strong>{state.store_gap.why_it_bites}
              </p>
              <div className="mono" style={{ fontSize: 13, color: C.signal, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
                → fix: {state.store_gap.fix}
              </div>
            </div>

            {/* decisions */}
            {state.decisions?.length > 0 && (
              <div className="rise" style={card()}>
                <Eyebrow>Locked decisions</Eyebrow>
                <div style={{ marginTop: 8 }}>
                  {state.decisions.map((d, i) => (
                    <div key={i} style={{ padding: "12px 0", borderBottom: i < state.decisions.length - 1 ? `1px solid ${C.line}` : "none" }}>
                      <div style={{ fontSize: 15, lineHeight: 1.5 }}>{d.decision}</div>
                      {d.quote && <div className="mono" style={{ fontSize: 12, color: C.mute, marginTop: 4 }}>“{d.quote}”</div>}
                      {d.risk && (
                        <div className="mono" style={{ fontSize: 12, color: C.drift, marginTop: 6 }}>⚠ {d.risk}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* next actions */}
            <div className="rise" style={card()}>
              <Eyebrow color={C.beam}>Who does what next — and where it rejoins</Eyebrow>
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {state.next_actions.map((a, i) => (
                  <div key={i} style={{ background: C.void, border: `1px solid ${C.line}`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                      <span className="disp" style={{ fontSize: 15, fontWeight: 700, color: C.beam }}>{a.who}</span>
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.5 }}>{a.action}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 8 }}>
                      {a.depends_on && (
                        <span className="mono" style={{ fontSize: 12, color: C.drift }}>blocked by: {a.depends_on}</span>
                      )}
                      {a.merge_point && (
                        <span className="mono" style={{ fontSize: 12, color: C.mute }}>↪ rejoins: {a.merge_point}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* open loops + isolation */}
            {(state.open_loops?.length > 0 || state.isolation_confidence === "low") && (
              <div className="rise" style={card()}>
                {state.open_loops?.length > 0 && (
                  <>
                    <Eyebrow>Still open</Eyebrow>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: C.mute }}>
                      {state.open_loops.map((o, i) => (
                        <li key={i} style={{ fontSize: 14, lineHeight: 1.7 }}>{o}</li>
                      ))}
                    </ul>
                  </>
                )}
                {state.isolation_confidence === "low" && state.isolation_note && (
                  <div className="mono" style={{ fontSize: 12, color: C.drift, marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
                    isolation: low — {state.isolation_note} (this state is only as reliable as the paste)
                  </div>
                )}
              </div>
            )}

            {/* companion.md */}
            <div className="rise" style={{ ...card(), borderColor: C.signal }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <Eyebrow color={C.signal}>companion.md — the portable handoff</Eyebrow>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={copyMd} className="mono btn" style={pill(C.line, C.ink)}>
                    {copied ? "copied ✓" : "copy"}
                  </button>
                  <button onClick={downloadMd} className="mono btn" style={pill(C.signal, C.void)}>
                    download .md
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: C.mute, margin: "10px 0 14px", lineHeight: 1.6 }}>
                Hand this to a teammate or drop it into any AI copilot's context. Now everyone — human and machine — continues from the same state.
              </p>
              <pre className="mono" style={{
                background: C.void, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18,
                fontSize: 12.5, lineHeight: 1.65, color: C.ink, overflowX: "auto", whiteSpace: "pre-wrap", margin: 0,
              }}>{companion}</pre>
            </div>

            {/* ── LIVING LOOP ── split per person, then let work flow back in */}
            <div className="rise" style={{ ...card(), borderColor: C.beam }}>
              <Eyebrow color={C.beam}>The living loop — split per person, then let work flow back</Eyebrow>
              <p style={{ fontSize: 13, color: C.mute, margin: "10px 0 16px", lineHeight: 1.6 }}>
                One shared state becomes a companion <em>per teammate</em> — each a portable packet with its own
                Pack&nbsp;Back block. They do the work, paste the block back, and the state updates itself. That
                round-trip is what makes this a <strong style={{ color: C.ink }}>living</strong> folder, not a one-shot summary.
              </p>

              {companions.length === 0 ? (
                handedBack.length > 0 ? (
                  <div className="mono rise" style={{ fontSize: 14, color: C.signal, letterSpacing: 0.3, padding: "6px 0", lineHeight: 1.6 }}>
                    ✓ Every open task has been handed back — the folder is reconciled at v{version}. Paste the next meeting to start a fresh round.
                  </div>
                ) : (
                  <>
                    <button
                      onClick={splitCompanions}
                      disabled={splitting}
                      className="btn disp"
                      style={{
                        background: splitting ? C.line : C.beam, color: splitting ? C.mute : C.void,
                        border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 700,
                        cursor: splitting ? "default" : "pointer",
                      }}
                    >
                      {splitting ? "Splitting…" : `Split into ${state.next_actions?.length || ""} companions →`.replace("  ", " ")}
                    </button>
                    {splitting && (
                      <div style={{ marginTop: 14 }}>
                        <PhaseProgress c={C} steps={SPLIT_STEPS} activeIndex={phaseStep} />
                      </div>
                    )}
                  </>
                )
              ) : (
                <>
                  {/* convergence — how many have handed back, how many still open */}
                  <div className="mono" style={{ fontSize: 11, color: C.mute, marginBottom: 12, letterSpacing: 0.5 }}>
                    handoffs in: <span style={{ color: C.signal }}>{handedBack.length}</span> · {companions.length} still open · state v{version}
                  </div>
                  {/* per-person tabs */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                    {companions.map((c, i) => (
                      <button key={i} onClick={() => setTab(i)} className="mono btn" style={pill(i === tab ? C.beam : C.line, i === tab ? C.void : C.ink)}>
                        {c.who}{handedBack.includes(c.who) ? " ✓" : ""}
                      </button>
                    ))}
                  </div>

                  {companions[tab] && (
                    <>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
                        <button onClick={() => navigator.clipboard.writeText(companions[tab].companion_md)} className="mono btn" style={pill(C.line, C.ink)}>copy</button>
                        <button onClick={() => downloadNamed(`companion-${companions[tab].who}.md`, companions[tab].companion_md)} className="mono btn" style={pill(C.beam, C.void)}>download .md</button>
                      </div>
                      <pre className="mono" style={{
                        background: C.void, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18,
                        fontSize: 12.5, lineHeight: 1.65, color: C.ink, overflowX: "auto", whiteSpace: "pre-wrap", margin: 0,
                      }}>{companions[tab].companion_md}</pre>
                    </>
                  )}

                  {/* handoff back → merge */}
                  <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 18, paddingTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                      <Eyebrow color={C.signal}>Hand it back — paste what came home</Eyebrow>
                      <button onClick={() => { setHandFrom("Cody"); setHandText(SAMPLE_HANDBACK); }} className="mono btn" style={{ background: "none", border: "none", color: C.beam, fontSize: 12, cursor: "pointer", padding: 0 }}>
                        try a sample handoff →
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span className="mono" style={{ fontSize: 12, color: C.mute }}>from</span>
                      <select value={handFrom} onChange={(e) => setHandFrom(e.target.value)} className="mono" style={{ background: C.void, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 8, padding: "7px 10px", fontSize: 13 }}>
                        {companions.map((c, i) => <option key={i} value={c.who}>{c.who}</option>)}
                      </select>
                    </div>
                    <textarea
                      value={handText}
                      onChange={(e) => setHandText(e.target.value)}
                      rows={5}
                      placeholder="Paste the Pack Back block the teammate filled in and sent home…"
                      style={{
                        width: "100%", background: C.void, border: `1px solid ${C.line}`, borderRadius: 10,
                        color: C.ink, padding: "14px 16px", fontSize: 13, lineHeight: 1.6, resize: "vertical",
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    />
                    <button
                      onClick={mergeHandoff}
                      disabled={merging || !handText.trim()}
                      className="btn disp"
                      style={{
                        marginTop: 12, background: merging ? C.line : C.signal, color: merging ? C.mute : C.void,
                        border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 14, fontWeight: 700,
                        cursor: merging || !handText.trim() ? "default" : "pointer", opacity: !handText.trim() ? 0.5 : 1,
                      }}
                    >
                      {merging ? "Merging into shared state…" : "Merge into shared state ↑"}
                    </button>
                    {merging && (
                      <div style={{ marginTop: 14 }}>
                        <PhaseProgress c={C} steps={MERGE_STEPS} activeIndex={phaseStep} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer className="mono" style={{ marginTop: 80, paddingTop: 24, borderTop: `1px solid ${C.line}`, fontSize: 11, color: C.mute, lineHeight: 1.8 }}>
          Klear · the clarity layer · engine: I→P→S→D, STORE-first<br />
          Input and key stay in your browser. Self-contained demo — mock or your own data.
        </footer>
      </div>
    </div>
  );

  function Pipeline({ state }) {
    // light heuristic: STORE always flagged as the gap (engine's thesis); others "flowing"
    return (
      <div style={{ display: "flex", gap: 2, marginBottom: 28, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.line}` }}>
        {STAGES.map((s) => {
          const isStore = s.k === "S";
          return (
            <div key={s.k} style={{
              flex: 1, padding: "14px 12px", background: isStore ? C.gapBg : C.panel,
              borderBottom: `2px solid ${isStore ? C.drift : C.signal}`,
            }}>
              <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: isStore ? C.drift : C.signal }}>{s.k}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: 1, color: C.mute, textTransform: "uppercase", marginTop: 2 }}>
                {s.label}{isStore ? " ◄ gap" : ""}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

function card() {
  return { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "22px 24px", marginBottom: 16 };
}
function pill(bg, fg) {
  return { background: bg, color: fg, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer" };
}
function kindColor(kind) {
  return { resolved: C.signal, added: C.beam, changed: C.drift, risk: C.drift }[kind] || C.mute;
}
function Eyebrow({ children, color }) {
  return (
    <div className="mono" style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: color || C.mute }}>
      {children}
    </div>
  );
}
function Meta({ label, value, accent }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: 1, color: C.mute, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, color: accent || C.ink, marginTop: 3, fontWeight: 500 }}>{value}</div>
    </div>
  );
}
