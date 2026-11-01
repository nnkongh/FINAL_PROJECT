
param location string
param tags object
param containerAppEnvName string

resource env 'Microsoft.App/managedEnvironments@2026-07-01' existing = {
  name: containerAppEnvName
}

resource redis 'Microsoft.App/containerApps@2026-07-01' = {
  name: 'eduflow-redis'
  location: location
  tags: tags
  properties: { 
    managedEnvironmentId: env.id
    configuration: { 
      ingress: {
        external: false
        transport: 'tcp'
        targetPort: 6379
        exposedPort: 6379
      }
    }
    template: { 
      containers: [
        {
          name: 'redis'
          image: 'docker.io/library/redis:7-alpine'
          resources: { 
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: { 
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
}

output connectionString string = '${redis.name}:6379'
