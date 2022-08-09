import { Trigger } from "deno-slack-api/types.ts";

const trigger: Trigger = {
  type: "shortcut",
  name: "Request Time off",
  description: "Starts the workflow to request time off",
  workflow: "#/workflows/create_fto",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
  },
};

export default trigger;
