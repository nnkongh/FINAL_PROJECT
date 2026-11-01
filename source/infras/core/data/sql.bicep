param location string
param tags object
param sqlServerName string
param databaseName string
param adminLogin string

@secure()
param adminPassword string

resource sqlServer 'Microsoft.Sql/servers@2026-08-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  properties: { 
    administratorLogin: adminLogin
    administratorLoginPassword: adminPassword
    minimalTlsVersion: '1.2'
  }
}

resource db 'Microsoft.Sql/servers/databases@2026-08-01-preview' = { 
  parent: sqlServer
  name: databaseName
  location: location
  tags: tags
  properties: { 
    autoPauseDelay: 60
    minCapacity: json('0.5')
  }
  sku: {
    name: 'GP_S_Gen5_1'
    tier: 'GeneralPurpose'
  }
}

resource allowAzure 'Microsoft.Sql/servers/firewallRules@2026-08-01-preview' = { 
  parent: sqlServer
  name: 'AllowAzureService'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}
output fqdn string = sqlServer.properties.fullyQualifiedDomainName
output databaseName string = db.name
