// supabase/functions/triage-report/index.ts
//
// AI integration: classifies an incoming safety report's urgency so the
// safety team's queue is sorted by what needs attention first.
//
// The Anthropic API key lives only in this server-side Edge Function
// (set via `supabase secrets set ANTHROPIC_API_KEY=...`) — it is never
// exposed to the browser/client bundle.
//
// Deploy with:  supabase functions deploy triage-report

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { type, details, reporter_id } = await req.json();

    if (!type || !reporter_id) {
      return new Response(JSON.stringify({ error: "type and reporter_id are required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Ask Claude to triage the report's urgency.
    const { priority, reasoning } = await classifyReport(type, details);

    // Insert the report with the AI-assigned priority using the service role
    // (bypasses RLS safely, server-side only).
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_id,
        type,
        details: details || "",
        priority,
        ai_reasoning: reasoning,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ report: data }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});

async function classifyReport(type, details) {
  // Self-harm concerns are always treated as urgent regardless of the model's
  // output — this is a hard safety floor, not left to the AI's discretion.
  if (type === "selfharm") {
    return { priority: "urgent", reasoning: "Self-harm concern — always escalated immediately." };
  }

  if (!ANTHROPIC_API_KEY) {
    // Fail safe: if the AI isn't configured, default to "medium" so nothing
    // silently disappears from the safety team's queue.
    return { priority: "medium", reasoning: "AI triage unavailable — defaulted to medium priority." };
  }

  const prompt = `You are a safety triage assistant for a teen support app. A user submitted this report:

Type: ${type}
Details: ${details || "(no extra details provided)"}

Classify the urgency for a human safety-team reviewer as exactly one of: low, medium, high, urgent.
Respond ONLY with strict JSON: {"priority": "...", "reasoning": "one short sentence"}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data?.content?.find((c) => c.type === "text")?.text || "{}";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    const allowed = ["low", "medium", "high", "urgent"];
    return {
      priority: allowed.includes(parsed.priority) ? parsed.priority : "medium",
      reasoning: parsed.reasoning || "",
    };
  } catch {
    return { priority: "medium", reasoning: "Could not parse AI response — defaulted to medium." };
  }
}
