import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const SMTP_HOST = Deno.env.get("SMTP_HOST") ?? "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") ?? "587");
const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") ?? "";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { record, old_record } = await req.json();

    // Check if it's an insert to stage_history
    if (record && record.to_stage) {
      const client = new SmtpClient();
      await client.connectTLS({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USER,
        password: SMTP_PASSWORD,
      });

      await client.send({
        from: SMTP_USER,
        to: "suggester@example.com", // In a real scenario, fetch suggester_email from projects table using record.project_id
        subject: `Lakshya: Project moved to ${record.to_stage}`,
        content: `Your project has been moved to ${record.to_stage} by reviewer.`,
      });

      await client.close();

      return new Response(
        JSON.stringify({ message: "Email sent" }),
        { headers: { "Content-Type": "application/json" }, status: 200 },
      )
    }

    return new Response(JSON.stringify({ message: "Ignored" }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
