// Supabase Edge Function: send-whatsapp
// Deploy: Supabase Dashboard → Edge Functions → New Function → nome: "send-whatsapp"
// Cole este código completo no editor e clique em Deploy.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const { to, token, phoneNumberId, templateName, patientName } = await req.json();

    if (!to || !token || !phoneNumberId) {
      return new Response(
        JSON.stringify({ error: { message: "Faltando: to, token ou phoneNumberId" } }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const phone = to.replace(/\D/g, "");

    // Monta o corpo da requisição para a Meta API
    // Em modo de teste, apenas hello_world (en_US) está disponível.
    // Em produção, use o nome do template aprovado em pt_BR.
    const isTest = templateName === "hello_world";
    const body: Record<string, unknown> = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: templateName || "hello_world",
        language: { code: isTest ? "en_US" : "pt_BR" },
      },
    };

    // Se template personalizado, injeta o nome do paciente como parâmetro
    if (!isTest && patientName) {
      const firstName = patientName.trim().split(" ")[0];
      body.template = {
        ...body.template as object,
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: firstName }],
          },
        ],
      };
    }

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: { message: e.message } }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
