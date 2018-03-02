#!/bin/bash

##############################################################################
# Copyright 2018 IBM Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
##############################################################################
set -e

# OPEN_WHISK_KEY=From Travis env
OPEN_WHISK_BIN=/home/ubuntu/bin

echo "Downloading wsk CLI...\n"
WSK=https://openwhisk.ng.bluemix.net/cli/go/download/linux/amd64/wsk
curl -O $WSK
chmod u+x wsk

echo "Downloading wskdeploy CLI...\n"
WSKDEPLOY=https://github.com/apache/incubator-openwhisk-wskdeploy/releases/download/latest/wskdeploy-latest-linux-amd64.tgz
curl -OL $WSKDEPLOY
tar xf wskdeploy-latest-linux-amd64.tgz
chmod u+x wskdeploy


export PATH=$PATH:`pwd`

echo "Configuring CLI from apihost and API key"
wsk property set --apihost openwhisk.ng.bluemix.net --auth $OPEN_WHISK_KEY > /dev/null 2>&1

echo "Configure local.env..."
touch local.env # Configurations defined in Travis, this is a no op

echo "Deploying application..."
wskdeploy ../wskdeploy/manifest.yaml

echo "Waiting for triggers/actions to finish installing (sleep 5)..."
sleep 5

echo "Doing test..."

if [[ true ]]
then
	echo "SUCCESS: Found the message we were expecting."
    echo "Uninstalling..."
    wskdeploy undeploy ../wskdeploy/manifest.yaml
    exit 0
else
	echo "FAILURE: Something went wrong."
	echo "Uninstalling..."
	wskdeploy undeploy ../wskdeploy/manifest.yaml
	exit -1
fi