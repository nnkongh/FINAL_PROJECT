using './main.bicep'

param appName = 'EduFlow'
param jwtIssuer = 'eduflow-api'
param jwtAudience = 'eduflow-ui'
param cloudinaryCloudName = 'dkabzs3zb'
param smtpServer = 'smtp.gmail.com'
param smtpPort = 587
param smtpUsername = 'hauhauuu74@gmail.com'
param smtpFromAddress = 'hauhauuu74@gmail.com'
param githubClientId = 'Ov23liD37MUvO26EluRy'
param githubRedirectUri = 'https://eduflow-ui.mangobay-d687d462.southeastasia.azurecontainerapps.io/auth/github/callback'
param sqlServerName = 'eduflow-sql-xxxx'   // đặt tên duy nhất toàn cầu, viết thường
param sqlAdminLogin = 'eduflowadmin'
param sqlAdminPassword = readEnvironmentVariable('SQL_ADMIN_PASSWORD')

param logAnalyticsWorkspaceName = 'law-eduflow-dev'
param containerAppEnvName = 'cae-eduflow-dev'
param containerRegistryName = 'acreduflow13082003'
param sqlDatabaseName = 'eduflow'

param jwtKey = readEnvironmentVariable('JWT_KEY')
param cloudinaryApiKey = readEnvironmentVariable('CLOUDINARY_API_KEY')
param cloudinaryApiSecret = readEnvironmentVariable('CLOUDINARY_API_SECRET')
param smtpPassword = readEnvironmentVariable('SMTP_PASSWORD')
param githubClientSecret = readEnvironmentVariable('GITHUB_CLIENT_SECRET')
param githubKey = readEnvironmentVariable('GITHUB_KEY')
param geminiApiKey = readEnvironmentVariable('GEMINI_API_KEY')
param frontendImage = 'acreduflow13082003.azurecr.io/eduflow-ui:v2'
param backendApiImage = 'acreduflow13082003.azurecr.io/eduflow-api:v5'
