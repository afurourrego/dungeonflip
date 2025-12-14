# DungeonFlip — Hackathon AI Prompt Pack (Team)

This folder is our shared, team-facing record of AI-assisted development for the Seedify Vibe Coins Hackathon.

## What’s already organized

- `ai_logs/prompts.md`
  - Human-readable, detailed prompts + outcomes (session style).
  - Best for “show your work” and explaining decisions.

- `ai_logs/prompts_compiled.md`
  - Quick, compiled list of prompts (scan-friendly).
  - Best for hackathon reviewers.

- `ai_logs/iteration_history.md`
  - Narrative history of iterations and milestones.
  - Best for describing progress, bugs, and improvements over time.

- `ai_logs/tools_used.md`
  - Which AI tools were used and how.

## Team workflow notes (important)

- This repo is built by multiple contributors. Prompts are captured at the **project level** (not tied to a single person).
- If you want personal attribution for a prompt, use Git history (`git blame`) on the AI log files.

## How to add prompts (standard format)

When a new session produces meaningful work, add a new “Prompt N” section to `ai_logs/prompts.md`:

- Date
- Tool (Copilot / Claude / etc.)
- Context
- Prompt (verbatim if possible)
- Response summary
- Files modified
- Outcome / learning

Then append the condensed version to `ai_logs/prompts_compiled.md`.

## Security reminder

- Never copy private keys, seed phrases, or API secrets into AI logs.
- If a key is ever pasted into chat by mistake, rotate it.
