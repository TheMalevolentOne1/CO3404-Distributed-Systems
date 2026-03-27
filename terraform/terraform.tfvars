subscription_id     = "afa9ccfd-d4c9-464f-a67f-1eaebce8feca" # ID
resource_group_name = "rg-joke-assignment"
region              = "UK South"
pub_key             = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCyNMkZlnYP89dyqP2HxFd41GDjwd1D9NgYkgWiDcffkHO1jJd+pTcvTUeuywLJfZBHFs7o2PTT91YpcBGpG6hzNh16hwdUDtP0B+9/bnVmH6R18Inj38GQPTkgRnPzNk8Np0VQ0+1ISUoCR9tMV2kOaluOT3+o/8CEETHRqh++qItiGi5MSN3Q9KGCaMkSlSbL2GOiW53KmvNTtvwQbRCMQUmkwcsq/XnYV4P0KywQvaXpy37su0vWTFFPg21vV1+049oRAwHveas+/ejRtgfpvMxQ/mO+B8I3fpoAnJvNk+rr4IRpUsJvkfhdXu4xIVbNeZSB+opZGygXWc7Cq5433e355cVUmMm69dJVRI/SOWrWfi/PJyiyTMh9fDwFY8ZcHnWlUoSVf5BG4FT69IXJsrclK8BUHwMz6hJR9551Na0FJ2tnHULKssMwAVIYUocFfamcpBOv2ExquI/OBp5Jjgv4p0vC+YUCVJStqUc7mFBr4vZ9hJTgRB+n33r6W4cAUyeeK8UK61M7p4YCdTRLUQMR3EuLv/Ijf351+3w00At6YAK+NpeLxgy1P4fyLHTJIZRLNfd+qwuDy13XEyHANldgW+Ucoh+y4xc44dCEq2SQLoAvlytpBrgZ39q3puhWFmKLh0P3FKqCMxxz4B5sBnIZPjNhe+0m5lN66jln0w== madph@Kyles-Laptop"

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