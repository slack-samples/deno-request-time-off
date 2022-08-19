import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SendFTORequestToManagerFunction } from "./definition.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { BlockActionsRouter } from "deno-slack-sdk/mod.ts";

// Custom function that sends a message to the user's manager asking
// for approval for the time off request. The message includes some Block Kit with two
// interactive buttons: one to approve, and one to deny.
const sendMgrDM: SlackFunctionHandler<
  typeof SendFTORequestToManagerFunction.definition
> = async (
  params,
) => {
  console.log('hello?');
  console.log(JSON.stringify(params, null, 2));
  const { inputs, token } = params;

  const client = SlackAPI(token, {});

  let viewResp = await client.views.open({
    channel_id: inputs.channel_id,
    trigger_id: inputs.interactivity.interactivity_pointer,
    view: {
      "type": "modal",
      "title": {
        "type": "plain_text",
        "text": "Modal title",
      },
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "It's Block Kit...but _in a modal_",
          },
          "block_id": "section1",
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Click me",
            },
            "action_id": "button_abc",
            "value": "Button value",
            "style": "danger",
          },
        },
      ],
      "close": {
        "type": "plain_text",
        "text": "Cancel",
      },
      "submit": {
        "type": "plain_text",
        "text": "Save",
      },
      "private_metadata": "Shhhhhhhh",
      "callback_id": "view_identifier_12",
    },
  });
  if (!viewResp.ok) {
    console.log(viewResp.error);
  }
  return {
    completed: false,
  };
};

export default sendMgrDM;

// Create an 'actions router' which is a helper utility to route interactions
// with different interactive Block Kit elements (like buttons!)
const ActionsRouter = BlockActionsRouter(SendFTORequestToManagerFunction);

export const blockActions = ActionsRouter.addHandler(
  // listen for interactions with components with the following action_ids
  ["approve_request", "deny_request"],
  // interactions with the above components get handled by the function below
  async ({ action, body, token }) => {
    console.log("Incoming action handler invocation", action);
    const client = SlackAPI(token);

    const approved = action.action_id === "approve_request";

    // Send manager's response as a message to employee
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

    // And now we can mark the function as 'completed' - which is required as
    // we explicitly marked it as incomplete in the main function handler.
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: {},
    });
  },
);

function timeOffRequestHeaderBlocks(inputs: any): any[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `A new waste of time request has been submitted`,
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
