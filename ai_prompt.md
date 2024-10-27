# Instrukcje dla AI

Jesteś asystentem pomagającym w tworzeniu aplikacji webowej do czytania powieści. Aplikacja jest inspirowana projektem Mihon, ale skupia się na powieściach zamiast mang. Przy generowaniu kodu, pamiętaj o:

1. Używaniu najnowszych praktyk i bibliotek dla aplikacji webowych (React, Next.js).
2. Implementowaniu architektury opartej na komponentach i hooks.
3. Dodawaniu komentarzy wyjaśniających kluczowe części kodu.
4. Sugerowaniu testów jednostkowych dla generowanych funkcji.
5. Uwzględnianiu responsywności i dostępności w projektowaniu interfejsu.
6. Używaniu Postgres jako bazy danych.

Rozumiem, że chcesz, abym stworzył poradnik dotyczący struktury bazy danych dla tego projektu. Oto krótki przewodnik, który może być przydatny w przyszłości:
Poradnik: Struktura bazy danych dla aplikacji Novel Reader
Tabela: users
Ta tabela przechowuje informacje o użytkownikach aplikacji.
Kolumny:
id: Unikalny identyfikator użytkownika
username: Nazwa użytkownika (unikalna)
email: Adres email użytkownika (unikalny)
password: Zahaszowane hasło użytkownika
created_at: Data i czas utworzenia konta
updated_at: Data i czas ostatniej aktualizacji danych użytkownika
Indeksy są utworzone na kolumnach username i email dla szybszego wyszukiwania.
Tabela: novels
Ta tabela przechowuje informacje o powieściach dostępnych w aplikacji.
Ask
Copy
Apply
Kolumny:
id: Unikalny identyfikator powieści
title: Tytuł powieści
author: Autor powieści
description: Opis powieści
cover_image_url: URL do okładki powieści
created_at: Data i czas dodania powieści do bazy
updated_at: Data i czas ostatniej aktualizacji danych powieści
Tabela: user_reading_progress
Ta tabela śledzi postęp czytania użytkowników dla poszczególnych powieści.
Kolumny:
id: Unikalny identyfikator wpisu o postępie
user_id: ID użytkownika (klucz obcy do tabeli users)
novel_id: ID powieści (klucz obcy do tabeli novels)
current_page: Aktualna strona, na której użytkownik zakończył czytanie
last_read_at: Data i czas ostatniego czytania
Unikalna kombinacja user_id i novel_id zapewnia, że dla każdego użytkownika istnieje tylko jeden wpis postępu dla danej powieści
Pamiętaj, że w przyszłości możesz potrzebować dodatkowych tabel lub kolumn, w zależności od rozwoju funkcjonalności aplikacji. Na przykład, możesz chcieć dodać tabelę dla zakładek, notatek użytkowników, lub kategorii/gatunków powieści.
-- Tabela users (bez zmian)
CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(50) UNIQUE NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela novels (zmodyfikowana)
CREATE TABLE novels (
id SERIAL PRIMARY KEY,
title VARCHAR(255) NOT NULL,
author VARCHAR(100),
description TEXT,
cover_image_url VARCHAR(255),
base_url VARCHAR(255) NOT NULL,
last_chapter_number INTEGER DEFAULT 0,
last_update_check TIMESTAMP,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela chapters (nowa)
CREATE TABLE chapters (
id SERIAL PRIMARY KEY,
novel_id INTEGER REFERENCES novels(id),
chapter_number INTEGER NOT NULL,
title VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE (novel_id, chapter_number)
);

-- Tabela user_reading_progress (bez zmian)
CREATE TABLE user_reading_progress (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
novel_id INTEGER REFERENCES novels(id),
current_page INTEGER,
last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE (user_id, novel_id)
);

-- Tabela update_logs (nowa)
CREATE TABLE update_logs (
id SERIAL PRIMARY KEY,
novel_id INTEGER REFERENCES novels(id),
check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
result VARCHAR(50),
details TEXT
);

-- Indeksy
CREATE INDEX idx_novels_last_update ON novels (last_update_check);
CREATE INDEX idx_chapters_novel ON chapters (novel_id);
CREATE INDEX idx_update_logs_novel ON update_logs (novel_id);
