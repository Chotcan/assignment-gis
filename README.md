# General course assignment

Build a map-based application, which lets the user see geo-based data on a map and filter/search through it in a meaningfull way. Specify the details and build it in your language of choice. The application should have 3 components:

1. Custom-styled background map, ideally built with [mapbox](http://mapbox.com). Hard-core mode: you can also serve the map tiles yourself using [mapnik](http://mapnik.org/) or similar tool.
2. Local server with [PostGIS](http://postgis.net/) and an API layer that exposes data in a [geojson format](http://geojson.org/).
3. The user-facing application (web, android, ios, your choice..) which calls the API and lets the user see and navigate in the map and shows the geodata. You can (and should) use existing components, such as the Mapbox SDK, or [Leaflet](http://leafletjs.com/).


## My project

**Application description**: 

V mojom projekte vytvorim aplikaciu, ktora bude zobrazovat vhodne luky na taborenie. Tato aplikacia je zamyslana pre skautov, ktorym to ulahci hladanie vhodnych miest pre letny tabor. V aplikacii bude mozne aplikovat viacero filtrov na data z Open Street Maps ako napriklad pre najdenie luk ktore su blizko rieky alebo nejakeho miesta/mesta ale trocha vzdialene od civilizacie.

Pripady pouzitia:
- najdenie vhodnej luky na taborenie v urcitom okruhu od nami zadaneho mesta/miesta/viacerych miest (hladanie pri prieniku okruhov) (napr. chcem najst vhodne luky na taborenie pri mestach Stropkov, Sabinov a Presov -> aplikacia bude hladat luky v prieniku okruhov okolo danych miest aby k taborisku mali vsetci priblizne rovnaku vzdialenost)
- najdenie vhodnej luky na taborenie v urcitej vzdialenosti od najblizsieho mesta (civilizacie) (napr. zadam ze chcem najst luku, ktora je vzdialena od civilizacie priblizne 1 km)
- zobrazenie vsetkych vhodnych luk na taborenie na Slovensku
- najdenie vhodnej luky, ktora ma urcite rozmery (m^2)

**Data source**: 

- [Open Street Maps](https://www.openstreetmap.org/)


**Technologies used**: 

- Javascript
- Python
