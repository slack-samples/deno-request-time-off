import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SendTimeOffRequestToManagerFunction } from "../functions/send_time_off_request_to_manager/definition.ts";

/**
 * A Workflow composed of two steps: asking for time off details from the user
 * that started the workflow, and then forwarding the details along with two
 * buttons (approve and deny) to the user's manager.
 */
export const CreateTimeOffRequestWorkflow = DefineWorkflow({
  callback_id: "create_time_off",
  title: "Request Time Off",
  description:
    "Create a time off request and send it for approval to your manager",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

// Step 1: opening a form for the user to input their time off details.
const formData = CreateTimeOffRequestWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Time Off Details",
    interactivity: CreateTimeOffRequestWorkflow.inputs.interactivity,
    submit_label: "Submit",
    description: "Enter your time off request details",
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

// Step 2: send time off request details along with approve/deny buttons to manager
CreateTimeOffRequestWorkflow.addStep(SendTimeOffRequestToManagerFunction, {
  interactivity: formData.outputs.interactivity,
  employee: CreateTimeOffRequestWorkflow.inputs.interactivity.interactor.id,
  manager: formData.outputs.fields.manager,
  start_date: formData.outputs.fields.start_date,
  end_date: formData.outputs.fields.end_date,
  reason: formData.outputs.fields.reason,
});
