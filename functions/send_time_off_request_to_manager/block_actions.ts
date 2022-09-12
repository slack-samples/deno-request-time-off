import { SlackAPI } from "deno-slack-api/mod.ts";
import { SendTimeOffRequestToManagerFunction } from "./definition.ts";
import { BlockActionHandler } from "deno-slack-sdk/types.ts";
import { APPROVE_ID } from "./constants.ts";
import timeOffRequestHeaderBlocks from "./blocks.ts";

const block_actions: BlockActionHandler<
  typeof SendTimeOffRequestToManagerFunction.definition
> = async function ({ action, body, token }) {
  console.log("Incoming action handler invocation", action);
  const client = SlackAPI(token);

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
            text: `${approved ? " :white_check_mark: Approved" : ":x: Denied"}`,
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
};

export default block_actions;
