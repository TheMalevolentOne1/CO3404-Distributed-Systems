subscription        = "5645f4b2-db38-4326-b7a6-98d374ebdd9c" # Your specific ID
resource_group_name = "rg-joke-assignment"
region              = "UK South"

vnet = {
  name = "vnet-joke-network"
  cidr = ["10.0.0.0/16"]
}

subnet = {
  name = "subnet-services"
  cidr = ["10.0.1.0/24"]
}

# --- VM DETAILS ---

kong_vm = {
  name       = "vm-kong"
  size       = "Standard_B1s"
  admin_name = "azureuser"
}

jokes_vm = {
  name       = "vm-jokes"
  size       = "Standard_B2s" # Critical: Needs 2 cores for MySQL + Node
  admin_name = "azureuser"
}

submit_vm = {
  name       = "vm-submit"
  size       = "Standard_B1s"
  admin_name = "azureuser"
}

# --- SHARED SETTINGS ---

disk_spec = {
  name         = "osdisk"
  caching_type = "ReadWrite"
  storage_type = "Standard_LRS"
}

os_image = {
  publisher = "Canonical"
  offer     = "0001-com-ubuntu-server-jammy"
  sku       = "22_04-lts"
  version   = "latest"
}

nsg_name = "nsg-main-firewall"

pub_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQD0U3uCcCsl4ARiqgeKAltLmc1EZrw9r6teD+yR70lKthGQxHvgJJeKDlsCfFOCk8h9z9BFTRw1XJOfG1aj0pRSGCzDLCyeDELKODYdsJ3HAXBQy4lpvOxwPwhKtsn6ZKRT82I1p8yRx1Uf1AJO6xpBKCaM2FLVuqUwK2uWRDoscJ6cVilDCbpXWD1kfgBojdBHt/wN3Mo3rMQ+G7dPXWMic/XMgAdl3flCHur5/UCrISS9Rzu1auD30vRYkzhLYrOTggkDNc+6jPr/OAexMhKuCleUgVNaGOBgTsURqtcjtfoOL/5WypSsw+HvhJJpHzjB+kjQiChSM2AGUVLhwX6JTNvyH2Ew7guDAmsN/KwqXy3XvFF4qk2F/pFl9v5Z2esjt+GCoh/DalrWqjCVT75a/aF9y7ImzHPkqi8ShS4iWg/rDnOUE4UEG2IH9284jeH4qhmrRwcl1JybiePqv+KJiVjGziEmRJ7Ukx/q7ZBCOtZtLkQO2dL6Fa6H9zNCOy0= generated-by-azure"