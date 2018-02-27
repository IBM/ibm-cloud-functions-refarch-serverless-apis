[![Build Status](https://travis-ci.org/krook/refarch-template.svg?branch=master)](https://travis-ci.org/krook/refarch-template)

# Reference architecture with IBM Cloud Functions (powered by Apache OpenWhisk)

This project shows how serverless, event-driven architectures can execute code that scales automatically in response to demand from .... No resources are consumed until ... When they are called, resources are provisioned to exactly match the current load needed by each ...

Lorem ipsum.

![Sample Architecture](docs/cloud-functions.png)

## Included components

- IBM Cloud Functions (powered by Apache OpenWhisk)
- Component A (Open source project)
- Component B (Open source project)

## Prerequisite

You should have a basic understanding of the Apache OpenWhisk programming model. If not, [try the action, trigger, and rule demo first](https://github.com/IBM/openwhisk-action-trigger-rule).

Also, you'll need an IBM Cloud account and the latest [OpenWhisk command line tool (`wsk`) installed and on your PATH](https://github.com/IBM/openwhisk-action-trigger-rule/blob/master/docs/OPENWHISK.md).

As an alternative to this end-to-end example, you might also consider the more [basic "building block" version](https://github.com/krook/refarch-template) of this sample.

## Steps

1. [Provision dependency service](#1-dependency-service)
2. [Create Cloud Functions and mappings](#2-create-cloud-functions-and-mappings)
3. [Delete actions and mappings](#3-delete-actions-and-mappings)
4. [Recreate deployment manually](#4-recreate-deployment-manually)

# 1. Provision dependency service

Log into the IBM Cloud and provision a [Service](https://console.ng.bluemix.net/catalog/services/) instance. 

Copy `template.local.env` to a new file named `local.env` and update the `SERVICE_HOSTNAME`, `SERVICE_USERNAME`, `SERVICE_PASSWORD` and `SERVICE_DATABASE` for your MySQL instance.

Or use the built in service credential injection...

# 2. Create Cloud Functions and mappings

`deploy.sh` is a convenience script reads the environment variables from `local.env` and creates the Cloud Functions and API mappings on your behalf. Later you will run these commands yourself.

```bash
./deploy.sh --install
```
> **Note**: If you see any error messages, refer to the [Troubleshooting](#troubleshooting) section below. You can also explore [Alternative deployment methods](#alternative-deployment-methods).


# 4. Delete actions and mappings

Use `deploy.sh` again to tear down the OpenWhisk actions and mappings. You will recreate them step-by-step in the next section.

```bash
./deploy.sh --uninstall
```

# 5. Recreate deployment manually

This section provides a deeper look into what the `deploy.sh` script executes so that you understand how to work with OpenWhisk triggers, actions, rules, and packages in more detail.

## 5.1 Create Cloud Functions to do the thing

Lorem ipsum.

```bash
lorem ipsum
```

## 5.2 Clean up

Lorem ipsum.

```bash
lorem ipsum
```

# Troubleshooting

Check for errors first in the OpenWhisk activation log. Tail the log on the command line with `wsk activation poll` or drill into details visually with the [monitoring console on the IBM Cloud](https://console.ng.bluemix.net/openwhisk/dashboard).

If the error is not immediately obvious, make sure you have the [latest version of the `wsk` CLI installed](https://console.ng.bluemix.net/openwhisk/learn/cli). If it's older than a few weeks, download an update.

```bash
wsk property get --cliversion
```

# Alternative deployment methods

`deploy.sh` will be replaced with [`wskdeploy`](https://github.com/openwhisk/openwhisk-wskdeploy) in the future. `wskdeploy` uses a manifest to deploy declared triggers, actions, and rules to OpenWhisk.

You can also use the following button to clone a copy of this repository and deploy to the IBM Cloud as part of a DevOps toolchain. Supply your OpenWhisk and MySQL credentials under the Delivery Pipeline icon, click Create, then run the Deploy stage for the Delivery Pipeline.

[![Deploy to the IBM Cloud](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/krook/refarch-template.git)

# License

[Apache 2.0](LICENSE)