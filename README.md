# Serverless reference architecture with IBM Cloud Functions (powered by Apache OpenWhisk)

[![Build Status](https://travis-ci.org/IBM/ibm-cloud-functions-refarch-template.svg?branch=master)](https://travis-ci.org/IBM/ibm-cloud-functions-refarch-template)

This reference architecture shows how serverless, event-driven architectures can execute code that scales automatically in response to demand from [...]. No code runs until [...] When that happens, application instances are started to match the load needed by each [...] exactly.

In addition to using cloud resources efficiently, this means that developers can build and deploy applications more quickly. You can learn more about the benefits of building a serverless architecture for this use case in the accompanying [IBM Code Pattern](https://developer.ibm.com/code/technologies/serverless/).

This repository provides a template skeleton for IBM Cloud Functions reference architectures. You can deploy it right away using the [IBM Cloud Functions user interface](#deploy-through-the-ibm-cloud-functions-console-user-interface), or setup and deploy using [command line tools on your own system](#deploy-using-the-wskdeploy-command-line-tool).

If you haven't already, sign up for an IBM Cloud account and go to the [Cloud Functions dashboard](https://console.bluemix.net/openwhisk/) to explore other [reference architecture templates](https://github.com/topics/ibm-cloud-functions-refarch) and download command line tools, if needed.

## Included components

- IBM Cloud Functions (powered by Apache OpenWhisk)
- Service A (Powered by open source project A)
- Service B (Powered by open source project B)

The application demonstrates two IBM Cloud Functions (based on Apache OpenWhisk) that [...]. The use case demonstrates how actions work with data services and execute logic in response to [...] events.

One function, or action, is triggered by [...]. These [...] are piped to another action in a sequence (a way to link actions declaratively in a chain). The second action aggregates the [...] and [...].

![Sample Architecture](img/refarch-placeholder.png)

## Deploy through the IBM Cloud Functions console user interface

Choose "[Start Creating](https://console.bluemix.net/openwhisk/create)" and select "Deploy template" then [This template] from the list. A wizard will then take you through configuration and connection to event sources step-by-step.

Behind the scenes, the UI uses `wskdeploy`, which you can also use directly from the CLI by following the steps in the next section.

## Deploy using the `wskdeploy` command line tool

This approach deploy the Cloud Functions with one command driven by the runtime-specific manifest file available in this repository.

- Download the latest `bx` CLI and Cloud Functions plugins and log into the IBM Cloud.
- Download the latest `wskdeploy` from the [release page](https://github.com/apache/incubator-openwhisk-wskdeploy/releases) of the [openwhisk-wskdeploy](https://github.com/apache/incubator-openwhisk-wskdeploy) project.
- Provision a [Service](https://console.ng.bluemix.net/catalog/services/) instance.
- Copy `template.local.env` to a new file named `local.env` and update the `SERVICE_HOSTNAME`, `SERVICE_USERNAME`, `SERVICE_PASSWORD` and `SERVICE_DATABASE` for your Service instance.

### Deployment

```bash
# Get a local copy of this repository
git clone https://github.com/IBM/ibm-cloud-functions-refarch-template.git
cd ibm-cloud-functions-refarch-template

# Make service credentials available to your environment
source local.env
wsk package refresh

# Deploy the packages, actions, triggers, and rules using your preferred language
cd runtimes/nodejs # Or runtimes/[php|python|swift]
wskdeploy
```

### Undeploy

```bash
# Deploy the packages, actions, triggers, and rules
wskdeploy undeploy
```

## Alternative deployment methods

### Deploy manually with the `bx wsk` command line tool

[This approach shows you how to deploy individual the packages, actions, triggers, and rules with CLI commands](bx-wsk/README.md). It helps you understand and control the underlying deployment artifacts.

### Deploy with IBM Continuous Delivery

[This approach sets up a continuous delivery pipeline that redeploys on changes to a personal clone of this repository](bx-cd/README.md). It may be of interest to setting up an overall software delivery lifecycle around Cloud Functions.

## License

[Apache 2.0](LICENSE)
