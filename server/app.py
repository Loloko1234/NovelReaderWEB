from flask import Flask, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

app = Flask(__name__)
CORS(app)

# Stały URL do pobrania danych (zastąp swoim URL)
NOVEL_URL = "https://novelbin.com/b/my-vampire-system/chapter-1"

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
            'chapters': chapters
        }
    finally:
        driver.quit()

@app.route('/api/novel-chapter')
def get_novel_data():
    try:
        novel_data = fetch_novel_data(NOVEL_URL)
        return jsonify(novel_data)
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
