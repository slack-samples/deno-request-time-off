import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { GetFTORequestsFunction } from "../manifest.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";

const getFtoRequests: SlackFunctionHandler<
  typeof GetFTORequestsFunction.definition
> = async (
  { inputs, token },
) => {
  console.log("Get FTO Requests Function");
  console.log(`user: ${inputs.user}.`);

  const client = SlackAPI(token, {});

  const queryResp = await client.apps.datastore.query({
    datastore: "fto_requests_db",
    expression: "#employee = :user",
    expression_attributes: { "#employee": "employee" },
    expression_values: { ":user": inputs.user },
    limit: 100,
  });
  if (queryResp.ok) {
    // A query is successful even if not items are found.
    console.log(`Success! QUERY results: ${JSON.stringify(queryResp)}`);

    if (queryResp.items.length === 0) { // An empty items array means no records were found.
      return await {
        outputs: { message: `No FTO requests found for <@${inputs.user}>` },
      };
    }
  } else {
    return await {
      error: queryResp.error!,
    };
  }

  let msg = `<@${inputs.user}> has ${queryResp.items.length} fto requests!`;

  // TODO convert timestamps to actual dates
  for (let item = 0; item < queryResp.items.length; item++) {
    console.log(queryResp.items[item]);
    msg += `\n *Id:${queryResp.items[item]["id"]}, 
      Start Date:${queryResp.items[item]["start_date"]}, 
      End Date:${queryResp.items[item]["end_date"]}`;
  }

  return await {
    outputs: {
      message: msg,
    },
  };
};

export default getFtoRequests;
