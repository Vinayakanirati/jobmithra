from adk import tool
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Use a global driver to persist the session
driver = None

@tool
def linkedin_login(email: str, password: str):
    """
    Logs into LinkedIn and keeps the browser session alive for automation
    """
    global driver
    if not driver:
        options = Options()
        
        # Performance/Production optimizations
        if os.name != 'nt': # Linux/Docker
            options.add_argument("--headless")
            options.add_argument("--disable-gpu")
            options.binary_location = os.environ.get("CHROME_BIN", "/usr/bin/chromium")
            service = Service(os.environ.get("CHROMEDRIVER_PATH", "/usr/bin/chromedriver"))
        else:
            service = Service(ChromeDriverManager().install())
        
        # Use a persistent Chrome profile
        if os.name != 'nt':
            profile_path = "/tmp/chrome_profile"
        else:
            profile_path = os.path.join(os.getcwd(), "chrome_profile")
            
        if not os.path.exists(profile_path):
            try:
                os.makedirs(profile_path)
            except: pass
        
        options.add_argument(f"user-data-dir={profile_path}")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--remote-debugging-port=9222")
        
        # Anti-detection flags
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
        
        driver = webdriver.Chrome(service=service, options=options)
        
        # Suppress the "navigator.webdriver" flag
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
          "source": """
            Object.defineProperty(navigator, 'webdriver', {
              get: () => undefined
            })
          """
        })

    driver.get("https://www.linkedin.com/feed/")
    time.sleep(3)
    take_screenshot()

    # Check if already logged in
    if "feed" in driver.current_url:
        return "Already logged in via session persistence."

    driver.get("https://www.linkedin.com/login")
    take_screenshot()
    
    try:
        # Wait for fields to be interactable
        wait = WebDriverWait(driver, 15)
        
        user_field = wait.until(EC.element_to_be_clickable((By.ID, "username")))
        user_field.clear()
        user_field.send_keys(email)
        
        pass_field = wait.until(EC.element_to_be_clickable((By.ID, "password")))
        pass_field.clear()
        pass_field.send_keys(password)
        
        take_screenshot()
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(5)
        take_screenshot()

        # Check for 2FA/Verification
        if "checkpoint" in driver.current_url:
            return "VERIFICATION_REQUIRED: Please enter the code on your mobile or check your email."
            
        if "login-submit" in driver.current_url or "login" in driver.current_url:
            # Check for error message on page
            try:
                error_msg = driver.find_element(By.ID, "error-for-password").text
                return f"Login failed correctly: {error_msg}"
            except:
                return "Login failed: Incorrect credentials or Security Check triggered."
                
        return "Login successful."
    except Exception as e:
        take_screenshot()
        return f"Login technical failure: {str(e)}"

def get_driver():
    return driver

def take_screenshot():
    """
    Captures the current browser state and prints it as a base64 string
    for real-time streaming to the frontend.
    """
    global driver
    if driver:
        try:
            # Optimize: Only take screenshot if page is stable
            base64_image = driver.get_screenshot_as_base64()
            # Use sys.stdout to send the data to the Node.js bridge
            import sys
            print(f"SCREENSHOT:{base64_image}")
        except Exception as e:
            import sys
            sys.stderr.write(f"Screenshot error: {str(e)}\n")
