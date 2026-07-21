# Artifact inference

Draft only rows with real signal. One or two artifacts per meeting is normal; all of
them is suspect padding.

| Signal in transcript | Artifact | Notes |
|---|---|---|
| Explicit call made ("let's go with X") | `decisions.md` | Record who signed off + reasoning. Tag reversibility. |
| Group agreed what a feature/system must do | `requirements.md` | Agreed requirements only, not dropped brainstorm options. |
| Architecture/design approach agreed | `design.md` (ADR) | Prefer over prose in `decisions.md`. |
| "I'll do X by Y" / assignment | `tasks.md` | Owner + due date mandatory; missing either → summary only. |
| Question raised, explicitly unresolved | `open-questions.md` | Owner + answer-by date mandatory. Defines next meeting's agenda. |
| Concern voiced ("this could break if...") | `risks.md` | Severity + mitigation owner, even if mitigation is "monitor". |
| Decision made over a stated objection | `disagreements.md` | Objection, who raised it, reasoning to proceed. Real objections only, not clarifying questions. |
| New terminology / ownership change / tribal knowledge | `context.md` | Feeds the knowledge base. |
| Anything happened | `summary.md` | Nearly always worth writing; often the only artifact. |

## Signal vs. noise

- Conflicting positions → take the **last** stated one.
- A decision needs an explicit close, not just a leaning conversation.
- Ambiguous tone (sarcasm vs. commitment) → flag for the review gate, don't guess.

## Yield weighting

For effectiveness scoring: `decisions.md` / resolved open questions > `design.md` /
`requirements.md` > bare `tasks.md`. A meeting producing only a vague task list is weak —
say so.
