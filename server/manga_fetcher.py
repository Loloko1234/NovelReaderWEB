import requests
from bs4 import BeautifulSoup
from database import get_manga_url
from flask import jsonify, app

def fetch_manga_content(manga_id, chapter_number):
    # Pobierz URL ze swojej bazy danych
    source_url = get_manga_url(manga_id, chapter_number)
    
    # Pobierz treść ze strony źródłowej
    response = requests.get(source_url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Wyodrębnij potrzebne dane
    title = soup.find('h1', class_='chapter-title').text
    images = [img['src'] for img in soup.find_all('img', class_='chapter-image')]
    
    # Zwróć przetworzone dane
    return {
        'title': title,
        'images': images
    }

# Użycie w API
@app.route('/api/manga/<int:manga_id>/chapter/<int:chapter_number>')
def get_chapter(manga_id, chapter_number):
    content = fetch_manga_content(manga_id, chapter_number)
    return jsonify(content)

