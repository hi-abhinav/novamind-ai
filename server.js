import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store"
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("Request too large");
  }
  return JSON.parse(raw || "{}");
}

function demoPlan(idea, goal, level) {
  const title = idea.trim().replace(/\s+/g, " ").slice(0, 90);
  const audience = goal || "make this idea useful to real users";
  return {
    title: `Action plan: ${title}`,
    summary: `A starter roadmap to turn "${title}" into a small, testable first version. Focus: ${audience}. This is a local demo plan; connect a Gemini API key to generate a plan with a real AI model.`,
    steps: [
      { title: "Define the problem", detail: "Write the exact problem in one sentence. Identify who experiences it and what they currently do instead.", duration: "30–60 min" },
      { title: "Choose one target user", detail: "Describe one realistic user and the single outcome they need most. Avoid adding extra audiences yet.", duration: "30 min" },
      { title: "Scope the smallest useful version", detail: "Pick one core feature that proves the idea. List what the first version will and will not do.", duration: "45 min" },
      { title: "Build a clickable or working prototype", detail: "Create the main user flow with sample data first. Keep the interface simple and test the happy path.", duration: level === "Beginner" ? "1–2 days" : "4–8 hours" },
      { title: "Test with three people", detail: "Ask people in the target audience to try it without guidance. Record where they hesitate and what they ask for.", duration: "1 day" },
      { title: "Improve and share", detail: "Fix the biggest usability issue, write a short README, and share a demo with a clear explanation of its current limits.", duration: "2–4 hours" }
    ],
    risks: [
      "The first version may try to solve too many problems at once.",
      "Assumptions about users may be wrong until tested.",
      "AI-generated suggestions (when enabled) should be checked for accuracy and practicality."
    ],
    successMetric: "At least 3 target users can complete the main task and explain the value without extra guidance."
  };
}

async function makePlan({ idea, goal, level }) {
  if (!idea || typeof idea !== "string" || idea.trim().length < 8) {
    return { error: "Please describe your idea in at least 8 characters." };
  }
  if (idea.length > 2000) return { error: "Please keep your idea under 2,000 characters." };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ...demoPlan(idea, goal, level), mode: "demo" };

  const prompt = `You are NovaMind AI, a practical product coach. Create a realistic, beginner-friendly plan from the user's idea.
Return ONLY valid JSON with this schema:
{"title":"short title","summary":"2 sentence summary","steps":[{"title":"step title","detail":"specific actionable instruction","duration":"time estimate"}],"risks":["risk 1","risk 2","risk 3"],"successMetric":"one measurable success metric"}
Include 5 to 7 steps. Do not claim anything has been built. Avoid exaggerated claims.
User idea: ${idea}
User goal: ${goal || "make a useful first version"}
Experience level: ${level || "Beginner"}`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.6 }
      }),
      signal: AbortSignal.timeout(25000)
    }
  );

  if (!response.ok) {
    console.error("Gemini request failed:", response.status, await response.text());
    return { ...demoPlan(idea, goal, level), mode: "demo", note: "AI service was unavailable, so a demo plan was shown instead." };
  }
  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.title || !Array.isArray(parsed.steps)) throw new Error("Unexpected response");
    return { ...parsed, mode: "ai" };
  } catch {
    return { ...demoPlan(idea, goal, level), mode: "demo", note: "The AI response could not be parsed, so a demo plan was shown instead." };
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    return send(res, 200, { ok: true, aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
  }

  if (req.method === "POST" && url.pathname === "/api/plan") {
    try {
      const input = await readJson(req);
      const result = await makePlan(input);
      return send(res, result.error ? 400 : 200, result);
    } catch (error) {
      return send(res, error.message === "Request too large" ? 413 : 400, { error: "Could not process that request. Please try again." });
    }
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, { error: "Method not allowed" });
  }

  let pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  try {
    const fullPath = join(ROOT, safePath);
    if (!fullPath.startsWith(ROOT)) return send(res, 403, "Forbidden", "text/plain");
    const content = await readFile(fullPath);
    return send(res, 200, content.toString("utf8"), MIME[extname(fullPath)] || "application/octet-stream");
  } catch {
    return send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`NovaMind AI running on http://localhost:${PORT}`);
});
