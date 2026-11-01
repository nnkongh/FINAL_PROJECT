@description('The name of container app environment')
param containerAppEnvName string

@description('The location to where the container app environment will be deployed')
param location string

@description('The tags that will be applied to the container app environment')
param tags object

@description('The log analytics workspace customer ID that the container app environment will send logs to')
param logAnalyticsName string

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2026-03-01' existing = {
  name: logAnalyticsName
}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2026-07-01' = {
  name: containerAppEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

@description('The container app env name')
output containerAppEnvName string = containerAppEnv.name

@description('The resource id of container workspace')
output containerAppEnvId string = containerAppEnv.id

@description('The default name of container app env')
output defaultDomain string = containerAppEnv.properties.defaultDomain

