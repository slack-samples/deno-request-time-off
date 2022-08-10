import {
  DefineWorkflow,
  Manifest,
  Schema,
} from "deno-slack-sdk/mod.ts";
import { SendFTORequestToManagerFunction } from "./functions/send_fto_request_to_manager/definition.ts";

// Shortcut Workflow to start a time off request
// This will be composed of two steps
export const CreateFTOWorkflow = DefineWorkflow({
  callback_id: "create_fto",
  title: "Add FTO",
  description: "Create an FTO Request",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

// Workflow step 1: open a form to collect the user's manager, start and end dates
// for time off and an optional reason.
const formData = CreateFTOWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Take Your Time",
    interactivity: CreateFTOWorkflow.inputs.interactivity,
    submit_label: "Submit",
    description: "Ask your manager for some time off",
    fields: {
      required: ["manager", "start_date", "end_date"],
      elements: [
        {
          name: "manager",
          title: "Manager",
          type: Schema.slack.types.user_id,
        },
        {
          name: "start_date",
          title: "Start Date",
          type: "slack#/types/date",
        },
        {
          name: "end_date",
          title: "End Date",
          type: "slack#/types/date",
        },
        {
          name: "reason",
          title: "Reason",
          type: Schema.types.string,
        },
      ],
    },
  },
);


// Workflow step 2: send approve/deny message to manager
CreateFTOWorkflow.addStep(SendFTORequestToManagerFunction, {
  employee: CreateFTOWorkflow.inputs.interactivity.interactor.id,
  manager: formData.outputs.fields.manager,
  start_date: formData.outputs.fields.start_date,
  end_date: formData.outputs.fields.end_date,
  reason: formData.outputs.fields.reason,
});

export default Manifest({
  name: "Take Your Time",
  description: "Ask your manager for some time off",
  icon: "assets/icon.png",
  workflows: [CreateFTOWorkflow],
  outgoingDomains: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
