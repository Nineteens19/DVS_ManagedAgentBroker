FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/backend/ManagedAgentBroker.Domain/ManagedAgentBroker.Domain.csproj", "src/backend/ManagedAgentBroker.Domain/"]
COPY ["src/backend/ManagedAgentBroker.Infrastructure/ManagedAgentBroker.Infrastructure.csproj", "src/backend/ManagedAgentBroker.Infrastructure/"]
COPY ["src/backend/ManagedAgentBroker.API/ManagedAgentBroker.API.csproj", "src/backend/ManagedAgentBroker.API/"]

RUN dotnet restore "src/backend/ManagedAgentBroker.API/ManagedAgentBroker.API.csproj"

COPY . .
WORKDIR "/src/src/backend/ManagedAgentBroker.API"
RUN dotnet build "ManagedAgentBroker.API.csproj" -c Release -o /app/build
RUN dotnet publish "ManagedAgentBroker.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ManagedAgentBroker.API.dll"]
