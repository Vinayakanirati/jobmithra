from adk import tool
import os
import sys
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
    import sys
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
        
        # Custom user agent
        # options.add_argument("user-data-dir=") removed to use default temp profile
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

    # 1. Open linkedin.com first as requested
    driver.get("https://www.linkedin.com")
    time.sleep(3)
    
    # Check if already logged in
    is_logged_in = False
    current_user_email = None
    
    try:
        # Check for 'me' icon which indicates login
        me_icons = driver.find_elements(By.CLASS_NAME, "global-nav__me")
        if me_icons:
            is_logged_in = True
            sys.stderr.write("Detected active session. Verifying account...\n")
            
            # Navigate to settings/account to check email if possible, 
            # or just assume we need to logout if we want to be sure.
            # A safer way is to check the 'me' menu or profile.
            # But LinkedIn doesn't easily show email in the main UI without extra clicks.
            # We'll check the 'me' menu text or just perform a logout if we aren't 100% sure.
            
            # To be safe and meet the "if there exists a login log out and login" request:
            # If we are logged in, we logout to ensure we use the CURRENT credentials.
            sys.stderr.write("Logging out existing session to ensure fresh login with current credentials.\n")
            driver.get("https://www.linkedin.com/logout")
            time.sleep(3)
            is_logged_in = False
    except Exception as e:
        sys.stderr.write(f"Error during initial session check: {str(e)}\n")
        is_logged_in = False

    if is_logged_in:
        # This block might not be reached if we always logout above, 
        # but kept for logic completeness.
        sys.stderr.write("Session active and verified. Skipping login fields.\n")
        return "Login successful (Session reused)."

    # Not logged in, go to login page
    driver.get("https://www.linkedin.com/login")
    time.sleep(3)
    take_screenshot()
    
    try:
        # Wait for fields to be interactable
        wait = WebDriverWait(driver, 15)
        
        # Proactively look for login fields
        username_fields = driver.find_elements(By.ID, "username")
        if not username_fields:
            # Maybe already logged in after redirect?
            if "feed" in driver.current_url:
                return "Login successful (Auto-redirected)."
            return "Login failed: Login fields not found."

        sys.stderr.write("Entering credentials...\n")
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

        # Check for 2FA/Verification and wait if needed
        start_wait_time = time.sleep(0) # Logic start
        max_wait = 120 # 2 minutes for user to enter code
        waited = 0
        
        while waited < max_wait:
            curr_url = driver.current_url
            if "checkpoint" in curr_url or "challenge" in curr_url:
                sys.stderr.write(f"Verification required (checkpoint). Waiting... ({waited}/{max_wait}s)\n")
                take_screenshot()
                time.sleep(5)
                waited += 5
            elif "feed" in curr_url or "mynetwork" in curr_url or "/in/" in curr_url:
                sys.stderr.write("Login successful: Redirected to authenticated page.\n")
                return "Login successful."
            elif "login-submit" in curr_url or "login" in curr_url:
                # Check for error message
                try:
                    error_msg = driver.find_element(By.ID, "error-for-password").text
                    return f"Login failed: {error_msg}"
                except:
                    # Maybe it's still loading or just stayed on login page
                    time.sleep(2)
                    waited += 2
            else:
                # Unknown state, but if not checkpoint/login, might be successful
                sys.stderr.write(f"Transitioned to unknown URL: {curr_url}\n")
                return "Login status uncertain, but no longer on login/checkpoint page."

        if "checkpoint" in driver.current_url:
            return "VERIFICATION_TIMEOUT: User did not complete 2FA in time."
            
        return "Login successful."
    except Exception as e:
        take_screenshot()
        return f"Login technical failure: {str(e)}"

def get_driver():
    return driver

def take_screenshot(driver_to_use=None, label="screenshot"):
    """
    Captures the current browser state and prints it as a base64 string
    for real-time streaming to the frontend.
    """
    global driver
    active_driver = driver_to_use if driver_to_use else driver
    if active_driver:
        try:
            # Optimize: Only take screenshot if page is stable
            base64_image = active_driver.get_screenshot_as_base64()
            # Use sys.stdout to send the data to the Node.js bridge
            import sys
            print(f"SCREENSHOT:{base64_image}")
        except Exception as e:
            import sys
            sys.stderr.write(f"Screenshot error ({label}): {str(e)}\n")
