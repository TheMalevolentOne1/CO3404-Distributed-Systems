# CO3404 Distributed Systems Joke Application Azure Network terraform

# Azure Provider Configuration
provider "azurerm" 
{
  subscription_id = var.subscription_id
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

# Azure Public IP Configuration - Jokes VM
resource "azurerm_public_ip" "jokes_vm" 
{
  name                = "${var.jokes_vm.name}-pub-ip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = var.public_ip.allocation_method
  sku                 = var.public_ip.sku
}

# Azure Public IP Configuration - Submit VM
resource "azurerm_public_ip" "submit_vm" 
{
  name                = "${var.submit_vm.name}-pub-ip"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = var.public_ip.allocation_method
  sku                 = var.public_ip.sku
}

# Azure Network Interface Configuration - Jokes VM
resource "azurerm_network_interface" "jokes_vm" 
{
  name                = "${var.jokes_vm.name}-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = var.ip_config_name
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = var.private_ip_type
    public_ip_address_id          = azurerm_public_ip.jokes_vm.id
  }
}

# Azure Network Interface Configuration - Submit VM
resource "azurerm_network_interface" "submit_vm" 
{
  name                = "${var.submit_vm.name}-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = var.ip_config_name
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = var.private_ip_type
    public_ip_address_id          = azurerm_public_ip.submit_vm.id
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
# Runs joke app + database (MySQL/MongoDB) + ETL - requires B2s, B1s has insufficient CPU for three containers
resource "azurerm_linux_virtual_machine" "jokes_vm" 
{
  name                = var.jokes_vm.name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = var.jokes_vm.size
  admin_username      = var.jokes_vm.admin_name

  network_interface_ids = [azurerm_network_interface.jokes_vm.id]

  os_disk 
  {
    # Each VM gets a unique disk name to avoid naming conflicts in the resource group
    name                 = "${var.jokes_vm.name}-osdisk"
    caching              = var.disk_spec.caching_type
    storage_account_type = var.disk_spec.storage_type
  }

  source_image_reference 
  {
    publisher = var.os_image.publisher
    offer     = var.os_image.offer
    sku       = var.os_image.sku
    version   = var.os_image.version
  }

  admin_ssh_key 
  {
    username   = var.jokes_vm.admin_name
    public_key = var.pub_key
  }
}

# Azure Linux Submit Micro-Service Configuration
# Runs submit app + RabbitMQ - B1s is sufficient for two containers
resource "azurerm_linux_virtual_machine" "submit_vm" {
  name                = var.submit_vm.name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = var.submit_vm.size
  admin_username      = var.submit_vm.admin_name

  network_interface_ids = [azurerm_network_interface.submit_vm.id]

  os_disk {
    name                 = "${var.submit_vm.name}-osdisk"
    caching              = var.disk_spec.caching_type
    storage_account_type = var.disk_spec.storage_type
  }

  source_image_reference {
    publisher = var.os_image.publisher
    offer     = var.os_image.offer
    sku       = var.os_image.sku
    version   = var.os_image.version
  }

  admin_ssh_key {
    username   = var.submit_vm.admin_name
    public_key = var.pub_key
  }
}

# Output the public IPs of the VMs
output "jokes_vm_public_ip" {
  value = azurerm_public_ip.jokes_vm.ip_address
}

output "submit_vm_public_ip" {
  value = azurerm_public_ip.submit_vm.ip_address
}

# Output private IPs - use these in .env files for inter-VM calls across the Azure private network
output "jokes_vm_private_ip" {
  value = azurerm_network_interface.jokes_vm.private_ip_address
}

output "submit_vm_private_ip" {
  value = azurerm_network_interface.submit_vm.private_ip_address
}
