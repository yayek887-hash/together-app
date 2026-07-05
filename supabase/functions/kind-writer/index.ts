// Together — "Help me write kindly" Edge Function
// Rewrites a teen's draft post to be warm, kind, and age-appropriate.
// Deploy: supabase functions deploy kind-writer
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 3) {
      return Response.json(
        { error: "Text is too short to rewrite." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "AI service not configured." },
        { status: 503, headers: CORS_HEADERS }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `You are a compassionate writing assistant for Together — a safe social app for children and teenagers aged 10–17.

Your task is to gently rewrite a young person's message so it is:
- Warm, kind, and supportive
- Honest and true to their original feeling
- Age-appropriate and easy to understand
- Safe — free from harmful, aggressive, or hurtful language
- Short and natural, like something a teen would actually say

Original message: "${text.trim()}"

Reply with ONLY the rewritten message. No explanations, no quotation marks around it.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API responded with ${response.status}`);
    }

    const { content } = await response.json();
    const kindText = content?.[0]?.text?.trim() ?? text;

    return Response.json(
      { kindText },
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("kind-writer error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
