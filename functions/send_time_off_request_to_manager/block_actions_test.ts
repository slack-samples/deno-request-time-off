import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import handler from "./block_actions.ts";
import { APPROVE_ID } from "./constants.ts";

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/chat.postMessage", async (req) => {
  const body = await req.formData();
  if (body.get("channel")?.toString() !== "U11111") {
    return new Response(`{"ok": false, "error": "unexpected channel ID"}`, {
      status: 200,
    });
  }
  return new Response(`{"ok": true, "message": {"ts": "111.222"}}`, {
    status: 200,
  });
});
mf.mock("POST@/api/chat.update", () => {
  return new Response(`{"ok": true, "message": {"ts": "111.222"}}`, {
    status: 200,
  });
});
mf.mock("POST@/api/functions.completeSuccess", () => {
  return new Response(`{"ok": true}`, {
    status: 200,
  });
});

Deno.test("SendTimeOffRequestToManagerFunction runs successfully", async () => {
  const context = {
    action: {
      block_id: "approve-deny-buttons",
      action_id: APPROVE_ID,
      style: "primary",
      type: "button",
      text: {
        type: "plain_text",
        text: "Approve",
        emoji: true,
      },
      action_ts: "1664342569.823796",
    },
    body: {
      container: {
        channel_id: "C11111",
      },
      user: {
        id: "U11111",
      },
      function_data: {
        inputs: {
          employee: "U11111",
          manager: "U22222",
          start_date: "2022-03-01",
          end_date: "2022-03-02",
          interactivity: {
            interactivity_pointer: "111.222.b79....",
            interactor: {
              id: "U33333",
              secret: "NDE0NTIxNDg....",
            },
          },
          "interactivity.interactor": {
            "id": "U33333",
            "secret": "NDE0NTIxNDg....",
          },
          "interactivity.interactor.id": "U03E94MK0",
          "interactivity.interactor.secret": "NDE0NTIxNDg....",
          "interactivity.interactivity_pointer": "111.222.b79....",
        },
      },
    },
    env: { LOG_LEVEL: "ERROR" },
    token: "valid-token",
    // deno-lint-ignore no-explicit-any
  } as any;
  await handler(context);
});
