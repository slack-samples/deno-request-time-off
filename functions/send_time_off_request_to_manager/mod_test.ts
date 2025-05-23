import { stub } from "@std/testing/mock";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "@std/assert";
import handler from "./mod.ts";

const { createContext } = SlackFunctionTester("my-function");

Deno.test("SendTimeOffRequestToManagerFunction runs successfully", async () => {
  // Replaces globalThis.fetch with the mocked copy
  using _fetchStub = stub(
    globalThis,
    "fetch",
    async (url: string | URL | Request, options?: RequestInit) => {
      const request = url instanceof Request ? url : new Request(url, options);

      assertEquals(request.method, "POST");
      assertEquals(request.url, "https://slack.com/api/chat.postMessage");

      const body = await request.formData();
      if (body.get("channel")?.toString() !== "U22222") {
        return new Response(`{"ok": false, "error": "unexpected channel ID"}`, {
          status: 200,
        });
      }
      if (body.get("blocks") === undefined) {
        return new Response(`{"ok": false, "error": "blocks are missing!"}`, {
          status: 200,
        });
      }
      return new Response(`{"ok": true, "message": {"ts": "111.222"}}`, {
        status: 200,
      });
    },
  );

  const inputs = {
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
  };
  const env = { LOG_LEVEL: "ERROR" };
  const result = await handler(createContext({ inputs, env }));
  assertEquals(result, { completed: false });
});
