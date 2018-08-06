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

# Load configuration variables
if [ ! -f local.env ]; then
  echo "Before deploying, copy template.local.env into local.env and fill in environment specific values."
  exit 1
fi
source local.env
export CLOUDANT_USERNAME CLOUDANT_PASSWORD API_BASE_URL

# Define useful folders
root_folder=$(cd $(dirname $0); pwd)
nodejs_folder=${root_folder}/runtimes/nodejs
actions_folder=${nodejs_folder}/actions

function usage() {
  echo -e "Usage: $0 [--install,--uninstall,--env] [extra wskdeploy params]"
}

function install() {
  # Ensure the latest JS shared code is available to all actions
  for action in get post delete patch; do
    rm -rf ${actions_folder}/${action}/common
    cp -r ${actions_folder}/common ${actions_folder}/${action}/
  done
  shift
  wskdeploy -p ${nodejs_folder}/ $@
}

function uninstall() {
  shift
  wskdeploy undeploy -p ${nodejs_folder}/ $@
}

case "$1" in
"--install" )
install
;;
"--uninstall" )
uninstall
;;
"--env" )
env
;;
* )
usage
;;
esac
