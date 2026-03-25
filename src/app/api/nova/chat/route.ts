/**
 * POST /api/nova/chat — SSE proxy to Nova AI Gateway
 *
 * Accepts { message, conversationHistory? } from the client,
 * forwards to the Nova AI Gateway, and streams back SSE events.
 * This avoids CORS issues since the client talks to its own domain.
 */

import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

const NOVA_GATEWAY_URL =
  process.env.NOVA_GATEWAY_URL ||
  "https://econova-ai-platform-production.up.railway.app";
const NOVA_API_KEY = process.env.NOVA_API_KEY || "";

export async function POST(req: NextRequest) {
  // Auth check
  const session = await getSession();
  if (!session) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: "No autorizado" })}\n\n`,
      {
        status: 401,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  let body: {
    message?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
    conversationId?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: "JSON invalido" })}\n\n`,
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  const { message, conversationHistory, conversationId } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: "Mensaje requerido" })}\n\n`,
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  // Resolve the app URL for Nova to call back
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    req.nextUrl.origin ||
    "http://localhost:3000";

  // Forward the user's auth token so Nova can make authenticated requests
  const authToken = req.cookies.get("econova-token")?.value || "";

  // Build payload for Nova AI Gateway
  const gatewayPayload: Record<string, unknown> = {
    message: message.trim(),
    conversation_id:
      conversationId || `novatrace-${session.userId}-${Date.now()}`,
    tenant_id: "novatrace",
    stream: true,
    context: {
      user_email: session.email,
      user_role: session.role,
      source: "novatrace-widget",
      // Connection info so Nova can call back to NovaTrace APIs
      api_url: appUrl,
      api_token: authToken,
      // Available NovaTrace API endpoints Nova can call
      available_endpoints: [
        {
          method: "GET",
          path: "/api/batches",
          description: "List all batches",
        },
        {
          method: "POST",
          path: "/api/batches",
          description: "Create a new batch",
          body: {
            feedstockType: "string (required) — e.g. LDPE, HDPE, PP, PS, PET, MIX, MULCH_FILM, DRIP_TAPE, GREENHOUSE, SILAGE, OTHER",
            feedstockOrigin: "string (required) — origin/source of the feedstock",
            feedstockWeight: "number (required) — weight in kg",
            feedstockCondition: "string (optional) — condition description",
            contaminationPct: "number (optional) — contamination percentage 0-100",
            operators: "string[] (required, min 1) — operator names",
            processType: "string (optional) — PYROLYSIS or DISTILLATION",
            notes: "string (optional)",
          },
        },
        {
          method: "GET",
          path: "/api/batches/:id",
          description: "Get batch details by ID",
        },
        {
          method: "PATCH",
          path: "/api/batches/:id",
          description: "Update a batch (status, oilOutput, etc.)",
          body: {
            status: "string (optional) — ACTIVE, COMPLETED, INCOMPLETE, TEST",
            oilOutput: "number (optional) — oil output in liters",
            oilWeightKg: "number (optional)",
            residueWeightKg: "number (optional)",
            yieldPercent: "number (optional) — 0-100",
            durationMinutes: "number (optional)",
            dieselConsumedL: "number (optional)",
            stopReason: "string (optional)",
            notes: "string (optional)",
          },
        },
        {
          method: "POST",
          path: "/api/batches/:id/readings",
          description: "Add a temperature/pressure reading to a batch",
          body: {
            reactorTemp: "number (optional) — reactor temperature °C",
            controlTemp: "number (optional)",
            steelTemp: "number (optional)",
            chainTemp: "number (optional)",
            compressorPsi: "number (optional)",
            regulatorPsi: "number (optional)",
            notes: "string (optional)",
          },
        },
        {
          method: "POST",
          path: "/api/batches/:id/events",
          description: "Add a process event to a batch",
          body: {
            type: "string (required) — VALVE_CHANGE, EQUIPMENT_TOGGLE, FUEL_ADD, INCIDENT, OBSERVATION, PHASE_CHANGE",
            detail: "string (required)",
            notes: "string (optional)",
          },
        },
      ],
    },
  };

  // Include conversation history if provided
  if (conversationHistory && Array.isArray(conversationHistory)) {
    gatewayPayload.conversation_history = conversationHistory
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
  }

  try {
    const gatewayResponse = await fetch(`${NOVA_GATEWAY_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NOVA_API_KEY}`,
        "X-Tenant-ID": "novatrace",
      },
      body: JSON.stringify(gatewayPayload),
    });

    if (!gatewayResponse.ok) {
      const errText = await gatewayResponse.text().catch(() => "");
      console.error(
        `[Nova Proxy] Gateway error ${gatewayResponse.status}:`,
        errText.slice(0, 500)
      );
      return new Response(
        `event: error\ndata: ${JSON.stringify({ message: "Error al conectar con Nova AI" })}\n\n`,
        {
          status: 502,
          headers: { "Content-Type": "text/event-stream" },
        }
      );
    }

    // Check if response is SSE stream
    const contentType = gatewayResponse.headers.get("content-type") || "";

    if (contentType.includes("text/event-stream") && gatewayResponse.body) {
      // Stream SSE directly through
      const transformStream = new TransformStream();
      const writer = transformStream.writable.getWriter();
      const reader = gatewayResponse.body.getReader();
      const decoder = new TextDecoder();

      // Pipe the stream
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            await writer.write(value);
          }
        } catch (err) {
          console.error("[Nova Proxy] Stream error:", err);
        } finally {
          await writer.close().catch(() => {});
        }
      })();

      return new Response(transformStream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // Non-streaming JSON response — convert to SSE format
    const jsonData = await gatewayResponse.json().catch(() => ({}));
    const answer =
      jsonData.response ||
      jsonData.answer ||
      jsonData.message ||
      "Sin respuesta";
    const convId =
      jsonData.conversation_id || jsonData.conversationId || conversationId;

    const sseResponse = [
      `event: token\ndata: ${JSON.stringify({ text: answer })}\n\n`,
      `event: done\ndata: ${JSON.stringify({ answer, conversationId: convId, toolsUsed: jsonData.tools_used || [] })}\n\n`,
    ].join("");

    return new Response(sseResponse, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[Nova Proxy] Fetch error:", err);
    return new Response(
      `event: error\ndata: ${JSON.stringify({ message: "Error de conexion con Nova AI" })}\n\n`,
      {
        status: 502,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }
}
