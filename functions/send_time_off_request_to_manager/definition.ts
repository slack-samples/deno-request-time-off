import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
/**
 * Custom function that sends a message to the user's manager asking for approval
 * for the time off request. The message includes some Block Kit with two interactive
 * buttons: one to approve, and one to deny.
 */
export const SendTimeOffRequestToManagerFunction = DefineFunction({
  callback_id: "send_time_off_request_to_manager",
  title: "Request Time Off",
  description: "Sends your manager a time off request to approve or deny",
  source_file: "functions/send_time_off_request_to_manager/mod.ts",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      employee: {
        type: Schema.slack.types.user_id,
        description: "The user requesting the time off",
      },
      manager: {
        type: Schema.slack.types.user_id,
        description: "The manager approving the time off request",
      },
      start_date: {
        type: Schema.slack.types.date,
        description: "Time off start date",
      },
      end_date: {
        type: Schema.slack.types.date,
        description: "Time off end date",
      },
      reason: {
        type: Schema.types.string,
        description: "The reason for the time off request",
      },
    },
    required: [
      "employee",
      "manager",
      "start_date",
      "end_date",
      "interactivity",
    ],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});
