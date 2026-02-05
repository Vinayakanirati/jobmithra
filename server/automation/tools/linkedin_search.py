import sys
import time
import urllib.parse
from adk import tool
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from tools.linkedin_login import take_screenshot

@tool
def linkedin_search(driver, role: str, location: str) -> list:
    """
    Performs a LinkedIn search for jobs matching role and location with Easy Apply enabled.
    """
    sys.stderr.write(f"Initiating search for '{role}' in '{location}' (Easy Apply only)...\n")
    
    # Construct search URL
    # f_AL=true is the Easy Apply filter
    role_encoded = urllib.parse.quote(role)
    loc_encoded = urllib.parse.quote(location)
    
    # Base search URL
    search_url = f"https://www.linkedin.com/jobs/search/?keywords={role_encoded}&location={loc_encoded}&f_AL=true"
    
    driver.get(search_url)
    time.sleep(5)
    take_screenshot(driver, "search_results")
    
    jobs = []
    try:
        # Wait for job cards to load
        wait = WebDriverWait(driver, 10)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "job-card-container")))
        
        # Scroll down to load more jobs
        driver.execute_script("window.scrollTo(0, 800);")
        time.sleep(2)
        
        cards = driver.find_elements(By.CLASS_NAME, "job-card-container")
        sys.stderr.write(f"Found {len(cards)} matching jobs on the first page.\n")
        
        for card in cards[:10]: # Limit to first 10 for safety
            try:
                # Extract title and link
                link_el = card.find_element(By.CLASS_NAME, "job-card-list__title--link")
                title = link_el.text.strip()
                url = link_el.get_attribute("href").split("?")[0] # Clean URL
                
                # Extract company
                company = "Unknown"
                try:
                    company_el = card.find_element(By.CLASS_NAME, "job-card-container__primary-description")
                    company = company_el.text.strip()
                except: pass
                
                # Extract location
                job_loc = ""
                try:
                    loc_el = card.find_element(By.CLASS_NAME, "job-card-container__metadata-item")
                    job_loc = loc_el.text.strip()
                except: pass
                
                jobs.append({
                    "title": title,
                    "link": url,
                    "company": company,
                    "location": job_loc
                })
            except Exception as e:
                sys.stderr.write(f"Error parsing job card: {str(e)}\n")
                
    except Exception as e:
        sys.stderr.write(f"Search failed: {str(e)}\n")
        take_screenshot(driver, "search_failed")
        
    return jobs
