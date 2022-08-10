import {
  DefineFunction,
  Schema,
} from "deno-slack-sdk/mod.ts";

// Custom function that sends a message to the user's manager asking
// for approval for the time off request. The message includes some Block Kit with two
// interactive buttons: one to approve, and one to deny.
export const SendFTORequestToManagerFunction = DefineFunction({
  callback_id: "send_manager_fto",
  title: "Request FTO",
  description: "Sends your manager an FTO Request to approve or deny",
  source_file: "functions/send_fto_request_to_manager/mod.ts",
  input_parameters: {
    properties: {
      employee: {
        type: Schema.slack.types.user_id,
        description: "The user requesting the time off",
      },
      manager: {
        type: Schema.slack.types.user_id,
        description: "The manager approving the time off request",
      },
      start_date: {
        type: "slack#/types/date",
        description: "What date the FTO will start",
      },
      end_date: {
        type: "slack#/types/date",
        description: "What date the FTO will end",
      },
      reason: {
        type: Schema.types.string,
        description: "The reason for the FTO request",
      },
    },
    required: ["employee", "manager", "start_date", "end_date"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});
