# NovaMind AI

**Turn rough ideas into clear, actionable plans.**

NovaMind AI is an early-stage web prototype for turning a project idea into a practical first roadmap. Users can generate a plan, check off steps, copy it, and download it as Markdown.

## Current features

- Responsive landing page and idea-planning workspace
- User inputs for an idea, goal, and experience level
- Structured plan with action steps, time estimates, risks, and a success metric
- Checklist interactions, copy-to-clipboard, and Markdown export
- Server-side Gemini API integration when configured
- Clearly labelled built-in demo mode when no API key is configured

## Run locally

Requirements: Node.js 18 or later.

```bash
npm start
```

Open `http://localhost:3000`.

No third-party packages are required. With no API key, the app uses a built-in demo planner so the interface can be tested. This is **not** a real AI response.

## Enable real AI plans (optional)

1. Create a Gemini API key in Google AI Studio.
2. Set `GEMINI_API_KEY` as an environment variable on the server or hosting provider.
3. Restart the server and check `/api/health`; `aiConfigured` should be `true`.
4. Generate a plan and confirm the UI says **AI-generated plan**.

Do not put a real API key in `index.html`, client-side JavaScript, screenshots, or a public repository. Keep it as a server environment variable.

For local development, you can copy `.env.example` for reference, but this minimal app does not load `.env` automatically. Set the environment variable in your terminal before starting the server.

### Windows PowerShell

```powershell
$env:GEMINI_API_KEY="YOUR_KEY_HERE"
npm start
```

### Linux / macOS

```bash
export GEMINI_API_KEY="YOUR_KEY_HERE"
npm start
```

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, create a **New Web Service** and connect the repository.
3. Runtime: Node. Build command can be left empty; start command: `npm start`.
4. Add `GEMINI_API_KEY` in the service's Environment settings if you want real AI responses.
5. Deploy and open the Render URL. Test the planner before recording your demo.

## API

- `GET /api/health` — reports server status and whether the AI key is configured.
- `POST /api/plan` — accepts JSON `{ "idea": "...", "goal": "...", "level": "Beginner" }`.

## Project status and honest demo guidance

This repository is a working prototype, not a finished commercial product. Without a Gemini key it produces a template-based demo plan. With a valid key and network access it requests a structured plan from Gemini. Review AI output before relying on it.

For a hackathon submission, show the actual app running. Do not describe a mockup as a working AI feature, and do not claim features that have not been tested.

## Built with

- HTML, CSS, JavaScript
- Node.js built-in HTTP server
- Google Gemini API (optional, configured server-side)
