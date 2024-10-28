from flask import Flask, jsonify, render_template, request, session, redirect, url_for
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from functools import wraps
import psycopg2
from psycopg2.extras import DictCursor
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Wymagane dla sesji
CORS(app)

# Dane logowania admina
ADMIN_CREDENTIALS = {
    'username': '123',
    'password': '123'
}

# Konfiguracja połączenia z bazą danych
DB_CONFIG = {
    'dbname': 'novel_reader_web',
    'user': 'postgres',
    'password': 'Loloko1234',
    'host': 'localhost'
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def save_novel_data(novel_data, base_url):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # Novel insertion remains the same
            cur.execute("""
                INSERT INTO novels (
                    title, 
                    author, 
                    description, 
                    cover_image_url, 
                    base_url, 
                    last_update_check
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                novel_data['title'],
                novel_data.get('author', 'Unknown'),
                novel_data.get('description', ''),
                novel_data.get('cover_image_url', ''),
                base_url,
                datetime.now()
            ))
            
            novel_id = cur.fetchone()[0]
            
            # Modified chapter insertion to include URL
            for index, chapter in enumerate(novel_data['chapters'], 1):
                try:
                    title_parts = chapter['title'].split()
                    if 'Chapter' in chapter['title']:
                        chapter_number = int(title_parts[-1])
                    else:
                        chapter_number = index
                except (ValueError, IndexError):
                    chapter_number = index
                
                cur.execute("""
                    INSERT INTO chapters (novel_id, chapter_number, title, url)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (novel_id, chapter_number) 
                    DO UPDATE SET url = EXCLUDED.url
                """, (novel_id, chapter_number, chapter['title'], chapter['url']))
            
            # Aktualizuj last_chapter_number w tabeli novels
            cur.execute("""
                UPDATE novels 
                SET last_chapter_number = %s 
                WHERE id = %s
            """, (len(novel_data['chapters']), novel_id))
            
            # Dodaj wpis do update_logs
            cur.execute("""
                INSERT INTO update_logs (novel_id, result, details)
                VALUES (%s, %s, %s)
            """, (novel_id, 'success', f'Added {len(novel_data["chapters"])} chapters'))
            
            conn.commit()
            return novel_id

# Dekorator do sprawdzania autoryzacji
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if (username == ADMIN_CREDENTIALS['username'] and 
            password == ADMIN_CREDENTIALS['password']):
            session['logged_in'] = True
            return redirect(url_for('admin_panel'))
        else:
            return render_template('login.html', error='Invalid credentials')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

@app.route('/admin')
@login_required
def admin_panel():
    return render_template('admin.html')

@app.route('/api/run-scraper', methods=['POST'])
@login_required
def run_scraper():
    try:
        url = request.json.get('url')
        if not url:
            return jsonify({'error': 'URL is required'}), 400
            
        # Zmodyfikowana walidacja URL dla obu domen
        allowed_domains = [
            'https://novelbin.com/',
            'https://novelbin.lanovels.net/'
        ]
        
        if not any(url.startswith(domain) for domain in allowed_domains):
            return jsonify({
                'error': 'Only novelbin.com and novelbin.lanovels.net URLs are allowed'
            }), 400
            
        novel_data = fetch_novel_data(url)
        
        # Zapisz dane do bazy
        novel_id = save_novel_data(novel_data, url)
        
        # Dodaj ID powieści do zwracanych danych
        novel_data['id'] = novel_id
        novel_data['message'] = 'Novel successfully saved to database'
        
        return jsonify(novel_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Usuwamy stałą NOVEL_URL, ponieważ teraz URL będzie przekazywany dynamicznie

def fetch_novel_data(url):
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(url)
        
        # Pobierz tytuł
        title_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'a.novel-title'))
        )
        title = title_element.text
        
        # Pobierz autora
        try:
            author_element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.author'))
            )
            author = author_element.text.replace('Author:', '').strip()
        except:
            author = 'Unknown'
            
        # Pobierz opis
        try:
            description_element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.desc'))
            )
            description = description_element.text.strip()
        except:
            description = ''
            
        # Pobierz URL okładki
        try:
            cover_element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '.novel-cover img'))
            )
            cover_image_url = cover_element.get_attribute('src')
        except:
            cover_image_url = ''
        
        # Kliknij przycisk, aby załadować listę rozdziałów
        button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'button.btn.btn-success.chr-jump'))
        )
        button.click()
        
        # Poczekaj na załadowanie listy rozdziałów
        select_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'select.chr-jump'))
        )
        
        # Pobierz informacje o rozdziałach
        options = select_element.find_elements(By.TAG_NAME, 'option')
        chapters = [{'title': option.text, 'url': option.get_attribute('value')} for option in options]
        
        return {
            'title': title,
            'author': author,
            'description': description,
            'cover_image_url': cover_image_url,
            'chapters': chapters
        }
    finally:
        driver.quit()

# Add this new endpoint to update cover image URL
@app.route('/api/update-cover', methods=['POST'])
@login_required
def update_cover():
    try:
        novel_id = request.json.get('novel_id')
        new_cover_url = request.json.get('cover_url')
        
        if not novel_id or not new_cover_url:
            return jsonify({'error': 'Novel ID and cover URL are required'}), 400
            
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE novels 
                    SET cover_image_url = %s 
                    WHERE id = %s
                    RETURNING title
                """, (new_cover_url, novel_id))
                
                result = cur.fetchone()
                if result:
                    # Add log entry
                    cur.execute("""
                        INSERT INTO update_logs (novel_id, result, details)
                        VALUES (%s, %s, %s)
                    """, (novel_id, 'success', f'Updated cover image URL'))
                    
                    conn.commit()
                    return jsonify({
                        'message': f'Cover image updated successfully for novel: {result[0]}',
                        'novel_id': novel_id,
                        'new_cover_url': new_cover_url
                    })
                else:
                    return jsonify({'error': 'Novel not found'}), 404
                
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add this endpoint to get all novels for the edit form
@app.route('/api/novels', methods=['GET'])
@login_required
def get_novels():
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=DictCursor) as cur:
                cur.execute("""
                    SELECT id, title, cover_image_url 
                    FROM novels 
                    ORDER BY title
                """)
                novels = [dict(row) for row in cur.fetchall()]
                return jsonify(novels)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
