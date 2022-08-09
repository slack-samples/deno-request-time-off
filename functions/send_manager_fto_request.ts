import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SendManagerFTORequestFunction } from "../manifest.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { BlockActionsRouter } from "deno-slack-sdk/mod.ts";

const sendMgrDM: SlackFunctionHandler<
  typeof SendManagerFTORequestFunction.definition
> = async (
  { inputs, env, token },
) => {
  console.log(`employee: ${inputs.employee}.`);
  console.log(`manager: ${inputs.manager}.`);
  console.log(`start date: ${inputs.start_date}.`);
  console.log(`end date: ${inputs.end_date}.`);
  console.log(`reason: ${inputs.reason}.`);

  const client = SlackAPI(token, {});

  await client.chat.postMessage({
    channel: inputs.manager,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `A new time-off request has been submitted`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*From:* <@${inputs.employee}>`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Dates:* ${inputs.start_date} to ${inputs.end_date}`,
        },
      },
      inputs.reason
        ? {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Reason:* ${inputs.reason}`,
          },
        }
        : null,
      {
        "type": "actions",
        "block_id": "approve-deny-buttons",
        "elements": [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Approve",
            },
            action_id: "approve_request",
            style: "primary",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Deny",
            },
            action_id: "deny_request",
            style: "danger",
          },
        ],
      },
    ],
  });

  // return await {
  //   outputs: {},
  // };
  return {
    completed: false,
  };
};

export default sendMgrDM;

const ActionsRouter = BlockActionsRouter(SendManagerFTORequestFunction);

export const blockActions = ActionsRouter.addHandler(
  ["approve_request", "deny_request"],
  async ({ action, body, token }) => {
    console.log("Incoming action handler invocation", action);
    const client = SlackAPI(token);

    const approved = action.action_id === "approve_request";

    await client.chat.postMessage({
      channel: body.function_data.inputs.employee,
      blocks: [{
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${
              approved ? " :white_check_mark: Approved" : ":x: Denied"
            } by <@${body.user.id}>`,
          },
        ],
      }],
    });

    if (approved) {
      console.log("saving approved FTO request to datastore");
      const primarykey = crypto.randomUUID();

      const put_response = await client.apps.datastore.put({
        datastore: "fto_requests_db",
        item: {
          id: primarykey,
          employee: body.function_data.inputs.employee,
          approved_by: body.function_data.inputs.manager,
          start_date: body.function_data.inputs.start_date,
          end_date: body.function_data.inputs.end_date,
        },
      });

      if (!put_response.ok) {
        console.log("Error calling apps.datastore.put:");
        console.log(put_response.error);
        await client.functions.completeError({
          error: put_response.error,
          outputs: {},
        });
      } else {
        console.log("Datastore put successful!");
        await client.functions.completeSuccess({
          function_execution_id: body.function_data.execution_id,
          outputs: {},
        });
      }
    } else {
      // And now we can mark the function as 'completed' - which is required as
      // we explicitly marked it as incomplete in the main function handler.
      await client.functions.completeSuccess({
        function_execution_id: body.function_data.execution_id,
        outputs: {},
      });
    }
  },
);
