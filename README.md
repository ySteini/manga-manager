**Cold Mode aktiviert.**

Hier ist eine vollständige README für dein Manga Manager Projekt:

---

# Manga Manager

Ein Webprojekt zur Verwaltung von Manga-Dateien mit Upload, Bearbeitung, Sammlungen und PDF-Vorschau.

## Features

* Benutzer-Authentifizierung (Session-basiert)
* Manga hinzufügen, bearbeiten, löschen
* PDF-Upload mit automatischer Vorschau (Canvas-basiert)
* Sammlungen (Collections) zur Gruppierung von Manga
* Übersichtliche Benutzeroberfläche mit Sidebar-Navigation
* Responsive Layout mit TailwindCSS
* Datei-Hosting der Uploads

## Technologien

* Remix Run (React & Node.js Framework)
* Prisma ORM mit SQLite
* TailwindCSS für Styling
* PDF.js für PDF-Vorschau im Browser
* Node.js & npm

## Installation

1. Repository klonen
   `git clone <repository-url>`

2. Abhängigkeiten installieren
   `npm install`

3. Datenbank initialisieren und Prisma-Migration durchführen
   `npx prisma migrate dev --name init`

4. Entwicklungsserver starten
   `npm run dev`

5. App im Browser öffnen:
   `http://localhost:5173`

## Projektstruktur

* `/app/routes` – Remix-Routen (Pages)
* `/app/components` – React-Komponenten (z.B. PdfPreview)
* `/prisma/schema.prisma` – Datenbankschema
* `/public/uploads` – hochgeladene Manga-Dateien

## Datenbankschema (Kurzfassung)

* `User` – Benutzer mit Username, Passwort und Rolle
* `Manga` – Manga mit Titel, Autor, Beschreibung, Datei, Genre und Sammlungen
* `Collection` – Sammlungen von Manga
* `MangaCollection` – Join-Tabelle für Manga und Collections (n\:m Beziehung)

## Nutzung

* Über die Sidebar kannst du Manga hinzufügen, bestehende Manga bearbeiten und Collections verwalten.
* PDFs werden beim Upload gespeichert und mit einer Vorschau angezeigt.
* Collections können Manga gruppieren und verwalten.

## Wichtige Hinweise

* Aktuell werden PDF-Vorschauen clientseitig mit PDF.js gerendert.
