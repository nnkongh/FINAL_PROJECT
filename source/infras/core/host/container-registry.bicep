@description('The name of container registry')
param containerRegistryName string

@description('The location to where the container registry will be deployed')
param location string

@description('The tags that will be applied to the container registry')
param tags object

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2026-09-01-preview' = {
  name: containerRegistryName
  location: location
  tags: tags
     sku: {
      name: 'Basic'
    }
  properties: {
    adminUserEnabled: false
  }
}

@description('The name of the container registry')
output name string = containerRegistry.name

