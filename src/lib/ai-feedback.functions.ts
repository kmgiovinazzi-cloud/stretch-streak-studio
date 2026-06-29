import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  imageUrl: z.string().url(),
  context: z.string().optional(),
});

export const getFormFeedback = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a flexibility and stretching coach for dancers, gymnasts, cheerleaders, figure skaters, and contortionists. Look at the user's photo and give brief, encouraging, actionable form feedback: alignment, hip/shoulder squareness, common compensations, and one safe progression. Keep it to 3-5 short bullet points. Be supportive. Never diagnose injuries.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: data.context ? `Context: ${data.context}` : "Please review my stretch form." },
              { type: "image_url", image_url: { url: data.imageUrl } },
            ],
          },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Too many AI requests — try again in a minute.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
    if (!res.ok) throw new Error(`AI feedback failed (${res.status})`);

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "No feedback returned.";
    return { feedback: text };
  });
