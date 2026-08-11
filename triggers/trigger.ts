import type { Trigger } from "@slack/sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "@slack/api";

const trigger: Trigger = {
  type: TriggerTypes.Shortcut,
  name: "Request Time Off",
  description: "Ask your manager for some time off",
  workflow: "#/workflows/create_time_off",
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
  },
};

export default trigger;
