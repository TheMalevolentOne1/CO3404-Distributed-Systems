variable "subscription_id" 
{
  type        = string
  description = "User subscription ID"
}

variable "resource_group_name" {
  type    = string
  default = "test"
}

variable "region" {
  type    = string
  default = "UK South"
}

variable "vnet" {
  description = "Names the VNet and sets the CIDR block range"
  type = object({
    name = string
    cidr = list(string)
  })
  default = {
    name = "junk_vnet"
    cidr = ["10.0.0.0/16"]
  }
}

variable "subnet" {
  description = "Names the subnet and sets the CIDR block range"
  type = object({
    name = string
    cidr = list(string)
  })
}

# Shared public IP settings used by both VM public IP resources
variable "public_ip" {
  type = object({
    allocation_method = string
    sku               = string
  })
}

variable "ip_config_name" {
  type        = string
  default     = "main"
  description = "Can be anything that makes sense"
}

variable "private_ip_type" {
  type        = string
  default     = "Dynamic"
  description = "Dynamic or static. If static, needs IP address"
}

variable "nsg_name" {
  type        = string
  description = "Network security group name"
}

variable "security_rule" {
  type = object({
    name          = string
    priority      = number
    inbound_ports = list(string)
  })
}

# Jokes VM spec - separate from submit_vm as it requires a larger size (B2s)
variable "jokes_vm" {
  type = object({
    name       = string
    size       = string
    admin_name = string
  })
}

variable "submit_vm" {
  type = object({
    name       = string
    size       = string
    admin_name = string
  })
}

variable "disk_spec" {
  type = object({
    caching_type = string
    storage_type = string
  })
}

variable "os_image" {
  type = object({
    publisher = string
    offer     = string
    sku       = string
    version   = string
  })
}

variable "pub_key" {
  type = string
}
