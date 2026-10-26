# NovaMind AI — planning document

## Problem
People often have ideas but struggle to turn them into a first set of achievable actions.

## Intended user
A student, beginner builder, or solo maker who needs a simple starting roadmap.

## Proposed solution
A lightweight idea-to-action planner that converts an idea into steps, time estimates, risks, and a measurable first success criterion.

## MVP scope
1. Capture an idea, goal, and experience level.
2. Generate a structured plan through Gemini when configured.
3. Provide a clearly labelled template-based fallback for testing.
4. Let users check off steps and export the plan as Markdown.

## Out of scope for the MVP
- User accounts and cloud-saved history
- Team collaboration
- Payments
- Guaranteed correctness of AI-generated suggestions

## Validation plan
Ask three target users to enter a real project idea. Observe whether they understand the plan and can identify the first action without help. Record confusion, then improve the biggest issue.

## Main risks
- AI output may be inaccurate or too generic.
- Users may interpret suggestions as guarantees.
- Missing or invalid API configuration can prevent real AI generation.

## Success metric
At least three test users can identify and explain their next action after using the planner.
