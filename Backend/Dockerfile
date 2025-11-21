# Используем официальный .NET SDK для сборки
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копируем csproj и восстанавливаем зависимости
COPY *.csproj ./
RUN dotnet restore

# Копируем остальной проект и собираем
COPY . ./
RUN dotnet publish -c Release -o /app/publish

# Используем официальный ASP.NET runtime для запуска
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .

# Открываем порт
EXPOSE 5000

# Запуск приложения
ENTRYPOINT ["dotnet", "SmartFixApi.dll"]
