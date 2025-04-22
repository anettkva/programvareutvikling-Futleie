# Om prosjektet

Dette prosjektet er utviklet i faget 'Programvareutvikling' ved NTNU. Hovedfokuset i faget har vært på smidige utviklingsprinsipper og arbeid i team. Plattformen er utviklet ut fra både forhåndsbestemte og etterfølgende krav fra en produkteier (studentassistent). Futleie er en plattform for utleie av objekter. Brukere kan opprette annonser for egne utleieobjekter, opprette brukerprofil og sende forespørsler for utleie av objekter. 

# Hvordan kjøre prosjektet

Kjør disse kommandoene i terminalen

```
cd futleie-app
npm i --force
npm run dev
```

# Funksjonalitet

- **Brukerregistrering**
  - Opprette konto med brukernavn, e-post og passord
  - Logg inn/ut med sparing av brukerinfo i cookies
 
- **Profilhåndtering**
  - Se og oppdater brukernavn, e-post og passord
  - Oversikt over egne utleieannonser
 
- **Annonsehåndtering**
  - Opprett ny annonse med tittel, beskrivelse og bilde(r)
  - Endre eller slett eksisterende annonser
  - Galleri- og kortvisning av alle annonser

- **Detaljvisning av annonser**
  - Se bilder i karusell
  - Vis annonsetittel og beskrivelse
  - Eiere: rediger og slett annonse
  - Ikke-eiere: velg leieperiode og send forespørsel

- **Leieforespørsler**
  - Lagrer forespørsler i databasen med tre tilstander: pending, approved og declined
  - Liste over alle innkommende forespørsler, med godkjenn-/avslå-knapper
  - Liste over sendte forespørsler med status
 
- **Grupper**
  - Opprette private grupper
  - Bli med i gruppe med kode
  - Annonser kan publiseres offentlig og/eller kun for en/flere gruppe(r)
 
- **Meldinger**
  - Send og motta meldinger
  - Send melding til eier direkte fra annonse

- **Admin**
  - Admin-brukere kan slette profiler og/eller annonser


