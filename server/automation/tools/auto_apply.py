import sys
import time
import random
from adk import tool
from tools.captcha_detector import detect_captcha
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@tool
def answer_questions(driver, user_data):
    """
    Advanced question handler inspired by EasyApplyJobsBot.
    Handles Radios, Text Inputs, and Resume selection.
    """
    try:
        # 1. Handle Resume Selection (if required on current page)
        try:
            resume_sections = driver.find_elements(By.XPATH, "//div[contains(@class, 'jobs-document-upload__title') and contains(., 'Resume')]")
            if resume_sections:
                # Look for selectable resumes
                resumes = driver.find_elements(By.XPATH, "//button[contains(@aria-label, 'Select this resume')]")
                if resumes:
                    # Select the first one by default
                    resumes[0].click()
                    sys.stderr.write("Resume selected automatically.\n")
        except: pass

        # 2. Handle Radio Buttons (Yes/No / Multiple Choice)
        radios = driver.find_elements(By.CSS_SELECTOR, "fieldset")
        for fieldset in radios:
            try:
                legend = fieldset.text.lower()
                sys.stderr.write(f"Question (Radio): {legend[:40]}...\n")
                
                # Positive matches (Yes)
                if any(x in legend for x in ["onsite", "on-site", "relocate", "relocation", "authorized", "legally", "commute"]):
                    yes_btn = fieldset.find_element(By.XPATH, ".//label[contains(., 'Yes')]")
                    yes_btn.click()
                    sys.stderr.write(f"Answered '{legend[:20]}': Yes\n")
                
                # Negative matches (No)
                elif any(x in legend for x in ["sponsorship", "visa", "clearance"]):
                    no_btn = fieldset.find_element(By.XPATH, ".//label[contains(., 'No')]")
                    no_btn.click()
                    sys.stderr.write(f"Answered '{legend[:20]}': No\n")
                
                # Experience/Proficiency matching
                elif "english" in legend or "proficiency" in legend:
                    try:
                        native_btn = fieldset.find_element(By.XPATH, ".//label[contains(., 'Native') or contains(., 'Professional')]")
                        native_btn.click()
                    except:
                        # Select first option if others fail
                        opts = fieldset.find_elements(By.TAG_NAME, "label")
                        if opts: opts[0].click()
            except: pass

        # 3. Handle Text Inputs & Dropdowns
        inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='number'], select")
        for inp in inputs:
            try:
                # Find label for this input
                inp_id = inp.get_attribute('id')
                label_text = ""
                try:
                    label_el = driver.find_element(By.XPATH, f"//label[@for='{inp_id}']")
                    label_text = label_el.text.lower()
                except:
                    # Fallback to parent text if label not found directly
                    label_text = inp.find_element(By.XPATH, "./..").text.lower()

                if not label_text: continue
                sys.stderr.write(f"Question (Input): {label_text[:40]}...\n")

                # Don't overwrite if already filled
                if inp.get_attribute("value"): continue

                # Name handling
                if any(x in label_text for x in ["full name", "first name", "last name"]):
                    name_parts = user_data.get('name', 'User Name').split(' ')
                    val = user_data.get('name', '')
                    if "first" in label_text: val = name_parts[0]
                    elif "last" in label_text: val = name_parts[-1] if len(name_parts) > 1 else ""
                    inp.send_keys(val)
                    sys.stderr.write(f"Set Name: {val}\n")

                # Contact info
                elif "phone" in label_text or "mobile" in label_text or "contact" in label_text:
                    val = user_data.get('phone', user_data.get('mobile', ''))
                    if val:
                        inp.send_keys(val)
                        sys.stderr.write(f"Set Contact: {val}\n")

                # Education
                elif any(x in label_text for x in ["education", "university", "college", "degree"]):
                    edu = user_data.get('education', [])
                    val = ""
                    if edu:
                        first_edu = edu[0]
                        if isinstance(first_edu, dict):
                            val = f"{first_edu.get('degree', '')} at {first_edu.get('school', '')}"
                        else:
                            val = str(first_edu)
                    if not val: val = "Bachelor's Degree"
                    inp.send_keys(val)
                    sys.stderr.write(f"Set Education: {val}\n")

                # Achievements / About
                elif any(x in label_text for x in ["achievement", "summary", "about yours", "description"]):
                    achievements = user_data.get('achievements', [])
                    val = ", ".join(achievements[:3]) if achievements else "Proven track record of delivering high-quality software solutions."
                    inp.send_keys(val)
                    sys.stderr.write(f"Set Summary/Achievement\n")

                # Salary Expectations
                elif "salary" in label_text or "compensation" in label_text or "pay" in label_text:
                    val = "90,000 - 120,000 USD" # Reasonable default
                    inp.send_keys(val)
                    sys.stderr.write(f"Set Salary: {val}\n")
                
                # Notice Period
                elif "notice" in label_text or "available" in label_text:
                    val = "2 weeks"
                    inp.send_keys(val)
                    sys.stderr.write(f"Set Notice: {val}\n")

                # Years of Experience (Skill Specific)
                elif "experience" in label_text:
                    # Default from user preference or base level
                    pref_exp = str(user_data.get('preferredExperience', '3')).replace('+', '')
                    exp = pref_exp if pref_exp.isdigit() else "3"
                    
                    user_skills = [s.lower() for s in user_data.get('skills', [])]
                    for skill in user_skills:
                        if skill in label_text:
                            # If it's a specific skill they listed, we can be confident
                            exp = str(max(int(exp), 4))
                            break
                    
                    if inp.tag_name == "select":
                        from selenium.webdriver.support.select import Select
                        s = Select(inp)
                        # Try to match the number in the options
                        found = False
                        for opt in s.options:
                            if exp in opt.text:
                                s.select_by_visible_text(opt.text)
                                found = True
                                break
                        if not found: s.select_by_index(1)
                    else:
                        inp.send_keys(exp)
                    sys.stderr.write(f"Set Experience for '{label_text[:20]}': {exp}\n")

                # Generic Text / URL
                elif "linkedin" in label_text:
                    val = "https://linkedin.com/in/" + user_data.get('name', 'user').replace(' ', '').lower()
                    inp.send_keys(val)
                elif "website" in label_text or "portfolio" in label_text:
                    val = "https://github.com/" + user_data.get('name', 'user').replace(' ', '').lower()
                    inp.send_keys(val)

            except: pass

    except Exception as e:
        sys.stderr.write(f"Advanced question handler error: {str(e)}\n")

@tool
def auto_apply(driver, linkedin_url: str, user_data: dict) -> str:
    if not driver: return "ERROR: Driver not initialized"

    driver.get(linkedin_url)
    time.sleep(random.uniform(3, 5))

    # CAPTCHA check
    if detect_captcha(driver) == "CAPTCHA_DETECTED":
        return "⚠ CAPTCHA detected. Please solve manually."

    try:
        # 1. Find the Easy Apply button
        apply_selectors = [
            "//button[contains(@class, 'jobs-apply-button')]",
            "//button[contains(., 'Easy Apply')]",
            "//button[contains(., 'Apply now')]",
            "//button[@aria-label[contains(., 'Easy Apply')]]"
        ]
        
        apply_button = None
        for selector in apply_selectors:
            try:
                apply_button = WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, selector)))
                if apply_button: break
            except: continue

        if not apply_button:
            # Sticky/scroll check
            driver.execute_script("window.scrollTo(0, 500);")
            time.sleep(1)
            for selector in apply_selectors:
                try:
                    btn = driver.find_element(By.XPATH, selector)
                    if btn.is_displayed():
                        apply_button = btn
                        break
                except: continue

        if not apply_button:
            return "Easy Apply button not found (Already applied or complex application)."

        # Click Apply
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", apply_button)
        time.sleep(1)
        apply_button.click()
        time.sleep(2)

        # 2. Process Multi-Step Form
        max_steps = 15
        for step in range(1, max_steps + 1):
            sys.stderr.write(f"--- Application Step {step} ---\n")
            
            # Answer questions first
            answer_questions(driver, user_data)
            time.sleep(1)

            # Look for navigation buttons
            # We look for "Submit" first to finish as soon as possible
            nav_buttons = [
                ("//button[contains(., 'Submit') or contains(@aria-label, 'Submit')]", "Submit"),
                ("//button[contains(., 'Review') or contains(@aria-label, 'Review')]", "Review"),
                ("//button[contains(., 'Next') or contains(@aria-label, 'next')]", "Next"),
                ("//button[contains(., 'Continue') or contains(@aria-label, 'Continue')]", "Continue")
            ]

            clicked_nav = False
            for xpath, btype in nav_buttons:
                try:
                    btns = driver.find_elements(By.XPATH, xpath)
                    for btn in btns:
                        if btn.is_displayed() and btn.is_enabled():
                            sys.stderr.write(f"Found navigation button: {btype}\n")
                            btn.click()
                            clicked_nav = True
                            
                            if btype == "Submit":
                                time.sleep(4)
                                return "Applied successfully!"
                            
                            time.sleep(random.uniform(2, 3))
                            break
                    if clicked_nav: break
                except: continue

            if not clicked_nav:
                # Check if we landed on a success screen anyway
                if "application was sent" in driver.page_source.lower() or "applied" in driver.page_source.lower():
                    return "Applied successfully!"
                
                # Check for errors on page
                if driver.find_elements(By.CLASS_NAME, "artdeco-inline-feedback--error"):
                    return "Manual input required (Validation error)."

                sys.stderr.write("No navigation button found. Stuck or completed.\n")
                break

        return "Flow finished (Check status manually)."

    except Exception as e:
        return f"Failed: {str(e)}"
