#!/bin/bash

##############################################################################
# Copyright 2017-2018 IBM Corporation
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
source ../local.env

function usage() {
  echo -e "Usage: $0 [--install,--uninstall,--env]"
}

function install() {
  set -e

  echo -e "Installing actions, triggers, and rules for ibm-cloud-functions-refarch-serverless-apis..."

  echo -e "Make IBM Cloudant connection info available to IBM Cloud Functions"
  bx wsk package refresh

  echo "Creating trigger to fire events when data is inserted"
  bx wsk trigger create image-uploaded \
    --feed "/_/Bluemix_${CLOUDANT_INSTANCE}_Credentials-1/changes" \
    --param dbname "$CLOUDANT_DATABASE"

  echo "Creating the package for the actions"
  bx wsk package create data-processing-cloudant

  echo "Creating action that is manually invoked to write to the database"
  bx wsk action create data-processing-cloudant/write-to-cloudant ../runtimes/nodejs/actions/write-to-cloudant.js \
    --param CLOUDANT_USERNAME "$CLOUDANT_USERNAME" \
    --param CLOUDANT_PASSWORD "$CLOUDANT_PASSWORD" \
    --param CLOUDANT_DATABASE "$CLOUDANT_DATABASE"

  echo "Creating action to respond to database insertions"
  bx wsk action create data-processing-cloudant/write-from-cloudant ../runtimes/nodejs/actions/write-from-cloudant.js

  echo "Creating sequence that ties database read to handling action"
  bx wsk action create data-processing-cloudant/write-from-cloudant-sequence \
    --sequence /_/Bluemix_${CLOUDANT_INSTANCE}_Credentials-1/read,data-processing-cloudant/write-from-cloudant

  echo "Creating rule that maps database change trigger to sequence"
  bx wsk rule create echo-images image-uploaded data-processing-cloudant/write-from-cloudant-sequence

  echo -e "Install Complete"
}

function uninstall() {
  echo -e "Uninstalling..."

  bx wsk rule delete --disable echo-images
	bx wsk trigger delete image-uploaded
  bx wsk action delete data-processing-cloudant/write-to-cloudant
  bx wsk action delete data-processing-cloudant/write-from-cloudant
  bx wsk action delete data-processing-cloudant/write-from-cloudant-sequence
  bx wsk package delete Bluemix_${CLOUDANT_INSTANCE}_Credentials-1
  bx wsk package delete data-processing-cloudant

  echo -e "Uninstall Complete"
}

function showenv() {
  echo -e CLOUDANT_INSTANCE="$CLOUDANT_INSTANCE"
  echo -e CLOUDANT_USERNAME="$CLOUDANT_USERNAME"
  echo -e CLOUDANT_PASSWORD="$CLOUDANT_PASSWORD"
  echo -e CLOUDANT_DATABASE="$CLOUDANT_DATABASE"
}

case "$1" in
"--install" )
install
;;
"--uninstall" )
uninstall
;;
"--env" )
showenv
;;
* )
usage
;;
esac
