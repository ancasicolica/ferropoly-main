# Changelog Ferropoly Spiel

## v3.5.2 9.6.25
* Bugfix in Marketplace (Variable undefined)

## v3.5.1 21.4.24
* Auth Token Logs aktualisiert

## v3.5.0 20.4.24
* Cloud Logs
* Zurück auf Yarn
* Dependency Updates

## v3.4.2 17.3.24
* Die Darstellung unter /info verbessert, wenn keine Preisliste vorhanden ist

## v3.4.1 23.2.24
* Dependency Updates
* 
## v3.4.0 21.2.24 
* Neue Marker: Preisklassen anstelle Verbindung als Basisfarbe
* Infofenster auf Karte werden geschlossen, wenn ein neues Infofenster geöffnet wird
* GPS in Checkin: Genauigkeit dargestellt, updatebar
* Reihenfolge Bilder ist einstellbar (und wird in Browser gespeichert)

## v3.3.7 21.11.23 Release
* Bugfix: Nur hochgeladene Bilder anzeigen

## v3.3.6 25.10.23 Release
* Bugfix: Zugriffsrechte auf Bilder nach Spiel auch ohne Login

## v3.3.5 22.10.23 Release
* Gambling: Limiten für manuelles Gambling aktuell fix im Bereich 1000-50000, muss im Editor konfigurierbar werden
* Bugfix: Update Gamecache nach löschen Spiel führte nicht zu einer response im HTTP Request
* Bugfix: In Checkin können Bilder nur hochgeladen werden, wenn das GPS des Gerätes aktiviert und zugelassen ist
* Bugfix: Nicht finalisierte Spiele können nicht gespielt werden

## v3.3.4 22.10.23
* Bugfix "Zusammenfassung" wurde teilweise erst zu spät auf dem Startbildschirm angezeigt
* Bugfix vue lists: key fehlte in Bilderliste
* Bugfix Summary: Zeigt Saldo in Chance/Kanzlei an #87

## v3.3.3 19.10.23
* Bugfix in Mitspieler-Management
* Bugfix: Upload Bilder in Check-in nur während dem Spiel möglich

## v3.3.2 18.10.23
* Bugfix: Reception Dialog, #86
* Bugfix: Versand von Emails bei Anmeldung funktioniert wieder
* Beim Spielschluss werden die Daten öffentlich

## v3.3.1 16.10.23
* Bugfixes
* Dependency Updates

## v3.3.0 1.7.23
* Pic Bucket neu: Upload von Bilder während dem Spiel durch Teams
* Dependency Updates
* Sync mit Editor: Hintergrundbilder mit neuer Route, ebenso Header
* Komplette Überarbeitung Autopilot
* Potentielles Problem API behoben: session.passport wurde bei User Prüfung vorausgesetzt, ist jedoch nicht in 
  jedem Fall vorhanden (z.B. bei Exploration API mit 3rd party tools). In seltenen Fällen konnte dies dazu führen,
  dass session.passport nicht definiert war und damit der Zugriff auf den angemeldeten User zu einer unhandled
  Exception führte, was dann wiederum zum Neustart der Software führte. Problem präventiv korrigiert, Tests
  über alle Funktionen notwendig.

## v3.2.0 22.1.23
* Goodbye Facebook: kein Login mit Facebook mehr möglich, der administrative Aufwand wurde zu gross.
* Neuer Login Bildschirm mit Link auf auth.ferropoly.ch

## v3.1.10 16.1.23
* Dependency Updates

## v3.1.9 15.1.23
* Sync mit Editor: Überarbeitung Logins, Link auf auth.ferropoly.ch

## v3.1.7
* Sync mit Editor: Kein weiteres Login mit Dropbox oder Twitter
* Dependency Updates (sehr viele!), diese sind bewusst fix (Vue 3):
```
Package               Current Wanted  Latest Package Type    URL                                                                        
bootstrap             4.6.0   4.6.0   5.2.3  devDependencies https://getbootstrap.com/                                                  
vue                   2.6.14  2.6.14  3.2.45 devDependencies https://github.com/vuejs/core/tree/main/packages/vue#readme                
vue-loader            15.10.1 15.10.1 17.0.1 devDependencies https://github.com/vuejs/vue-loader                                        
vue-router            3.5.3   3.5.3   4.1.6  devDependencies https://github.com/vuejs/router#readme                                     
vue-template-compiler 2.6.14  2.6.14  2.7.14 devDependencies https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#readme
vuex                  3.6.2   3.6.2   4.1.0  devDependencies https://github.com/vuejs/vuex#readme       
```

## v3.1.6 11.7.22
* Bugfix: Hilfe URL in Reception / Preisliste gefixt
* Textliche anpassungen

## v3.1.5 26.6.22
* Bugfix: Problem mit Authentisierung (Auth-Token) behoben bzw. zusätzlich abgesichert #20

## v3.1.4 24.6.22
* Bugfix: GPS Daten werden erst übertragen, wenn der Socket offe ist #17

## v3.1.3 23.6.22
* Bugfix: Bei unbekannter Position in Checkin wird Zentrum der Spielkarte ausgewählt
* Bugfix: GPS Range Kreis in Checkin wird nachgeführt #16
* Bugfix: Farben in Vermögensverlauf entsprechen Team-Farben #19
* Bugfix: GPS Daten wurden nur einmal beim Start des Check-in übertragen #17
* Dependency updates

## v3.1.2 22.6.22
* Microsoft login Bugfix
* Verbesserungen Login/Security (AuthToken)
* Bugfix Reception: Parkplatzgewinn wurde nicht richtig angezeigt (#15)
* Summary: schönere Karte (wie Reception, #18)

## v3.1.1 6.6.22
* Bugfix: Logout in Passport benötigt neu Callback

## v3.1.0 5.6.22
* Erste RC-Version Spiel V3
* In Reisekarte werden die verkauften Orte optisch hervorgehoben
* Summary App überarbeitet (div. Stores angepasst)
* Saldo bei Chance/Kanzlei wird angezeigt
* Check-In: GPS Daten werden explizit nur während Spieldauer übertragen
* Anmeldung verbessert
* Info bei fehlerhaftem Login
* Dependency Updates

## v3.0.1 10.4.2022
Zwischenversion für Deployment-Test
* Neues Titelbild "Paradeplatz"
* Persistente Logs: die letzten verpassten Einträge werden beim Laden der Reception angezeigt
* Komplette Überarbeitung Check-In App (App für Spieler)
  * Live-Ticker verbessert: beim Laden der Seite werden die letzten Meldungen dargestellt
  * Telefonnummer Zentrale ist verfügbar
  * Mietwert (aktuell und bei Vollausbau) wird dargestellt
  * Spielregeln integriert
  * Mehr Details im Kontobuch

## v3.0.0 19.3.2022
Erste Version 3.0:
* Komplettes Redesign Front-End: Umstellung User Interface von Angular.js auf vue.js
  * Spielauswertung Admin:
    * Echtzeitinfo SBB entfernt (Wechsel API, fraglich ob das nochmals kommt)
    * Statistik-Graphen überabeitet mit mehr Informationen
    * Spielregeln direkt aus dem Spiel aufrufen
    * Karte der Landestopgraphie kann verwendet werden
    * Kontobuch mit detaillierten Funktionen und auf mehrere Seiten gesplittet
  * Login mit Microsoft Account
  * Neue Bilder für Login und Startseite
  * Bower entfernt
  
## v2.4.2 19.12.2020
* Webpack Downgrade

## v2.4.1 19.12.2020
* API für Abfragen aus Webseite und Überwachung #41
* Kein Summary Email bei Demo Games
* Dependency Updates

## v.2.4.0 16.4.20
* Email mit Summary wird Mitternacht nach Spiel an alle Teams versendet
* Summary: neu Log mit wesentlichen Ereignissen des Spiels
* Dependency Updates
* Game-Log neu

## v2.3.7 8.10.21
* Bugfix RSS Feed zvv110
* Bugfix wenn Team-Kontakt aus Anmeldung fehlt

## 2.3.6 1.10.21
* Bugfix Rangliste Download

## 2.3.5 8.8.21
* Minify Reception schlug aus irgend einem Grund fehl

## 2.3.4 8.8.21
* Bugfix RSS Feed SBB

## 2.3.3 16.4.20
* Google Plus von Authentisierung entfernt

## v2.3.2 25.7.19
* Weniger Logausgaben
* Bugfix Avatar Darstellung

## v2.3.1 16.6.19
* Update und Bugfixes Datenbankzugriff

## v2.3.0 15.6.19
* Mobile Version für Spieler aktualisiert (keine Features, nur Fixes)
* Dependency Updates
* Verschiedene Bugfixes und Verbesserungen

## v2.2.4 8.9.18
Danke Soraya (Pfadi Wulp) für das ausgiebige Testen, diese Bugs wurden Dank Dir behoben:
* Bugfix: Bei zu langen Spielnamen stürzte das Programm beim Laden der Preisliste ab
* Bugfix: Bei zu langen Teamnamen stürzte das Program beim Laden ab

## v2.2.3 5.8.18
* Bugfix Verkehrsinfo: Filter und Ostwind-Infos #67

## v2.2.2 4.8.18
* Bugfix (Workaround) für Inputfelder mit numerischen Werten (angular.js)

## v2.2.1 22.7.18

* Keine Neuregistrierung über Benutzername/Passwort mehr möglich (alte Logins funktionieren weiterhin), Google- oder Facebook-Account ist für Login notwendig.
* Zahlreiche Libraries auf neusten Stand gebracht
* Preisliste kann auch dargestellt werden, bevor sie finalisiert wurde (für Spieler)
* Darstellung interne Fehler verbessert
* Darstellung Fehlerseiten verbessert
* Kompatibilität mit node.js V8
* Bugfix: Anmeldung funktionierte nicht
* Bugfix: Darstellung "Hausbau möglich" für Spieler
