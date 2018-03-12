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

# Write the Cloud Functions specific values to .wskprops
echo "APIHOST=$APIHOST" > "$HOME/.wskprops"
echo "NAMESPACE=$NAMESPACE" >> "$HOME/.wskprops"
echo "APIVERSION=$APIVERSION" >> "$HOME/.wskprops"
echo "AUTH=$AUTH" >> "$HOME/.wskprops"
echo "APIGW_ACCESS_TOKEN=$APIGW_ACCESS_TOKEN" >> "$HOME/.wskprops"

# Download IBM Cloud CLI and Cloud Functions plugin (already in the build container)
curl -fsSL https://clis.ng.bluemix.net/install/linux | sh
bx plugin install Cloud-Functions -r Bluemix -f

# Download the wskdeploy CLI
curl -OL https://github.com/apache/incubator-openwhisk-wskdeploy/releases/download/latest/wskdeploy-latest-linux-amd64.tgz
tar xf wskdeploy-latest-linux-amd64.tgz
chmod 755 wskdeploy

# Make service credentials available to your environment
bx wsk package refresh

# Deploy the packages, actions, triggers, and rules starting from a clean slate
mv wskdeploy runtimes/nodejs/
cd runtimes/nodejs # Or runtimes/[php|python|swift]
./wskdeploy
sleep 5
./wskdeploy undeploy
