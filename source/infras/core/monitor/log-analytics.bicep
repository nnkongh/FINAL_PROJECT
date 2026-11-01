@description('The log analytics name')
param logAnalyticsWorkspaceName string

@description('The location')
param location string

@description('The tags')
param tags object

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2026-03-01' = {
  location: location
  tags: tags
  name: logAnalyticsWorkspaceName
  properties: {
    retentionInDays: 30
    features: {
      searchVersion: 1
    }
    sku: {
      name: 'PerGB2018'
    }
  }
}

@description('The name of log analytics workspace')
output name string = logAnalytics.name
