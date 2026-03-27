subscription_id     = "" # ID
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
jokes_vm = {
  name       = "vm-jokes"
  size       = "Standard_B2s"
  admin_name = "azureuser"
}

submit_vm = {
  name       = "vm-submit"
  size       = "Standard_B1s"
  admin_name = "azureuser"
}

# --- SHARED SETTINGS ---
disk_spec = {
  caching_type = "ReadWrite"
  storage_type = "Standard_LRS"
}

os_image = {
  publisher = "Canonical"
  offer     = "0001-com-ubuntu-server-jammy"
  sku       = "22_04-lts"
  version   = "latest"
}

# Shared public IP settings - Static so IPs survive a VM stop/start
public_ip = {
  allocation_method = "Static"
  sku               = "Standard"
}

nsg_name = "nsg-main-firewall"

security_rule = {
  name     = "allow-service-ports"
  priority = 100
  inbound_ports = [
    "22",    # SSH
    "3000",  # Joke app
    "3001",  # Submit app
    "5672",  # RabbitMQ AMQP - ETL consumer on jokes-vm connects to submit-vm on this port
    "15672", # RabbitMQ management console
    "3306"   # MySQL - Workbench access for demo
  ]
}

pub_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQD0U3uCcCsl4ARiqgeKAltLmc1EZrw9r6teD+yR70lKthGQxHvgJJeKDlsCfFOCk8h9z9BFTRw1XJOfG1aj0pRSGCzDLCyeDELKODYdsJ3HAXBQy4lpvOxwPwhKtsn6ZKRT82I1p8yRx1Uf1AJO6xpBKCaM2FLVuqUwK2uWRDoscJ6cVilDCbpXWD1kfgBojdBHt/wN3Mo3rMQ+G7dPXWMic/XMgAdl3flCHur5/UCrISS9Rzu1auD30vRYkzhLYrOTggkDNc+6jPr/OAexMhKuCleUgVNaGOBgTsURqtcjtfoOL/5WypSsw+HvhJJpHzjB+kjQiChSM2AGUVLhwX6JTNvyH2Ew7guDAmsN/KwqXy3XvFF4qk2F/pFl9v5Z2esjt+GCoh/DalrWqjCVT75a/aF9y7ImzHPkqi8ShS4iWg/rDnOUE4UEG2IH9284jeH4qhmrRwcl1JybiePqv+KJiVjGziEmRJ7Ukx/q7ZBCOtZtLkQO2dL6Fa6H9zNCOy0= generated-by-azure"
