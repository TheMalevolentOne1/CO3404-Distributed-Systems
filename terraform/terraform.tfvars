subscription        = ""
resource_group_name = "rg-joke-app"

vnet = {
  name = "vnet-joke-app"
  cidr = ["10.0.0.0/16"]
}

subnet = {
  name = "subnet-joke-app"
  cidr = ["10.0.2.0/24"]
}

publicIP = {
  name = "pip-joke-app"
  type = "Static"
  sku  = "Standard"
}

NIC_name = "nic-joke-app"

nsg_name = "nsg-joke-app"

security_rule = {
  name          = "All_inbound_ports"
  priority      = 1000
  inbound_ports = ["22", "4000-4001"]
}

vm_spec = {
  name       = "vm-joke-app"
  size       = "Standard_B1s" # WARNING: No longer free tier. Use B2s for database workloads
  admin-name = ""
}

disk_spec = {
  name         = "disk-joke-app"
  caching-type = "ReadWrite"
  storage-type = "Standard_LRS" # WARNING: Being deprecated. Consider Premium_LRS
}

OS_image = {
  publisher = "Canonical"
  offer     = "ubuntu-24_04-lts"
  sku       = "server"
  version   = "latest"
}

pub_key = ""