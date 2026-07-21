---
type: meeting-tasks
tags: [meeting/tasks]
meeting: "<meeting title>"
date: YYYY-MM-DD
status: draft                # draft | approved
---

# Tasks from: <meeting title> — YYYY-MM-DD

Every item has an owner and a due date. An item with neither isn't a task — leave it out
(mention it in `summary.md` as a loose intention instead).

- [ ] <task summary>
  - **Owner:** handle
  - **Due:** YYYY-MM-DD
  - **Context:** why this came up / what it unblocks
  - **Related:** decision/requirement this traces back to, if any

---

> Via an `mcp`/`cli` tracker destination: one issue per item, assignee = owner, body
> links back to this meeting's `summary.md`.
