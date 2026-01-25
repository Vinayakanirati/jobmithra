from adk import tool
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

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
        # options.add_argument("--headless") # Uncomment for headless mode
        
        # Use a persistent Chrome profile
        profile_path = os.path.join(os.getcwd(), "chrome_profile")
        if not os.path.exists(profile_path):
            os.makedirs(profile_path)
        
        options.add_argument(f"user-data-dir={profile_path}")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    driver.get("https://www.linkedin.com/feed/")
    time.sleep(3)

    # Check if already logged in
    if "feed" in driver.current_url:
        return "Already logged in via session persistence."

    driver.get("https://www.linkedin.com/login")
    time.sleep(3)

    try:
        # Clear fields if they have old data
        user_field = driver.find_element(By.ID, "username")
        user_field.clear()
        user_field.send_keys(email)
        
        pass_field = driver.find_element(By.ID, "password")
        pass_field.clear()
        pass_field.send_keys(password)
        
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(5)

        # Check for 2FA/Verification
        if "checkpoint" in driver.current_url:
            return "VERIFICATION_REQUIRED: Please enter the code on your mobile or check your email."
            
        return "Login attempted. Checking for success."
    except Exception as e:
        return f"Login failed: {str(e)}"

def get_driver():
    return driver
