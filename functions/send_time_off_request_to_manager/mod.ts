import { SendTimeOffRequestToManagerFunction } from "./definition.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { SlackFunction } from "deno-slack-sdk/mod.ts";
import BlockActionHandler from "./block_actions.ts";
import { APPROVE_ID, DENY_ID } from "./constants.ts";
import timeOffRequestHeaderBlocks from "./blocks.ts";

// Custom function that sends a message to the user's manager asking
// for approval for the time off request. The message includes some Block Kit with two
// interactive buttons: one to approve, and one to deny.
export default SlackFunction(
  SendTimeOffRequestToManagerFunction,
  async ({ inputs, token }) => {
    console.log("Forwarding the following time off request:", inputs);
    const client = SlackAPI(token, {});

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
  // Create an 'actions router' which is a helper utility to route interactions
  // with different interactive Block Kit elements (like buttons!)
).addBlockActionsHandler(
  // listen for interactions with components with the following action_ids
  [APPROVE_ID, DENY_ID],
  // interactions with the above components get handled by the function below
  BlockActionHandler,
);
