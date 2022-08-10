import {
  DefineDatastore,
  DefineFunction,
  DefineWorkflow,
  Manifest,
  Schema,
} from "deno-slack-sdk/mod.ts";

// Workflow 1 - CREATE FTO
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

// Workflow 1 - open form step
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
          title: "Reason (optional)",
          type: Schema.types.string,
        },
      ],
    },
  },
);

// Workflow 1 - custom function definition
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

// Workflow 1 - add custom function as a step of the workflow
CreateFTOWorkflow.addStep(SendManagerFTORequestFunction, {
  employee: CreateFTOWorkflow.inputs.interactivity.interactor.id,
  manager: formData.outputs.fields.manager,
  start_date: formData.outputs.fields.start_date,
  end_date: formData.outputs.fields.end_date,
  reason: formData.outputs.fields.reason,
});

// Workflow 1, 2, 3 - datastore definition
const FTORequestsDatastore = DefineDatastore({
  name: "fto_requests_db",
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
      type: Schema.types.string,
    },
    end_date: {
      type: Schema.types.string,
    },
  },
});

// Workflow 2
export const CheckFTOWorkflow = DefineWorkflow({
  callback_id: "check_fto",
  title: "Check FTO",
  description: "Check all FTO Requests for a user",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["interactivity"],
  },
});

// Workflow 2 - open form step
const CheckFTOformData = CheckFTOWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Check FTO",
    interactivity: CreateFTOWorkflow.inputs.interactivity,
    submit_label: "Submit",
    description: "See all of the FTO requests for a specific user",
    fields: {
      required: ["user"],
      elements: [
        {
          name: "user",
          title: "User",
          type: Schema.slack.types.user_id,
        },
      ],
    },
  },
);

// Workflow 2 - custom function definition
export const GetFTORequestsFunction = DefineFunction({
  callback_id: "get_fto",
  title: "Get FTO Requests",
  description: "Get FTO Requests for a specified user",
  source_file: "functions/get_fto_requests.ts",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
        description: "The user requesting the time off",
      },
    },
    required: ["user"],
  },
  output_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description:
          "The message containing all of the FTO Requests for the specified user",
      },
    },
    required: ["message"],
  },
});

// Workflow 2 - add custom function as a step of the workflow
const checkFto = CheckFTOWorkflow.addStep(GetFTORequestsFunction, {
  user: CheckFTOformData.outputs.fields.user,
});

// Workflow 2 - send DM to person who initiated workflow
CheckFTOWorkflow.addStep(Schema.slack.functions.SendDm, {
  user_id: CheckFTOWorkflow.inputs.interactivity.interactor.id,
  message: checkFto.outputs.message,
});

export default Manifest({
  name: "Take Your Time",
  description: "Ask your manager for some time off",
  icon: "assets/icon.png",
  workflows: [CreateFTOWorkflow, CheckFTOWorkflow],
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
