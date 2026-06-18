# Klear

**The clarity layer for your team + its AI.**

Paste your team's messy chat, notes, or a meeting transcript and get back **one shared project state** that every human teammate *and* every AI copilot reads the same way — plus a living folder of per-person handoffs that updates as work comes back.

Built for **Agentic AI Build Week — Builder Experience track.**

---

## The pain it solves: context drift, in real time

You're mid-buildathon. The team made a call on a late-night voice chat — "we pivoted to face masks," "the budget's $500," "store name's locked." Half of it never gets written down anywhere durable. So the work drifts faster than the chat:

- One teammate is still cutting creatives for the *old* product.
- Each person's AI copilot (Claude, Cursor, ChatGPT) has a slightly different picture of the plan.
- Everyone is *technically* on the same team and *actually* building slightly different projects.

That's **context drift** — everyone, and each AI assistant, walks away from a discussion with a slightly different version of the truth. In a few-day sprint it's the silent killer. Klear reads the raw conversation, finds the thing that was **decided but never stored**, and writes it into a portable substrate any human or machine can load to continue from the *same* state.

---

## How the engine works — I→P→S→D, STORE-first

Under the hood is an **Intake→Process→Store→Dispatch** lens. Every piece of knowledge work flows through those four beats, and the engine's thesis is one root cause:

> When work feels chaotic, the symptom shows up at **Process / Dispatch** — people doing things by hand, redoing work, re-explaining. But the real cause is almost always an **empty STORE**: decisions and intent that were never written into a durable substrate, so every step restarts from someone's head.

So the engine **hunts the STORE gap first**, then maps everyone's next action and where their work rejoins the team. Its guardrails:

- **Never invent.** If it's not in the input, it's not in the output — *"not stated in input"* beats a guess.
- **Never generic.** "The team should communicate better" gets cut; "the supplier + $30 retail + $500 budget live only in Chad's head" is kept.
- **Show inference, ask.** When it has to infer, it marks it and frames it as a question back to you.
- **Isolation / confidence check.** A front-door pass judges how cleanly it could separate real signal from tangent and surfaces that as a confidence read — because the state is only as reliable as the paste.

It **matches the input's language** — English in → English out, Thai in → Thai out (verified on a real Thai voice transcript).

---

## The living loop — split → Pack Back → merge → converge

This is the core of Klear, not a roadmap item. One shared state isn't a one-shot summary; it's a folder that stays alive as work comes back.

1. **Split.** The shared state splits into one `companion.md` **per teammate** — each a portable packet with their slice of the truth, ending in a **Pack Back** block.
2. **Do the work.** The teammate (or their AI copilot) does their part and fills in the Pack Back block.
3. **Merge.** Paste the returned block back in. The merge engine folds it into the shared state, bumps the version (v1 → v2 → …), resolves closed loops, and re-points everyone's next action.
4. **Regenerate.** Companions rebuild from the new state automatically — finished people drop out, newly-added tasks appear. A minimal **Update Log** accumulates what each handoff changed.
5. **Converge.** A **convergence counter** ("handoffs in: *k* · *N* still open") runs until the folder is **reconciled**.

That round-trip is what makes it a *living* folder.

---

## Light + dark, language-matched

Warm editorial light theme and a warm espresso dark theme, toggle in the header (persisted). Output values always match the input language.

---

## Run it (~30 seconds)

Requires **Node 18+** and an [Anthropic API key](https://console.anthropic.com/).

```bash
npm install
npm run dev
```

Open **http://localhost:5173**.

Add your API key one of two ways:

- **In the browser:** paste your key into the field at the top of the page. It stays in your browser, is sent only to Anthropic, and is never stored. *(Easiest — nothing to configure.)*
- **Via `.env`:** `cp .env.example .env`, set `VITE_ANTHROPIC_API_KEY`, restart `npm run dev`. The app loads it automatically.

Then click **try a sample →**, hit **Find the shared state**, and you're off. The key calls Anthropic directly from your browser — no backend, no server to deploy, nothing secret in the repo.

---

## 60–90s demo script (for judges / the Devpost video)

The sample is a dropship squad — **Chad / Cody / Dylan** — launching a Shopify LED-face-mask store **"GlowGod"** before Friday.

1. Click **try a sample →**. It loads a real-looking team chat: a pivot (posture corrector → face masks) that Cody missed, a STORE gap (product / supplier / $30 retail / $500 ad budget all in Chad's head), and open loops (store name + payment/chargebacks).
2. Hit **Find the shared state.** The engine runs Intake→Process→Store→Dispatch live.
3. Land on the output:
   - The **pipeline** flags **STORE** as the gap.
   - The **⚠ Close this gap first** card names exactly what was decided-but-not-written — and *who* will diverge because of it.
   - **Locked decisions** flags the verbal-only pivot as risk (Cody acting on the old plan).
   - **Who does what next** gives each teammate an action + the merge point where their work rejoins.
4. Scroll to **the living loop** and click **Split into companions →**. Each teammate gets their own packet with a Pack Back block.
5. Click **try a sample handoff →** to load Cody's returned update, then **Merge into shared state ↑**. Watch the version bump to **v2 · live**, the Update Log fill in, Cody's task close, Dylan unblock, and the convergence counter tick. *"Same folder, new truth — and it'll keep going until reconciled."*

Total: under two minutes.

---

## Stack

- **React + Vite** single-page app — **no backend**.
- **Anthropic `claude-sonnet-4-6`**, called **directly from the browser**. The engine is a set of system prompts; outputs are fixed JSON schemas validated client-side.
- API key stays in the browser — never stored, never proxied.
- Light + dark theme. Input-language matching.

---

## If we win

The Builder Experience track deploys winning tools live during the event. Klear is built to drop straight into a builder's day — paste, align, hand off — so the moment a team's chat outruns its plan, the shared state (and every copilot reading it) catches up.

---

*Builders building for builders. Make the week better.*
