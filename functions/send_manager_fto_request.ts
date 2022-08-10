import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SendManagerFTORequestFunction } from "../manifest.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { BlockActionsRouter } from "deno-slack-sdk/mod.ts";

const sendMgrDM: SlackFunctionHandler<
  typeof SendManagerFTORequestFunction.definition
> = async (
  { inputs, token },
) => {
  console.log(`employee: ${inputs.employee}.`);
  console.log(`manager: ${inputs.manager}.`);
  console.log(`start date: ${inputs.start_date}.`);
  console.log(`end date: ${inputs.end_date}.`);
  console.log(`reason: ${inputs.reason} (${typeof inputs.reason}).`);

  const client = SlackAPI(token, {});

  const blocks = timeOffRequestHeaderBlocks(inputs).concat([
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
  ]);

  const msgResponse = await client.chat.postMessage({
    channel: inputs.manager,
    blocks,
  });
  if (!msgResponse.ok) {
    console.log('Error during request chat.postMessage!', msgResponse.error);
  }

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
    console.log("Incoming action handler invocation", action, body);
    const client = SlackAPI(token);

    const approved = action.action_id === "approve_request";

    // Send manager's response to employee's request as a message to employee
    const msgResponse = await client.chat.postMessage({
      channel: body.function_data.inputs.employee,
      blocks: [{
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Your time off request from ${body.function_data.inputs.start_date} to ${body.function_data.inputs.end_date}` +
            `${
              body.function_data.inputs.reason ? ` for ${body.function_data.inputs.reason}` : ""
            } was ${
              approved ? " :white_check_mark: Approved" : ":x: Denied"
            } by <@${body.user.id}>`,
          },
        ],
      }],
    });
    if (!msgResponse.ok) {
      console.log('Error during requester update chat.postMessage!', msgResponse.error);
    }

    // Update the manager's message to remove the buttons and reflect the approval state
    const msgUpdate = await client.chat.update({
      channel: body.container.channel_id,
      ts: body.container.message_ts,
      blocks: timeOffRequestHeaderBlocks(body.function_data.inputs).concat([
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `${
                approved ? " :white_check_mark: Approved" : ":x: Denied"}`,
            },
          ],
        }
      ]),
    });
    if (!msgUpdate.ok) {
      console.log('Error during manager chat.update!', msgUpdate.error);
    }

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
        return await client.functions.completeError({
          error: put_response.error,
          outputs: {},
        });
      }
      console.log("Datastore put successful!");
    }
    // And now we can mark the function as 'completed' - which is required as
    // we explicitly marked it as incomplete in the main function handler.
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: {},
    });
  },
);

function timeOffRequestHeaderBlocks(inputs) {
  return [
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
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Reason:* ${inputs.reason ? inputs.reason : "N/A"}`,
      },
    },
  ];
}
