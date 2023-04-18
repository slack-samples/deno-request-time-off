# Run-on-Slack Deno Request Time Off Sample

This app contains a sample TypeScript project for use on Slack's
[next-generation platform](https://api.slack.com/future). The project models a
time off request workflow. Users can start the workflow and create the request
by clicking a link trigger that. This request will get routed to their manager,
who receives a direct message from this application with the request details
along with two buttons they can interact with to approve or deny the request.

**Guide Outline**:

- [Supported Workflows](#supported-workflows)
- [Setup](#setup)
  - [Install the Slack CLI](#install-the-slack-cli)
  - [Clone the Sample App](#clone-the-sample-app)
- [Running Your Project Locally](#running-your-project-locally)
- [Create a Link Trigger](#create-a-link-trigger)
- [Deploying Your App](#deploying-your-app)
  - [Viewing Activity Logs](#viewing-activity-logs)
- [Project Structure](#project-structure)
- [Resources](#resources)

---

## Supported Workflows

- **Request time off**: Enter details for a time off request and route it to a
  manager for approval.

## Setup

Before getting started, make sure you have a development workspace where you
have permissions to install apps. If you don’t have one set up, go ahead and
[create one](https://slack.com/create). Also, please note that the workspace
requires any of [the Slack paid plans](https://slack.com/pricing).

### Install the Slack CLI

To use this sample, you first need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/future/quickstart).

### Clone the Sample App

Start by cloning this repository:

```zsh
# Clone this project onto your machine
$ slack create my-time-off-app -t slack-samples/deno-request-time-off

# Change into this project directory
$ cd my-time-off-app
```

## Running Your Project Locally

While building your app, you can see your changes propagated to your workspace
in real-time with `slack run`. In both the CLI and in Slack, you'll know an app
is the development version if the name has the string `(local)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

When you `slack run` or `slack deploy` your project, the CLI will prompt you to
create a new trigger if one does not exist for your app and one is found in the
`/triggers` directory. For more information on triggers, read the next section!

To stop running locally, press `<CTRL> + C` to end the process.

## Create a Link Trigger

[Triggers](https://api.slack.com/future/triggers) are what cause workflows to
run. These triggers can be invoked by a user, or automatically as a response to
an event within Slack.

A [Link Trigger](https://api.slack.com/future/triggers/link) is a type of
trigger that generates a **Shortcut URL** which, when posted in a channel or
added as a bookmark, becomes a link. When clicked, the link trigger will run the
associated Workflow.

Link triggers are _unique to each installed version of your app_. This means
that Shortcut URLs will be different across each workspace, as well as between
[locally run](#running-your-project-locally) and
[deployed apps](#deploying-your-app). When creating a trigger, you must select
the workspace that you'd like to create the trigger in. Each workspace has a
development version (denoted by `(local)`), as well as a deployed version.

To manually create a link trigger for the "Request Time Off" workflow, run the
following command:

```zsh
$ slack trigger create --trigger-def triggers/trigger.ts
```

After selecting a workspace and the local or deployed app instance, the output
provided will include the link trigger shortcut URL. Copy and paste this URL
into a channel as a message, or add it as a bookmark in a channel of the
workspace you selected.

**Note: this link won't run the workflow until the app is either running locally
or deployed!** Read on to learn how to run your app locally and eventually
deploy it to Slack.

## Deploying Your App

Once you're done with developing locally, you can deploy the production version
of your app to Slack using `slack deploy`:

```zsh
$ slack deploy
```

After deploying, if a trigger does not already exist,
[create a new link trigger](#create-a-link-trigger) for the deployed version of
your app (not appended with `(local)`). Once the trigger is invoked, the
workflow should run just as it did in when developing locally.

### Viewing Activity Logs

Activity logs for the deployed instance of your application can be viewed with
the `slack activity` command:

```zsh
$ slack activity
```

## Project Structure

### `manifest.ts`

The [app manifest](https://api.slack.com/future/manifest) contains the app's
configuration. This file defines attributes like app name and description.

### `slack.json`

Used by the CLI to interact with the project's SDK dependencies. It contains
script hooks that are executed by the CLI and implemented by the SDK.

### `/functions`

[Functions](https://api.slack.com/future/functions) are reusable building blocks
of automation that accept inputs, perform calculations, and provide outputs.
Functions can be used independently or as steps in workflows.

### `/workflows`

A [Workflow](https://api.slack.com/future/workflows) is a set of steps that are
executed in order. Each step in a workflow is a function.

Workflows can be configured to run without user input or they can collect input
by beginning with a [form](https://api.slack.com/future/forms) before continuing
to the next step.

### `/triggers`

[Triggers](https://api.slack.com/future/triggers) determine when workflows are
executed. A trigger file describes a scenario in which a workflow should be run,
such as a user pressing a button or when a specific event occurs.

## Resources

To learn more about developing with the CLI, you can visit the following guides:

- [Creating a new app with the CLI](https://api.slack.com/future/create)
- [Configuring your app](https://api.slack.com/future/manifest)
- [Developing locally](https://api.slack.com/future/run)

To view all documentation and guides available, visit the
[Overview page](https://api.slack.com/future/overview).
