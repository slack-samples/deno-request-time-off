import {
  DefineDatastore,
  DefineFunction,
  DefineWorkflow,
  Manifest,
  Schema,
} from "deno-slack-sdk/mod.ts";

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

const formData = CreateFTOWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "FTO Request",
    interactivity: CreateFTOWorkflow.inputs.interactivity,
    submit_label: "Submit",
    description: "Make FTO Requests to your manager",
    fields: {
      required: ["manager", "start_date", "end_date"],
      elements: [
        // {
        //   name: "employee",
        //   title: "Employee",
        //   type: Schema.slack.types.user_id,
        // },
        {
          name: "manager",
          title: "Manager",
          type: Schema.slack.types.user_id,
        },
        {
          name: "start_date",
          title: "Start Date",
          type: Schema.slack.types.timestamp,
        },
        {
          name: "end_date",
          title: "End Date",
          type: Schema.slack.types.timestamp,
        },
        {
          name: "reason",
          title: "Reason (optional)",
          type: Schema.types.string,
        },
      ],
    },
  },
);

export const SendManagerFTORequestFunction = DefineFunction({
  callback_id: "send_manager_fto",
  title: "Request FTO",
  description: "Sends your manager an FTO Request to approve or deny",
  source_file: "functions/send_manager_fto_request.ts",
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
        type: Schema.slack.types.timestamp,
        description: "What date the FTO will start",
      },
      end_date: {
        type: Schema.slack.types.timestamp,
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

CreateFTOWorkflow.addStep(SendManagerFTORequestFunction, {
  employee: CreateFTOWorkflow.inputs.interactivity.interactor.id,
  manager: formData.outputs.fields.manager,
  start_date: formData.outputs.fields.start_date,
  end_date: formData.outputs.fields.end_date,
  reason: formData.outputs.fields.reason,
});

const FTORequestsDatastore = DefineDatastore({
  name: "fto_requests",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    employee: {
      type: Schema.slack.types.user_id,
    },
    approved_by: {
      type: Schema.slack.types.user_id,
    },
    start_date: {
      type: Schema.slack.types.timestamp,
    },
    end_date: {
      type: Schema.slack.types.timestamp,
    },
  },
});

export default Manifest({
  name: "approve_deny",
  description: "Send an FTO Request to your manager",
  icon: "assets/icon.png",
  workflows: [CreateFTOWorkflow],
  datastores: [FTORequestsDatastore],
  outgoingDomains: [],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
