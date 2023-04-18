import { SendTimeOffRequestToManagerFunction } from "./definition.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { APPROVE_ID, DENY_ID } from "./constants.ts";
import timeOffRequestHeaderBlocks from "./blocks.ts";

// Custom function that sends a message to the user's manager asking
// for approval for the time off request. The message includes some Block Kit with two
// interactive buttons: one to approve, and one to deny.
export default SlackFunction(
  SendTimeOffRequestToManagerFunction,
  async ({ inputs, client }) => {
    console.log("Forwarding the following time off request:", inputs);

    // Create a block of Block Kit elements composed of several header blocks
    // plus the interactive approve/deny buttons at the end
    const blocks = timeOffRequestHeaderBlocks(inputs).concat([{
      "type": "actions",
      "block_id": "approve-deny-buttons",
      "elements": [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Approve",
          },
          action_id: APPROVE_ID, // <-- important! we will differentiate between buttons using these IDs
          style: "primary",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Deny",
          },
          action_id: DENY_ID, // <-- important! we will differentiate between buttons using these IDs
          style: "danger",
        },
      ],
    }]);

    // Send the message to the manager
    const msgResponse = await client.chat.postMessage({
      channel: inputs.manager,
      blocks,
      // Fallback text to use when rich media can't be displayed (i.e. notifications) as well as for screen readers
      text: "A new time off request has been submitted",
    });

    if (!msgResponse.ok) {
      console.log("Error during request chat.postMessage!", msgResponse.error);
    }

    // IMPORTANT! Set `completed` to false in order to keep the interactivity
    // points (the approve/deny buttons) "alive"
    // We will set the function's complete state in the button handlers below.
    return {
      completed: false,
    };
  },
  // Create an 'actions handler', which is a function that will be invoked
  // when specific interactive Block Kit elements (like buttons!) are interacted
  // with.
).addBlockActionsHandler(
  // listen for interactions with components with the following action_ids
  [APPROVE_ID, DENY_ID],
  // interactions with the above two action_ids get handled by the function below
  async function ({ action, body, client }) {
    console.log("Incoming action handler invocation", action);

    const approved = action.action_id === APPROVE_ID;

    // Send manager's response as a message to employee
    const msgResponse = await client.chat.postMessage({
      channel: body.function_data.inputs.employee,
      blocks: [{
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text:
              `Your time off request from ${body.function_data.inputs.start_date} to ${body.function_data.inputs.end_date}` +
              `${
                body.function_data.inputs.reason
                  ? ` for ${body.function_data.inputs.reason}`
                  : ""
              } was ${
                approved ? " :white_check_mark: Approved" : ":x: Denied"
              } by <@${body.user.id}>`,
          },
        ],
      }],
      text: `Your time off request was ${approved ? "approved" : "denied"}!`,
    });
    if (!msgResponse.ok) {
      console.log(
        "Error during requester update chat.postMessage!",
        msgResponse.error,
      );
    }

    // Update the manager's message to remove the buttons and reflect the approval
    // state. Nice little touch to prevent further interactions with the buttons
    // after one of them were clicked.
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
                approved ? " :white_check_mark: Approved" : ":x: Denied"
              }`,
            },
          ],
        },
      ]),
    });
    if (!msgUpdate.ok) {
      console.log("Error during manager chat.update!", msgUpdate.error);
    }

    // And now we can mark the function as 'completed' - which is required as
    // we explicitly marked it as incomplete in the main function handler.
    await client.functions.completeSuccess({
      function_execution_id: body.function_data.execution_id,
      outputs: {},
    });
  },
);
