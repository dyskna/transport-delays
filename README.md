Railert

Railert to aplikacja, która umożliwia pasażerom zgłaszanie opóźnień i utrudnień w transporcie publicznym oraz przeglądanie aktualnych raportów od innych użytkowników. System automatycznie analizuje podróże i ostrzega o możliwych problemach z przesiadkami, pomagając w planowaniu trasy. Projekt został stworzony przez zespół Drift w ramach hackathonu HackYeah 2025 w ciągu 24 godzin.

Uruchamianie aplikacji
Wymagania wstępne
•	.NET 8 SDK
•	PostgreSQL 17
•	Node.js + npm
•	Edytor np. VS Code

Konfiguracja bazy danych
1.	Utwórz nową bazę danych, np. TransportDelaysDB.
2.	W pliku appsettings.json zmień hasło itd jeśli konieczne:
"Host=localhost;Port=5432;Database=railert_dev;Username=postgres;Password=postgres"

Migracje bazy danych
W folderze server/:
dotnet ef database update

Wykorzystywane biblioteki
Backend:
dotnet add package BCrypt.Net-Next --version 4.0.3
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 8.0.5
dotnet add package Microsoft.AspNetCore.OpenApi --version 8.0.17
dotnet add package Microsoft.EntityFrameworkCore --version 9.0.7
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.7
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.4
dotnet add package Swashbuckle.AspNetCore --version 6.6.2
dotnet add package System.IdentityModel.Tokens.Jwt --version 8.12.1

Frontend:
npm install leaflet react-leaflet
npm install date-fns
npm install react-icons

Uruchomienie aplikacji
Backend:
dotnet run
Swagger: https://localhost:7265/swagger

Frontend:
npm install 
npm start
Aplikacja dostępna pod: https://localhost:3000/

Uruchomienie serwisu w tle
JourneyBackgroundService uruchamia się automatycznie po starcie aplikacji i co 5 minut wykonuje CheckConnectionsAsync(), sprawdzając przesiadki użytkowników i ustawiając flagę HasWarning.

Logowanie poprzez gotowe konta
Oczywiście można założyć konto ale to są 3 konta które posiadają 3 różne funkcje.
Konto 1
Email: user
Hasło: user
Konto 2
Email: moderator
Hasło: moderator
Konto 3
Email: admin
Hasło: admin


Cel aplikacji
Celem Railerta jest umożliwienie pasażerom szybkiego reagowania na opóźnienia oraz wymiany informacji w czasie rzeczywistym.
W przyszłości planowana jest integracja z API PKP Intercity, predykcja opóźnień przy użyciu AI oraz rozszerzenie o aplikację mobilną.

