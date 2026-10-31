# Moje Godziny

Lekka aplikacja webowa typu PWA. Nie wymaga konta ani serwera do zapisywania danych — wpisy pozostają w pamięci przeglądarki na danym urządzeniu.

## Zasady obliczeń

- Norma miesiąca to liczba dni od poniedziałku do piątku, z pominięciem polskich świąt ustawowych, pomnożona przez 8 godzin.
- Każdy taki dzień roboczy ma domyślnie wpisane 8 godzin. Można je zmienić, także na 0 (np. za dzień nieobecności).
- W polu rodzaju dnia można oznaczyć „Urlop” albo „Krew”. Każde oznaczenie zalicza 8 godzin do sumy miesiąca.
- W podsumowaniu urlopu podaj swój roczny wymiar dni. Aplikacja zlicza urlop oznaczony w kalendarzu w danym roku i pokazuje pozostałą liczbę dni.
- Suma godzin obejmuje wszystkie dni miesiąca, także soboty i niedziele.
- Nadgodziny = większa z wartości: 0 albo suma godzin minus norma miesiąca.
- Stawka bazowa za godzinę = miesięczna pensja podstawowa netto podzielona przez normę miesiąca.
- Każda nadgodzina jest wyceniana według stawki bazowej, czyli 100%.
- Szacowana wypłata = pensja podstawowa netto + nadgodziny × stawka bazowa.

## Uruchomienie i instalacja

Można otworzyć `index.html` w przeglądarce na komputerze, aby korzystać z kalendarza. Instalacja jako PWA i pełne buforowanie offline wymagają udostępnienia plików przez HTTPS (lub localhost). Po pierwszym otwarciu aplikacji online można dodać ją do ekranu głównego i używać offline.

- **iPhone:** otwórz adres aplikacji w Safari, wybierz Udostępnij, a potem „Do ekranu początkowego”. iOS nie pokazuje przycisku instalacji w samej aplikacji.
- **Android:** otwórz adres w Chrome i wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.
- **Komputer:** użyj ikony instalacji w pasku adresu przeglądarki, jeśli jest dostępna.

## Dane i prywatność

Pensja i wpisane godziny są przechowywane lokalnie w `localStorage` przeglądarki. Dane nie są wysyłane do serwera. Wyczyszczenie danych witryny lub użycie innej przeglądarki/urządzenia może usunąć albo odseparować zapisane wpisy.
