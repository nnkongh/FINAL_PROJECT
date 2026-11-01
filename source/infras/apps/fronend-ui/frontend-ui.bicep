@description('The location where the Frontend UI will be deployed to')
param location string

@description('The tags that will be applied to the Frontend')
param tags object

@description('The container app environment that the container app will be deployed')
param containerAppEnvName string

@description('The container registry that this container app pull images')
param containerRegistryName string

@description('The image name that this container will use')
param imageName string

@description('The backend API FQDN that this Frontend will communicate with')
param backendFqdn string

var containerAppName = 'eduflow-ui'
var acrPullRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions','7f951dda-4ed3-4680-a7ca-43fe172d538d')

resource appIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2025-05-31-preview' = {
  location: location
  name: 'id-${containerAppName}'
}

resource env 'Microsoft.App/managedEnvironments@2026-07-01' existing = {
  name: containerAppEnvName
}

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2026-09-01-preview' existing = {
  name: containerRegistryName
}


resource frontend 'Microsoft.App/containerApps@2026-07-01' = {
  name: containerAppName
  location: location
  tags: tags
  dependsOn: [acrPullRole]
  properties: {
    managedEnvironmentId: env.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          identity: appIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: imageName
          env: [
            {
              name: 'BackendApi'
              value: 'https://${backendFqdn}'
            }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1.0Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 1
      }
    }
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${appIdentity.id}': {}
    }
  }
}
resource acrPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id, appIdentity.id,acrPullRoleId)
  scope: containerRegistry
  properties: {
    principalId: appIdentity.properties.principalId
    roleDefinitionId: acrPullRoleId
    principalType: 'ServicePrincipal'
  }
}

@description('The FQDN for the frontend')
output fqdn string = frontend.properties.configuration.ingress.fqdn
