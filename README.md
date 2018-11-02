# Serverless REST API with IBM Cloud Functions (powered by Apache OpenWhisk)

[![Build Status](https://travis.ibm.com/Andrea-Frittoli/ibm-cloud-functions-rest-api.svg?branch=master)](https://travis.ibm.com/Andrea-Frittoli/ibm-cloud-functions-rest-api)

This reference architecture shows how serverless, event-driven architectures can execute code that scales automatically in response to demand from [...]. No code runs until [...] When that happens, application instances are started to match the load needed by each [...] exactly.

In addition to using cloud resources efficiently, this means that developers can build and deploy applications more quickly. You can learn more about the benefits of building a serverless architecture for this use case in the accompanying [IBM Code Pattern](https://developer.ibm.com/code/technologies/serverless/).

This repository provides a template skeleton for IBM Cloud Functions reference architectures. You can deploy it right away using the [IBM Cloud Functions user interface](#deploy-through-the-ibm-cloud-functions-console-user-interface), or setup and deploy using [command line tools on your own system](#deploy-using-the-wskdeploy-command-line-tool).

If you haven't already, sign up for an IBM Cloud account and go to the [Cloud Functions dashboard](https://console.bluemix.net/openwhisk/) to explore other [reference architecture templates](https://github.com/topics/ibm-cloud-functions-refarch) and download command line tools, if needed.

## Included components

- IBM Cloud Functions (powered by Apache OpenWhisk)
- IMB Cloud Functions API Gateway
- IBM Cloudant (powered by CouchDB)
- IBM AppID

The application demonstrates two IBM Cloud Functions (based on Apache OpenWhisk) that [...]. The use case demonstrates how actions work with data services and execute logic in response to [...] events.

One function, or action, is triggered by [...]. These [...] are piped to another action in a sequence (a way to link actions declaratively in a chain). The second action aggregates the [...] and [...].

![Sample Architecture](img/refarch-placeholder.png)

## Deploy using the `deploy.sh` command line tool

This approach deploy the Cloud Functions with one command driven by the runtime-specific manifest file available in this repository.

- Download the latest `ibmcloud` CLI and Cloud Functions plugins
- Download the latest `wskdeploy` from the [release page](https://github.com/apache/incubator-openwhisk-wskdeploy/releases) of the [openwhisk-wskdeploy](https://github.com/apache/incubator-openwhisk-wskdeploy)
project.
- Copy `template.local.env` to a new file named `local.env` and update
environment variables to include credentials to your IBM Cloud account.
- It is possible to use existing service instances for Cloudant DB and AppID.
To do so set =false and configure the CLOUDANT_USERNAME,
CLOUDANT_PASSWORD and API_APPID_TENANTID.
- It is possible to provision Cloudant DB and AppID on the fly automatically
using terraform. To do so please install the terraform client first and set
PROVISION_INFRASTRUCTURE=true in your local.env.


### Deployment

```bash
# Get a local copy of this repository
git clone https://github.ibm.com/Andrea-Frittoli/ibm-cloud-functions-rest-api
cd ibm-cloud-functions-rest-api

# Prepare a local.env
cp template.local.env local.env

# Edit the settings in local.env
vim local.env

# Run the installer
./deploy.sh --install

# Test the service
./deploy.sh --demo
```

### Undeploy

```bash
# Deploy the packages, actions, triggers, and rules
wskdeploy undeploy
```

## License

[Apache 2.0](LICENSE)
