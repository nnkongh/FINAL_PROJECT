

#Stage 3 - RUNTIME

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

COPY ./publish .

EXPOSE 8080

ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "project.Presentation.dll"]




