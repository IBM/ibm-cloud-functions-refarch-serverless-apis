#!/usr/bin/env python

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

import json
import sys

security_definitions = {
    "app-id": {
        "flow": "application",
        "tokenUrl": "",
        "type": "oauth2",
        "x-provider": {
            "name": "app-id",
            "params": {
                "tenantId": None
            }
        },
        "x-tokenintrospect": {
            "url": None
        }
    }
}

security =  [{
    "$$label": "client_id",
    "app-id": []
}]


def add_appid_auth(tenant_id):
    api_def = json.load(sys.stdin)
    security_definitions['app-id']['x-provider']['params']['tenantId'] = \
        tenant_id
    api_def['securityDefinitions'] =security_definitions
    api_def['security'] = security
    json.dump(api_def, sys.stdout)


def main():
    try:
        add_appid_auth(sys.argv[1])
    except IndexError:
        usage()

def usage():
    print("Usage:\n\t$ python api_def_add_auth.py $TENANT_ID > api_def.json < "
          "no_auth_api_def.json")

if __name__ == "__main__":
    main()
