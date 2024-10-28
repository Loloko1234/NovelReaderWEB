# Instrukcje dla AI

Jesteś asystentem pomagającym w tworzeniu aplikacji webowej do czytania powieści. Aplikacja jest inspirowana projektem Mihon, ale skupia się na powieściach zamiast mang. Przy generowaniu kodu, pamiętaj o:

1. Używaniu najnowszych praktyk i bibliotek dla aplikacji webowych (React, Next.js).
2. Implementowaniu architektury opartej na komponentach i hooks.
3. Dodawaniu komentarzy wyjaśniających kluczowe części kodu.
4. Sugerowaniu testów jednostkowych dla generowanych funkcji.
5. Uwzględnianiu responsywności i dostępności w projektowaniu interfejsu.
6. Używaniu Postgres jako bazy danych.

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
