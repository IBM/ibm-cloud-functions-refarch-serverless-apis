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
PROVISION_INFRASTRUCTURE=${PROVISION_INFRASTRUCTURE:-true}
API_USE_APPID=${API_USE_APPID:-false}

# Define useful folders
root_folder=$(cd $(dirname $0); pwd)
nodejs_folder=${root_folder}/runtimes/nodejs
actions_folder=${nodejs_folder}/actions

function usage() {
  echo -e "Usage: $0 [--install,--uninstall,--env] [extra wskdeploy params]"
}

function install() {
  # Provision infrastructure
  # If disabled, CLOUDANT_USERNAME, CLOUDANT_USERNAME and API_APPID_TENANTID
  # must be provided in local.env
  # Terraform and the terraform IBM Cloud Provider must be installed
  # TF_VAR_ibm_bx_api_key, TF_VAR_ibm_bx_api_key and TF_VAR_ibm_sl_api_key
  # TF_VAR_ibm_cf_org, TF_VAR_ibm_cf_space must be set
  # BM_REGION can be set to select the region. Default is us-south.
  if [[ "$PROVISION_INFRASTRUCTURE" == "true" ]]; then
    export TF_VAR_provision_appid=$([[ "$API_USE_APPID" == "true" ]] && echo 1 || echo 0)
    pushd infra
    terraform init
    terraform apply -auto-approve
    # If terraform was not successful stop here
    if [[ ! $? == 0 ]]; then exit $?; fi
    CLOUDANT_USERNAME=$(terraform output cloudant_credentials | awk '/username/{ print $3 }')
    CLOUDANT_PASSWORD=$(terraform output cloudant_credentials | awk '/password/{ print $3 }')
    if [[ "$API_USE_APPID" == "true" ]]; then
      API_APPID_TENANTID=$(terraform output appid_credentials | awk '/tenantId/{ gsub(/,$/, ""); print $3 }')
    fi
    popd
  fi
  export CLOUDANT_USERNAME CLOUDANT_PASSWORD API_APPID_TENANTID
  shift
  # NOTE: This provisions the Actions/APIs in the region/namespace
  # configured in ~/.wskprops by default. It can be overwritten by passing
  # wskdeploy params to the deploy script
  wskdeploy -p ${nodejs_folder}/ $@
  # If AppID is enabled update the API definition to include the AppID tenant
  if [ "$API_USE_APPID" == "true" ]; then
    echo "Add the AppID tenant $API_APPID_TENANTID to the swagger API definition"
    ibmcloud fn api get todos --format json | \
      python ${root_folder}/appid/api_def_add_auth.py $API_APPID_TENANTID \
      > ${root_folder}/appid/_api_definition.json
    ibmcloud fn api create -c ${root_folder}/appid/_api_definition.json
    rm ${root_folder}/appid/_api_definition.json
  fi
}

function uninstall() {
  if [[ "$PROVISION_INFRASTRUCTURE" == "true" ]]; then
    export TF_VAR_provision_appid=$([[ "$API_USE_APPID" == "true" ]] && echo 1 || echo 0)
    pushd infra
    terraform destroy -auto-approve
    popd
  fi
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
"--demo" )
if [[ "$API_USE_APPID" == "true" ]]; then
  # Define a demo user
  DEMO_EMAIL=user@demo.email
  DEMO_PASSWORD=verysecret
  IBMCLOUD_BEARER_TOKEN=$(ibmcloud iam oauth-tokens | awk '/IAM/{ print $3" "$4 }')
  # Get relevant credentials
  pushd infra > /dev/null
  APPID_TENANTID=$(terraform output appid_credentials | awk '/tenantId/{ gsub(/,$/, ""); print $3 }')
  APPID_CLIENTID=$(terraform output appid_credentials | awk '/clientId/{ gsub(/,$/, ""); print $3 }')
  APPID_OAUTHURL=$(terraform output appid_credentials | awk '/oauthServerUrl/{ gsub(/,$/, ""); print $3 }')
  APPID_MGMTURL=$(terraform output appid_credentials | awk '/managementUrl/{ gsub(/,$/, ""); print $3 }')
  APPID_SECRET=$(terraform output appid_credentials | awk '/secret/{ gsub(/,$/, ""); print $3 }')
  popd > /dev/null
  # Provision a user in the cloud directory
  curl -s -X POST \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    --header "Authorization: $IBMCLOUD_BEARER_TOKEN" \
    -d '{"emails": [
            {"value": "'$DEMO_EMAIL'","primary": true}
          ],
         "userName": "'$DEMO_EMAIL'",
         "password": "'$DEMO_PASSWORD'"
        }' \
    "${APPID_MGMTURL}/cloud_directory/Users" | jq .
  # Get a token for the demo user
  DEMO_BEARER_TOKEN=$(curl -s -X POST -u $APPID_CLIENTID:$APPID_SECRET \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --header 'Accept: application/json' \
    -d 'grant_type=password&username='$DEMO_EMAIL'&password='$DEMO_PASSWORD \
    "${APPID_OAUTHURL}/token" | jq -r .id_token)
  export APPID_TENANTID APPID_CLIENTID APPID_OAUTHURL APPID_SECRET APPID_MGMTURL \
    DEMO_EMAIL DEMO_PASSWORD DEMO_BEARER_TOKEN
  env | egrep '(APPID|DEMO)_'
fi
# Prepare URLs and headers
POST_URL=$(ibmcloud fn api list todos /todo POST -f | awk '/URL/{ print $2 }')
GET_URL=$(ibmcloud fn api list todos /todo POST -f | awk '/URL/{ print $2 }')
if [[ "$API_USE_APPID" == "true" ]]; then
  AUTH_HEADER_1="--header"
  AUTH_HEADER_2="Authorization: Bearer $DEMO_BEARER_TOKEN"
else
  AUTH_HEADER_1=""
  AUTH_HEADER_2=""
fi
# POST a couple of TODOs
echo "Post a TODO"
curl -s -X POST $AUTH_HEADER_1 "$AUTH_HEADER_2" \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  -d '{"title": "Run the demo"}' \
  "$POST_URL" | jq .
echo "Post a TODO"
curl -s -X POST $AUTH_HEADER_1 "$AUTH_HEADER_2" \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  -d '{"title": "Like this pattern"}' \
  "$POST_URL" | jq .
# And fetch them
echo "List all TODOs"
curl -s -X GET $AUTH_HEADER_1 "$AUTH_HEADER_2" \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  "${GET_URL}/" | jq .
# Cleanup
echo "Delete all TODOs"
for todo_url in $(curl -s -X GET $AUTH_HEADER_1 "$AUTH_HEADER_2" \
                    --header 'Content-Type: application/json' \
                    --header 'Accept: application/json' \
                    "${GET_URL}/" | jq -r .[].url); do
  curl -s -X DELETE $AUTH_HEADER_1 "$AUTH_HEADER_2" \
    --header 'Content-Type: application/json' \
    --header 'Accept: application/json' \
    "${todo_url}" | jq .
done
;;
* )
usage
;;
esac
