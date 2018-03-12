# Serverless reference architecture for IBM Cloudant data processing with IBM Cloud Functions

[![Build Status](https://travis-ci.org/IBM/ibm-cloud-functions-refarch-serverless-apis.svg?branch=master)](https://travis-ci.org/IBM/ibm-cloud-functions-refarch-serverless-apis)

This project shows how serverless, event-driven architectures built with IBM Cloud Functions can execute code that scales automatically in response to demand from HTTP REST API calls. No code runs until API endpoints are called. When that happens, function instances are started to match the current load needed by each HTTP method independently.

In addition to using cloud resources efficiently, this means that developers can build and deploy applications more quickly. You can learn more about the benefits of building a serverless architecture for this use case in the accompanying IBM Code Pattern (TBD).

Deploy this reference architecture:

- Through the [IBM Cloud Functions user interface](#deploy-through-the-ibm-cloud-functions-console-user-interface).
- Or by using [command line tools on your own system](#deploy-using-the-wskdeploy-command-line-tool).

If you haven't already, sign up for an IBM Cloud account and go to the [Cloud Functions dashboard](https://console.bluemix.net/openwhisk/) to explore other [reference architecture templates](https://github.com/topics/ibm-cloud-functions-refarch) and download command line tools, if needed.

## Included components

- IBM Cloud Functions (powered by Apache OpenWhisk)
- IBM API Connect (powered by Loopback)
- ClearDB or Compose database (powered by MySQL)

The application demonstrates four IBM Cloud Functions (powered by Apache OpenWhisk) actions (written in JavaScript) that write and read data in a MySQL database. This demonstrates how actions can work with supporting data services and execute logic in response to HTTP requests.

One function, or action, is mapped to HTTP POST requests. It inserts the supplied cat name and color parameters into the database. A second action is mapped to PUT requests to update those fields for an existing cat. A third action is mapped to GET requests that return specific cat data. A fourth action deletes a given cat data.

The Node.js runtime on the IBM Cloud provides a built-in whitelist of npm modules. This demo also highlights how additional Node.js dependencies – such as the MySQL client – can be packaged in a ZIP file with custom actions to provide a high level of extensibility.

![Sample Architecture](img/refarch-data-processing-cloudant.png)

## Deploy through the IBM Cloud Functions console user interface

Choose "[Start Creating](https://console.bluemix.net/openwhisk/create)" and select "Deploy template" then "Get HTTP Resource" from the list. A wizard will then take you through configuration and connection to event sources step-by-step.

Behind the scenes, the UI uses `wskdeploy`, which you can also use directly from the CLI by following the steps in the next section.

## Deploy using the `wskdeploy` command line tool

This approach will deploy the Cloud Functions actions, triggers, and rules using the runtime-specific manifest file available in this repository.

- Download the latest [`bx` CLI and Cloud Functions plugin](https://console.bluemix.net/openwhisk/learn/cli).
- Download the latest [`wskdeploy` CLI](https://github.com/apache/incubator-openwhisk-wskdeploy/releases).
- Provision a [Cloudant database instance](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db/), and name it `openwhisk-cloudant`. Log into the Cloudant web console and create a database named `cats`. On the "Service credentials" tab make sure to add a new credential named _Credentials-1_.
- Copy `template.local.env` to a new file named `local.env` and update the `CLOUDANT_INSTANCE`, `CLOUDANT_DATABASE`, `CLOUDANT_USERNAME`, and `CLOUDANT_PASSWORD` for your instance if they differ.

### Deploy with `wskdeploy`

```bash
# Clone a local copy of this repository
git clone https://github.com/IBM/ibm-cloud-functions-refarch-serverless-apis.git
cd ibm-cloud-functions-refarch-serverless-apis

# Make service credentials available to your environment
source local.env
bx wsk package refresh

# Deploy the packages, actions, triggers, and rules using your preferred language
cd runtimes/nodejs # Or runtimes/[php|python|swift]
wskdeploy
```

### Undeploy with `wskdeploy`

```bash
# Deploy the packages, actions, triggers, and rules
wskdeploy undeploy
```

## Alternative deployment methods

### Deploy manually with the `bx wsk` command line tool

[This approach shows you how to deploy individual the packages, actions, triggers, and rules with CLI commands](bx-wsk/README.md). It helps you understand and control the underlying deployment artifacts.

### Deploy with IBM Continuous Delivery

[This approach sets up a continuous delivery pipeline that redeploys on changes to a personal clone of this repository](bx-cd/README.md). It may be of interest to setting up an overall software delivery lifecycle around Cloud Functions that redeploys automatically when changes are pushed to a Git repository.

## License

[Apache 2.0](LICENSE)
