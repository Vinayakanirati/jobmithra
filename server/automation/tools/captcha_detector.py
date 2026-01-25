import sys
from adk import tool
from selenium.webdriver.common.by import By

@tool
def detect_captcha(driver) -> str:
    """
    Detects if a real, visible CAPTCHA or security challenge is blocking automation.
    """
    try:
        # 1. Check for obvious captcha iframes (must be visible)
        iframes = driver.find_elements(By.XPATH, "//iframe[contains(@src,'captcha')]")
        for iframe in iframes:
            if iframe.is_displayed():
                sys.stderr.write("CAPTCHA Diagnostic: Visible iframe with 'captcha' in src found.\n")
                return "CAPTCHA_DETECTED"
        
        # 2. Check for security challenge tokens in URL AND specific visible captcha containers
        if "challenge" in driver.current_url:
            # Check if there is a visible challenge container
            check_paths = [
                "//div[contains(@id, 'captcha')]",
                "//div[contains(@class, 'captcha')]",
                "//div[contains(@class, 'challenge-container')]",
                "//iframe[contains(@title, 'captcha')]"
            ]
            for path in check_paths:
                elements = driver.find_elements(By.XPATH, path)
                for el in elements:
                    if el.is_displayed():
                        sys.stderr.write(f"CAPTCHA Diagnostic: Visible challenge element found: {path}\n")
                        return "CAPTCHA_DETECTED"
            
        # 3. Specific LinkedIn internal captcha ID (must be visible)
        internal_captchas = driver.find_elements(By.ID, "captcha-internal")
        for c in internal_captchas:
            if c.is_displayed():
                sys.stderr.write("CAPTCHA Diagnostic: Visible 'captcha-internal' element found.\n")
                return "CAPTCHA_DETECTED"
            
    except Exception as e:
        sys.stderr.write(f"CAPTCHA Diagnostic Error: {str(e)}\n")

    return "NO_CAPTCHA"
