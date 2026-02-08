# CO3404 Distributed Systems Joke Application Azure Network terraform

# Azure Provider Configuration
provider "azurerm" 
{
  subscription_id = var.subscription.default
  features {}
}

# Azure Resource Group Configuration
resource "azurerm_resource_group" "main" 
{
  name     = var.resource_group_name
  location = var.region
}

# Azure Virtual Network Configuration
resource "azurerm_virtual_network" "main" 
{
  name                = var.vnet.name
  address_space       = var.vnet.cidr
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name 
}

# Azure Subnet Configuration
resource "azurerm_subnet" "main" 
{
  name                 = var.subnet.name
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = var.subnet.cidr
}

# Azure Public IP Configuration
resource "azurerm_public_ip" "main-pub-ip" 
{
  name                = var.publicIP.name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method = var.publicIP.type
  sku               = var.publicIP.sku
}

# Azure Network Interface Configuration
resource "azurerm_network_interface" "main" 
{
  name                = var.NIC_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = var.ip_config_name
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = var.private_ip_type
    public_ip_address_id = azurerm_public_ip.main-pub-ip.id
  }
}

# Azure NSG Configuration
resource "azurerm_network_security_group" "main" {
  name                = var.nsg_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  security_rule {
    name                       = var.security_rule.name
    priority                   = var.security_rule.priority
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = var.security_rule.inbound_ports
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

# Azure Network Security Group Association Configuration
resource "azurerm_subnet_network_security_group_association" "main" {
  subnet_id                 = azurerm_subnet.main.id
  network_security_group_id = azurerm_network_security_group.main.id
}

# Azure Linux Jokes Micro-Service Configuration
resource "azurerm_linux_virtual_machine" "jokes-app-vm" 
{
  name                = var.vm_spec.name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = var.vm_spec.size
  admin_username      = var.vm_spec.admin-name

  network_interface_ids = [azurerm_network_interface.main.id]

  os_disk 
  {
    name                 = var.disk_spec.name
    caching              = var.disk_spec.caching-type
    storage_account_type = var.disk_spec.storage-type
  }

  source_image_reference 
  {
    publisher = var.OS_image.publisher
    offer     = var.OS_image.offer
    sku       = var.OS_image.sku
    version   = var.OS_image.version
  }

  admin_ssh_key 
  {
    username = var.vm_spec.admin-name
    public_key = var.pub_key
  }
}

# Adding resources for submit-vm
resource "azurerm_linux_virtual_machine" "submit_vm" {
  name                = var.submit_vm.name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = var.vm_spec.size
  admin_username      = var.vm_spec.admin-name

  network_interface_ids = [azurerm_network_interface.submit_vm.id]

  os_disk {
    name                 = var.disk_spec.name
    caching              = var.disk_spec.caching-type
    storage_account_type = var.disk_spec.storage-type
  }

  source_image_reference {
    publisher = var.OS_image.publisher
    offer     = var.OS_image.offer
    sku       = var.OS_image.sku
    version   = var.OS_image.version
  }

  admin_ssh_key {
    username = var.vm_spec.admin-name
    public_key = var.pub_key
  }
}

# Adding resources for jokes-app-vm
resource "azurerm_linux_virtual_machine" "jokes_app_vm" {
  name                = var.jokes_app_vm.name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = var.vm_spec.size
  admin_username      = var.jokes_app_vm.admin_name

  network_interface_ids = [azurerm_network_interface.jokes_app_vm.id]

  os_disk {
    name                 = var.disk_spec.name
    caching              = var.disk_spec.caching-type
    storage_account_type = var.disk_spec.storage-type
  }

  source_image_reference {
    publisher = var.OS_image.publisher
    offer     = var.OS_image.offer
    sku       = var.OS_image.sku
    version   = var.OS_image.version
  }

  admin_ssh_key {
    username = var.vm_spec.admin-name
    public_key = var.pub_key
  }
}

# Adding resources for kong-vm
resource "azurerm_linux_virtual_machine" "kong_vm" {
  name                = var.kong_vm.name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = var.vm_spec.size
  admin_username      = var.kong_vm.admin_name

  network_interface_ids = [azurerm_network_interface.kong_vm.id]

  os_disk {
    name                 = var.disk_spec.name
    caching              = var.disk_spec.caching-type
    storage_account_type = var.disk_spec.storage-type
  }

  source_image_reference {
    publisher = var.OS_image.publisher
    offer     = var.OS_image.offer
    sku       = var.OS_image.sku
    version   = var.OS_image.version
  }

  admin_ssh_key {
    username = var.vm_spec.admin-name
    public_key = var.pub_key
  }
}

# Output the public IPs of the VMs
output "submit_vm_public_ip" {
  value = azurerm_public_ip.submit_vm.ip_address
}

output "jokes_app_vm_public_ip" {
  value = azurerm_public_ip.jokes_app_vm.ip_address
}

output "kong_vm_public_ip" {
  value = azurerm_public_ip.kong_vm.ip_address
}