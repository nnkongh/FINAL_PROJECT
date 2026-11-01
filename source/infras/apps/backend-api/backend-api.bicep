@description('The name of the Container App Environment that will be deployed')
param containerAppEnvName string

@description('The location that the Container App Environment will be deployed')
param location string

@description('The tags that will be applied to the Container App Environment')
param tags object

@description('The name of the Container Registry that this Container App pull images')
param containerRegistryName string

@description('The container image that this container will use')
param imageName string

@secure()
param defaultConnectionString string

@secure()
param jwtKey string
param jwtAudience string
param jwtIssuer string

@secure()
param cloudinaryApiSecret string
@secure()
param cloudinaryApiKey string
param cloudinaryCloudName string


@secure()
param smtpPassword string 

@secure()
param redisConnectionString string

@secure()
param githubClientSecret string
@secure()
param githubKey string
param githubRedirectUri string 
param githubClientId string

@secure()
param geminiApiKey string

param frontendUrl string
param corsOrigins string
param appName string

param smtpFromAddress string 
param smtpUsername string
param smtpServer string 
param smtpPort int = 587



var containerAppName = 'eduflow-api'
var arcPullRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions','7f951dda-4ed3-4680-a7ca-43fe172d538d')

resource appIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-${containerAppName}'
  tags: tags
  location: location
}

resource env 'Microsoft.App/managedEnvironments@2026-07-01' existing = {
  name: containerAppEnvName
}

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2026-09-01-preview' existing = {
  name: containerRegistryName
}

resource backendApi 'Microsoft.App/containerApps@2026-07-01' = {
  name: containerAppName
  location: location
  tags: tags
  dependsOn: [ArcPullRole]
  properties: {
    managedEnvironmentId: env.id
    configuration: {
      secrets: [
    {
      name: 'redis-connection-string'
      value: redisConnectionString
    }
    {
      name: 'default-connection-string'
      value: defaultConnectionString
    }
    {
      name: 'jwt-key'
      value: jwtKey
    }
    {
      name: 'cloudinary-api-secret'
      value: cloudinaryApiSecret
    }
    {
      name: 'cloudinary-api-key'
      value: cloudinaryApiKey
    }
    {
      name: 'smtp-password'
      value: smtpPassword
    }
    {
      name: 'github-client-secret'
      value: githubClientSecret
    }
    {
      name: 'github-key'
      value: githubKey
    }
    {
      name: 'gemini-api-key'
      value: geminiApiKey
    } 
  ]
      activeRevisionsMode: 'Single'
      ingress: {
        external: false
        targetPort: 8080
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
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }

        // Database
        {
          name: 'ConnectionStrings__DefaultConnection'
          secretRef: 'default-connection-string'
        }

        // JWT
        {
          name: 'Jwt__Issuer'
          value: jwtIssuer
        }
        {
          name: 'Jwt__Audience'
          value: jwtAudience
        }
        {
          name: 'Jwt__Key'
          secretRef: 'jwt-key'
        }

        // Cloudinary
        {
          name: 'Cloudinary__CloudName'
          value: cloudinaryCloudName
        }
        {
          name: 'Cloudinary__ApiKey'
          secretRef: 'cloudinary-api-key'
        }
        {
          name: 'Cloudinary__ApiSecret'
          secretRef: 'cloudinary-api-secret'
        }
        {
          name: 'ConnectionString__Redis'
          secretRef: 'redis-connection-string'
        }

        // Email
        {
          name: 'EmailSettings__SmtpServer'
          value: smtpServer
        }
        {
          name: 'EmailSettings__SmtpPort'
          value: string(smtpPort)
        }
        {
          name: 'EmailSettings__Username'
          value: smtpUsername
        }
        {
          name: 'EmailSettings__Password'
          secretRef: 'smtp-password'
        }
        {
          name: 'EmailSettings__FromAddress'
          value: smtpFromAddress
        }
        // GitHub OAuth / integration
        {
          name: 'Github__GithubClientId'
          value: githubClientId
        }
        {
          name: 'Github__GithubClientSecret'
          secretRef: 'github-client-secret'
        }
        {
          name: 'Github__RedirectUri'
          value: githubRedirectUri
        }
        {
          name: 'Github__Key'
          secretRef: 'github-key'
        }

        // Gemini
        {
          name: 'Gemini__ApiKey'
          secretRef: 'gemini-api-key'
        }
        {
          name: 'Gemini__Url'
          value: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
        }

        // Application
        {
          name: 'App__FrontendUrl'
          value: frontendUrl
        }
        {
          name: 'App__Name'
          value: appName
        }
        {
          name: 'Cors__Origins'
          value: corsOrigins
        }
        {
          name: 'ASPNETCORE_HTTPS_PORTS'
          value: '8080'
        }
        {
          name: 'ASPNETCORE_FORWARDEDHEADERS_ENABLED'
          value: 'true'
        }
      ]     
            resources: {
              cpu: json('0.5')
              memory: '1.0Gi'
            }
          }
        ]
        scale: {
          minReplicas: 1
          maxReplicas: 1
        }
      }
  }
  identity:{
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${appIdentity.id}' : {}
    }
  }
}

resource ArcPullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(containerRegistry.id,appIdentity.id, arcPullRoleId)
  scope: containerRegistry
  properties: {
    principalId: appIdentity.properties.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: arcPullRoleId
  }
}

@description('The FQDN for the backend API')
output fqdn string = backendApi.properties.configuration.ingress.fqdn


