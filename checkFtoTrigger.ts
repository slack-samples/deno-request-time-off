import { Trigger } from "deno-slack-api/types.ts";

const trigger: Trigger = {
  type: "shortcut",
  name: "Check FTO",
  description:
    "Starts the workflow to check a specified users time off requests",
  workflow: "#/workflows/check_fto",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
  },
};

export default trigger;
