@description('The location to deploy all my resources')
param location string = resourceGroup().location

@description('The name of the log analytics workspace')
param logAnalyticsWorkspaceName string

// App
param appName string = 'EduFlow'

@description('The container image used by the Frontend')
param frontendImage string

// Database
param sqlServerName string 
param sqlDatabaseName string 
param sqlAdminLogin string 
@secure()
param sqlAdminPassword string

// JWT
@secure()
param jwtKey string
param jwtIssuer string
param jwtAudience string

// Cloudinary
param cloudinaryCloudName string
@secure()
param cloudinaryApiKey string
@secure()
param cloudinaryApiSecret string

// SMTP
param smtpServer string
param smtpPort int = 587
param smtpUsername string
param smtpFromAddress string
@secure()
param smtpPassword string

// GitHub OAuth
param githubClientId string
param githubRedirectUri string
@secure()
param githubClientSecret string
@secure()
param githubKey string 

// Gemini
@secure()
param geminiApiKey string

@description('The name of the Container App Environment')
param containerAppEnvName string

@description('The name of the Container Registry')
param containerRegistryName string

@description('The container image used by the Backend API')
param backendApiImage string

param deployApp bool = true

var tags = {
  environment: 'dev'
  owner: 'Hau cong'
  application: 'edu-flow'
}

module logAnalytics 'infras/core/monitor/log-analytics.bicep' = {
  name: 'law'
  params: {
    location: location
    logAnalyticsWorkspaceName: logAnalyticsWorkspaceName
    tags: tags
  }
}

module containerRegistry 'infras/core/host/container-registry.bicep' = {
  name: 'acr'
  params: {
    location: location
    containerRegistryName: containerRegistryName
    tags: tags
  }
}

module env 'infras/core/host/container-app-env.bicep' = {
  name: 'env'
  params: {
    location: location
    containerAppEnvName: containerAppEnvName
    logAnalyticsName: logAnalytics.outputs.name
    tags: tags
  }
}

var frontendUrl = 'https://eduflow-ui.${env.outputs.defaultDomain}'

module frontendUi 'infras/apps/fronend-ui/frontend-ui.bicep' = if (deployApp) {
  name: 'frontend'
  params: {
    location: location
    containerAppEnvName: env.outputs.containerAppEnvName
    containerRegistryName: containerRegistry.outputs.name
    imageName: frontendImage
    backendFqdn: backendApi!.outputs.fqdn
    tags: tags
  }
}

module sql 'infras/core/data/sql.bicep' = {
  name: 'sql'
  params: { 
    location: location
    tags: tags
    sqlServerName: sqlServerName
    databaseName: sqlDatabaseName
    adminLogin: sqlAdminLogin
    adminPassword: sqlAdminPassword
  }
}

module redis 'infras/apps/redis/redis.bicep' = { 
  name: 'redis'
  params: { 
    location: location
    tags: tags
    containerAppEnvName: env.outputs.containerAppEnvName
  }
}

var sqlConnectionString = 'Server=tcp:${sql.outputs.fqdn},1433;Initial Catalog=${sql.outputs.databaseName};User ID=${sqlAdminLogin};Password=${sqlAdminPassword};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

module backendApi 'infras/apps/backend-api/backend-api.bicep' = if (deployApp)  {
  name: 'backendApi'
  params: {
    location: location
    containerAppEnvName: env.outputs.containerAppEnvName
    containerRegistryName: containerRegistry.outputs.name
    imageName: backendApiImage
    tags: tags

    appName: appName
    frontendUrl: frontendUrl
    corsOrigins: frontendUrl

    defaultConnectionString: sqlConnectionString
    redisConnectionString: redis.outputs.connectionString

    jwtKey: jwtKey
    jwtIssuer: jwtIssuer
    jwtAudience: jwtAudience

    cloudinaryCloudName: cloudinaryCloudName
    cloudinaryApiKey: cloudinaryApiKey
    cloudinaryApiSecret: cloudinaryApiSecret

    smtpServer: smtpServer
    smtpPort: smtpPort
    smtpUsername: smtpUsername
    smtpFromAddress: smtpFromAddress
    smtpPassword: smtpPassword

    githubClientId: githubClientId
    githubRedirectUri: githubRedirectUri
    githubClientSecret: githubClientSecret
    githubKey: githubKey

    geminiApiKey: geminiApiKey
  }
}
output frontend string = frontendUrl
