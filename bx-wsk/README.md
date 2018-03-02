# Deploy step-by-step with the `bx wsk` command line tool

## Prerequisites

You should have a basic understanding of the Apache OpenWhisk programming model. If not, [try the action, trigger, and rule demo first](https://github.com/IBM/openwhisk-action-trigger-rule).

Also, you'll need an IBM Cloud account and the latest [OpenWhisk command line tool (`wsk`) installed and on your PATH](https://github.com/IBM/openwhisk-action-trigger-rule/blob/master/docs/OPENWHISK.md).

As an alternative to this end-to-end example, you might also consider the more [basic "building block" version](https://github.com/IBM/ibm-cloud-functions-refarch-template) of this sample.

## Steps

1. [Provision dependency service](#1-dependency-service)
2. [Create Cloud Functions and mappings](#2-create-cloud-functions-and-mappings)
3. [Delete actions and mappings](#3-delete-actions-and-mappings)
4. [Recreate deployment manually](#4-recreate-deployment-manually)

### 1. Provision dependency service

Log into the IBM Cloud and provision a [Service](https://console.ng.bluemix.net/catalog/services/) instance.

Copy `template.local.env` to a new file named `local.env` and update the `SERVICE_HOSTNAME`, `SERVICE_USERNAME`, `SERVICE_PASSWORD` and `SERVICE_DATABASE` for your MySQL instance.

Or use the built in service credential injection...

### 2. Create Cloud Functions and mappings

`deploy.sh` is a convenience script reads the environment variables from `local.env` and creates the Cloud Functions and API mappings on your behalf. Later you will run these commands yourself.

```bash
./deploy.sh --install
```

> **Note**: If you see any error messages, refer to the [Troubleshooting](#troubleshooting) section below. You can also explore [Alternative deployment methods](#alternative-deployment-methods).


### 3. Delete actions and mappings

Use `deploy.sh` again to tear down the OpenWhisk actions and mappings. You will recreate them step-by-step in the next section.

```bash
./deploy.sh --uninstall
```

### 5. Recreate deployment manually

This section provides a deeper look into what the `deploy.sh` script executes so that you understand how to work with OpenWhisk triggers, actions, rules, and packages in more detail.

#### 5.1 Create Cloud Functions to do the thing

Lorem ipsum.

```bash
lorem ipsum
```

#### 5.2 Clean up

Lorem ipsum.

```bash
lorem ipsum
```

## Troubleshooting

Check for errors first in the OpenWhisk activation log. Tail the log on the command line with `wsk activation poll` or drill into details visually with the [monitoring console on the IBM Cloud](https://console.ng.bluemix.net/openwhisk/dashboard).

If the error is not immediately obvious, make sure you have the [latest version of the `wsk` CLI installed](https://console.ng.bluemix.net/openwhisk/learn/cli). If it's older than a few weeks, download an update.

```bash
wsk property get --cliversion
```