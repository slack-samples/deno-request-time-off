import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import timeOffRequestHeaderBlocks from "./blocks.ts";

Deno.test("timeOffRequestHeaderBlocks generates valid blocks for inputs without reason", async () => {
  const expectedBlocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "A new time-off request has been submitted",
      },
    },
    { type: "section", text: { type: "mrkdwn", text: "*From:* <@U12345>" } },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Dates:* 2022-03-01 to 2022-03-10" },
    },
    { type: "section", text: { type: "mrkdwn", text: "*Reason:* N/A" } },
  ];
  const blocks = await timeOffRequestHeaderBlocks({
    employee: "U12345",
    start_date: "2022-03-01",
    end_date: "2022-03-10",
  });
  assertEquals(blocks, expectedBlocks);
});

Deno.test("timeOffRequestHeaderBlocks generates valid blocks for full inputs", async () => {
  const expectedBlocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "A new time-off request has been submitted",
      },
    },
    { type: "section", text: { type: "mrkdwn", text: "*From:* <@U12345>" } },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Dates:* 2022-03-01 to 2022-03-10" },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: "*Reason:* On vacation!" },
    },
  ];
  const blocks = await timeOffRequestHeaderBlocks({
    employee: "U12345",
    start_date: "2022-03-01",
    end_date: "2022-03-10",
    reason: "On vacation!",
  });
  assertEquals(blocks, expectedBlocks);
});
