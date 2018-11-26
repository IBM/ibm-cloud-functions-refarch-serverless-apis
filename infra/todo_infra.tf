variable ibm_bx_api_key {}
variable ibm_cf_org {}
variable ibm_cf_space {}
variable resource_prefix {
  type    = "string"
  default = "ow_rest_api"
}

variable provision_appid {}
variable appid_plan {
  type    = "string"
  default = "lite"
}
variable cloudant_plan {
  type    = "string"
  default = "Lite"
}

data "ibm_space" "spacedata" {
  space = "${var.ibm_cf_space}"
  org   = "${var.ibm_cf_org}"
}

# AppID is managed by the Resource Controller, however the API GW requires
# a service instance. Using ibm_service_instance provisions an instance of
# AppID and automatically creates an alias to expose it via the CF api.
resource "ibm_service_instance" "appid" {
  name       = "${var.resource_prefix}_appid"
  count      = "${var.provision_appid}"
  space_guid = "${data.ibm_space.spacedata.id}"
  service    = "AppID"
  plan       = "${var.appid_plan}"
}

resource "ibm_service_key" "appid_service_key" {
  name                  = "${var.resource_prefix}_todos_key"
  count                 = "${var.provision_appid}"
  service_instance_guid = "${ibm_service_instance.appid.id}"
}

resource "ibm_service_instance" "cloudant" {
  name       = "${var.resource_prefix}_cloudant"
  space_guid = "${data.ibm_space.spacedata.id}"
  service    = "cloudantNoSQLDB"
  plan       = "${var.cloudant_plan}"
}

resource "ibm_service_key" "cloudant_service_key" {
  name                  = "${var.resource_prefix}_todo_key"
  service_instance_guid = "${ibm_service_instance.cloudant.id}"
}

output "appid_credentials" {
  value = "${ibm_service_key.appid_service_key.*.credentials}"
}

output "cloudant_credentials" {
  value = "${ibm_service_key.cloudant_service_key.credentials}"
}
