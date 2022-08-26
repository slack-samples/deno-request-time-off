# Run-on-Slack Deno Request Time Off Sample

This repo contains a sample TypeScript project for use on Slack's
[next-generation hosted platform][nextgen]. The project models a time off
request workflow: a user starts the workflow and enters details for their time
off request such as start and end dates, their manager, and optionally a reason
for their request. This request will get routed to their manager, who will
receive a direct message from this application with the request details along
with two buttons they can interact with to approve or deny the request.

## Requirements

This application requires that your Slack workspace is enabled for the
next-generation platform. Check out the [future platform homepage][nextgen] for
details on how to get access.

You must also have the new Slack CLI installed. Check out the
[Quickstart][quickstart] for details on how to install the CLI and authenticate
with any of your Slack workspaces with it.

## Installation

### Create Application

Once you have the Slack CLI tool installed, create a new project based on this
template by running:

    slack create my-app -t slack-samples/deno-request-time-off

This will create a new Run-on-Slack deno project and base it off of this
repository. It will also create a random application name, which the CLI will
log out. `cd` into this directory.

### Deploy Application

One of the convenient aspects of our next-generation Run-on-Slack platform is
that you don't have to host your own applications anymore. In order to take
advantage of this capability, you need to deploy your application to a Slack
workspace you previously authenticated with. Do so with the `deploy` command:

    slack deploy

You'll be prompted to choose a Slack workspace to deploy to. If you don't see
the workspace you are looking for, run `slack login` and follow the
instructions.

### Create a Trigger

The app is deployed, but how do we interact with it? For that, we need to create
a [Trigger][triggers] - an entrypoint that users in your Slack workspace can
begin interacting with the application. This can be done with a single command
using the CLI:

    slack triggers create --trigger-def ./trigger.ts

You will need to select the workspace you deployed your application to. Make
sure you select the entry that doesn't have `(dev)` in it! You can deploy
triggers for different _instances_ of your app - which we will cover shortly.

The CLI will output a URL for your new trigger: this is a _link_ trigger. Paste
this into your Slack workspace, bookmark it in your channels, share it with your
friends! Slack will unfurl link triggers and display a button.

Click this button to kick off this application's [Workflow][workflow]!

### Run Application Locally

You can also run the application directly from your development machine. Do so
with the `run` command:

    slack run

We've now deployed a development _instance_ of your application. This is handy
to quickly iterate on changes to your app. Keep `slack run` running in one
terminal window while you make changes to your application code in another
window or editor (no restart of the `slack run` process required).

Since the development instance of your application is separate from the deployed
instance of your application, we also need to create another [Trigger][triggers]
for your application. Run the `triggers create` command, but this time select
the workspace entry that reads `(dev)`:

    slack triggers create --trigger-def ./trigger.ts

Once again, you'll be provided a URL for your link trigger. This is a separate
trigger, and thus different URL and entrypoint to a different _instance_ of your
application. For quick testing, we recommend using the channel bookmarks bar to
save the development and deployed application link triggers as separate
bookmarks.

## Overview

For the best overview of the building blocks of Run-on-Slack applications, make
sure to read through the new [Platform Overview][overview].

### Manifest

The [Manifest][manifest] for your application describes the most important
application information, such as its name, description, icon, the list of
[Workflows][workflow] it provides as well as all of its [Functions][functions]
(among many other things). Make sure to read through the full
[Manifest][manifest] documentation!

In this project, the manifest is stored in the `manifest.ts` file in the root.

### Constructs

> Trigger => Workflow => Function

The core constructs of our next-generation platform are [Triggers][triggers],
[Workflows][workflow], and [Functions][functions]. Functions furthermore break
down into [Built-in Functions][functions] (pre-existing bits of functionality
provided by Slack that are accessible wrappers around popular [Slack APIs][api])
and [Custom Functions][custom-func] (functions that you can author).

#### Triggers

This application contains a single link trigger stored in the `trigger.ts` file
in the root.

#### Workflows

This application contains a single workflow stored under the `workflows/`
folder.

#### Functions

This application's workflow is composed of two functions chained sequentially:

1. The workflow uses the OpenForm [Built-in Function][functions] to collect data
   from the user that triggered the workflow.
2. Form data is then passed to this application's
   [Custom Function][custom-func], called `SendTimeOffRequestToManagerFunction`.
   This function is stored under the `functions/` folder.

[nextgen]: https://api.slack.com/future
[overview]: https://api.slack.com/future/overview
[quickstart]: https://api.slack.com/future/quickstart
[triggers]: https://api.slack.com/future/triggers
[workflow]: https://api.slack.com/future/workflows
[functions]: https://api.slack.com/future/functions
[custom-func]: https://api.slack.com/future/functions/custom
[api]: https://api.slack.com/methods
[manifest]: https://api.slack.com/future/manifest
