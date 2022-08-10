import { Trigger } from "deno-slack-api/types.ts";

const trigger: Trigger = {
  type: "shortcut",
  name: "Take Your Time",
  description: "Ask your manager for some time off",
  workflow: "#/workflows/create_fto",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
  },
};

export default trigger;
