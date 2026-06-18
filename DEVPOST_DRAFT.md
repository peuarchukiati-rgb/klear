# Devpost submission draft — Klear

> Copy/paste into the Devpost form. Fill the bracketed `[ FILL IN ]` placeholders before submitting.
> Track: **Builder Experience Award** · Agentic AI Build Week 2026

---

## Project name
**Klear**

## Tagline (one line)
The clarity layer for your team + its AI.

## Elevator pitch (≈ 200 chars)
Paste your team's messy chat, notes, or meeting transcript. Klear turns it into one shared project state every human teammate AND every AI copilot reads the same way — killing context drift.

---

## Project description

**The problem.** When a team works fast, decisions happen in conversation — "we pivoted to the face masks," "track's locked," "go live Friday" — and then live only in someone's head. Within hours, one teammate is building against the old plan, and each person's AI copilot (their Claude, their Cursor, their ChatGPT) has a slightly different picture of the project. That silent divergence is **context drift**, and it's the thing that quietly sinks teams mid-sprint.

**How it works.** Paste any slice of your team's working conversation — chat, notes, a half-made decision, a meeting transcript. Klear returns **one shared project state**: the goal, track, hard deadline, and locked decisions (with verbal-only decisions flagged as risk), plus who does what next and where each person's work rejoins the team. Then it splits that state into a portable `companion.md` per teammate — a packet you hand to a person OR drop straight into an AI copilot's context, so everyone, human and machine, continues from the *same* state.

The engine runs **I→P→S→D (Intake → Process → Store → Dispatch)**, and it is **STORE-first**: its core thesis is that the chaos you *feel* (doing things by hand, redoing work, re-explaining) is only the symptom — the root cause is almost always an **empty STORE**, shared context that was never written into a durable substrate anyone can pick up and continue from. So the engine hunts the STORE gap first. It carries hard guardrails — never invent, never be generic, show inference instead of hiding it, extract real words — and runs a front-door **isolation / confidence check** that flags its own uncertainty when the paste is ambiguous instead of producing confident garbage. It also **matches the input's language** (verified on a real Thai voice transcript — Thai in, Thai out).

**The living loop (the core feature).** Klear isn't a one-shot summary. The shared state splits into one `companion.md` per teammate, each ending in a **Pack Back** block — an exact template the receiver fills in and sends home. Paste that handoff back and a **merge** pass folds it into the state: the version bumps, companions regenerate (people with nothing left drop out, newly-created tasks appear automatically), a minimal **Update Log** accumulates what each handoff changed, and a **convergence counter** runs until every open task is reconciled. The round-trip is what makes Klear a *living* folder, not a dead document.

**Who it's for.** Any small team moving fast alongside its AI tools — buildathon squads, founding teams, product pods — where decisions outrun the documentation and the copilots fall out of sync with the humans.

## Demo
- **Live URL:** [ FILL IN — deployed demo URL ]
- **Walkthrough video (< 2 min):** [ FILL IN — YouTube/Loom URL ]

The fastest path: open the app, click **try a sample →** (the GlowGod dropship squad below), hit **Find the shared state**, then **Split into companions →** and paste the sample handoff back to watch the state go live at v2.

## AI documentation
- **Model / tool:** Anthropic **`claude-sonnet-4-6`**, called **directly from the browser** (the API key stays in the user's browser; nothing is proxied through a backend).
- **The engine is a constrained agent, not a chatbot.** A carefully written system prompt runs the I→P→S→D lens and emits a **fixed JSON output schema** that is **validated client-side** before anything renders. Guardrails (never invent / never generic / show inference / extract real words) and the front-door **isolation check** (high / medium / low confidence on how cleanly real signal could be separated from tangent) are baked into that prompt.
- **A second pass writes each `companion.md`** — turning the structured state into per-teammate portable packets, each with a Pack Back block.
- **A merge pass folds returned handoffs back in** — it receives the current state plus one teammate's returned text and emits the updated state plus a changelog of exactly what moved, resolving open loops instead of piling them up and re-pointing next actions to the new reality.
- **Language is auto-matched to the input** for every human-readable value (Thai script detected → output in Thai; else English), passed to the model as a top-priority output instruction.

## Source code
- **GitHub:** https://github.com/peuarchukiati-rgb/klear

## Track
**Builder Experience Award** — Agentic AI Build Week 2026.

---

## Inspiration
Watch any fast-moving team and you see the same failure. Someone pivots on a call, a deadline shifts in a thread, a tool gets dropped in passing — and those decisions never get written down anywhere durable. They live in one person's head. Hours later the team has quietly forked: one teammate ships against the old plan, and every AI copilot in the room is answering from a different version of the truth. We wanted to kill that drift in the room, in real time — and to treat the team *and* its AI as one audience that has to read the exact same state.

## What it does
Paste any slice of your team's working conversation. Klear returns:
1. **One shared project state** — goal, track, hard deadline, and locked decisions, with verbal-only decisions flagged as risk (the ones someone might still be acting against).
2. **Who does what next** — each teammate's clearest next action, what blocks them, and the *merge point* where their work rejoins the team.
3. **`companion.md` per teammate** — portable handoff packets you drop into any AI copilot's context or hand to a person, each carrying a **Pack Back** block to send the work home.
4. **A living loop** — paste a teammate's filled-in Pack Back block and the state merges, the version bumps, companions regenerate, an Update Log grows, and a convergence counter runs until the folder is reconciled.

Under all of it: the **I→P→S→D**, STORE-first engine that hunts the empty STORE — the decision that was made but never written down — before anything else.

## How we built it
- **React + Vite single-page app, no backend** — fully self-contained.
- The engine is a constrained system prompt over Anthropic **`claude-sonnet-4-6`**, **called directly from the browser**; the key stays in the browser.
- **Three more agent passes** layer the experience: state → one `companion.md`; state → one companion *per person* with a Pack Back block; and a **merge** pass that folds a returned handoff into the state with a changelog.
- **Fixed JSON output schema, validated client-side**, rendered as the I→P→S→D pipeline plus cards.
- **Guardrails + isolation check** make the engine honest; **input-language matching** keeps Thai-in/Thai-out.
- Light + dark theme, phase-by-phase progress on every async step.

## Challenges we ran into
Making the engine *honest*. An LLM will happily invent a clean-looking project state from a vague paste. The hard part was getting it to say "not stated in input," to anchor every claim to real words, and to surface its own uncertainty via the isolation check instead of producing confident garbage. The second hard part was making the loop genuinely *live* — a merge that resolves open loops and re-points next actions rather than letting stale items pile up, so the regenerated companions reflect the new reality and people with no work left actually drop out.

## Accomplishments we're proud of
A working, self-contained demo — not a mockup — with a real **living loop**: messy chat in, shared state out, split into per-teammate packets, then a returned handoff merges back and the folder versions itself toward convergence. It runs on the judge's own API key with `npm install && npm run dev`, and it holds up in a second language (verified on a real Thai voice transcript).

## What we learned
The bottleneck in team + AI collaboration isn't the model — it's the **substrate**. Humans and copilots don't drift because they're dumb; they drift because the shared state was never written into a place both can read. Write it once, keep it alive as work comes back, and both stop guessing.

## What's next
Real-time capture (Slack / Discord) so the state updates as the conversation happens; auto-writing `companion.md` straight into a repo on each decision; and drift-tracking across a whole event. The living loop already works end to end — these extend where the input and output plug in.

---

## Built with
`react` · `vite` · `anthropic` · `claude-sonnet-4-6` · `javascript`

## Demo sample (built into the app — `try a sample →`)
A dropship squad — **Chad, Cody, Dylan** — launching a Shopify LED-face-mask store, **"GlowGod,"** before Friday. Chad pivoted from a posture corrector on a call Cody missed; the product link, AliExpress supplier, $30 retail, and $500 ad budget are all in Chad's head (the STORE gap), and payment/refunds are still an open loop. One click finds the shared state; the sample handoff merges it back to v2.

## How to run (judges)
```bash
npm install
npm run dev
```
Then:
1. Open **http://localhost:5173**.
2. Paste your Anthropic API key in the browser field (or set `VITE_ANTHROPIC_API_KEY` in `.env`).
3. Click **try a sample →**, then **Find the shared state**.
4. Click **Split into companions →**, then **try a sample handoff →** and **Merge into shared state ↑** to watch the folder go live.

## Links
- **Repo:** https://github.com/peuarchukiati-rgb/klear
- **Demo video (< 2 min):** [ FILL IN — YouTube/Loom URL ]
- **Live demo:** [ FILL IN — deployed URL ]

## Team
[ FILL IN ]
