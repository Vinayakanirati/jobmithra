import os
import sys
import json
import time

# Add current directory to path so tools can import adk and each other
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from adk import Agent
from tools.linkedin_login import linkedin_login, get_driver, take_screenshot
from tools.captcha_detector import detect_captcha
from tools.auto_apply import auto_apply
import threading

def stream_screenshots(stop_event):
    """Periodically takes screenshots in the background"""
    while not stop_event.is_set():
        take_screenshot()
        time.sleep(2) # Stream every 2 seconds

def main():
    # Read input data from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data provided."}))
            return

        user_info = json.loads(input_data)
        email = user_info.get('email')
        password = user_info.get('password')
        profile_data = user_info.get('profile', {})
        job_matches = user_info.get('jobMatches', [])
        limit = user_info.get('dailyLimitRemaining', 5)
        
        # Initialize Agent
        job_agent = Agent(
            name="JobMithra",
            instructions=f"Apply up to {limit} jobs that match the user's role: {profile_data.get('rolesSuited')}",
            tools=[linkedin_login, detect_captcha, auto_apply]
        )

        # Start streaming thread
        stop_event = threading.Event()
        stream_thread = threading.Thread(target=stream_screenshots, args=(stop_event,), daemon=True)
        stream_thread.start()

        # 1. Login
        sys.stderr.write(f"Logging in as {email}...\n")
        take_screenshot()
        login_result = job_agent.run(linkedin_login, email=email, password=password)
        sys.stderr.write(f"{login_result}\n")
        take_screenshot()
        
        if "VERIFICATION_REQUIRED" in login_result:
            sys.stderr.write("Verification required. Waiting for user interaction or code...\n")
            # We'll wait longer here, letting the user see the screen via Remote View
            time.sleep(60) 

        driver = get_driver()
        if not driver:
            print(json.dumps({"error": "Failed to initialize driver."}))
            stop_event.set()
            return

        # 2. Process jobs
        results = []
        applied_today = 0
        
        # Filter jobs: Only process if they match rolesSuited
        suited_roles = [r.lower() for r in profile_data.get('rolesSuited', [])]
        
        for job in job_matches:
            if applied_today >= limit:
                break
                
            job_url = job.get('link')
            job_title = job.get('title', '').lower()
            
            # Basic matching: check if job title contains any suited role
            is_match = any(role in job_title for role in suited_roles) if suited_roles else True
            
            if not is_match:
                sys.stderr.write(f"Skipping non-matching job: {job.get('title')}\n")
                continue

            sys.stderr.write(f"Applying for: {job.get('title')} at {job.get('company')}\n")
            take_screenshot()
            
            while True:
                sys.stderr.write(f"Executing auto_apply tool for: {job_url}\n")
                result = job_agent.run(auto_apply, driver=driver, linkedin_url=job_url, user_data=profile_data)
                sys.stderr.write(f"Tool Result: {result}\n")
                take_screenshot()
                
                if "CAPTCHA" in result:
                    sys.stderr.write("CAPTCHA detected. User can solve via Remote View if visible.\n")
                    time.sleep(30) 
                    if job_agent.run(detect_captcha, driver=driver) == "NO_CAPTCHA":
                        sys.stderr.write("CAPTCHA resolved. Retrying...\n")
                        continue
                    else:
                        sys.stderr.write("CAPTCHA still present. Skipping job.\n")
                        results.append({"title": job.get('title'), "company": job.get('company'), "url": job_url, "status": "Failed (CAPTCHA)"})
                        break
                elif "Applied successfully" in result or "Applied" in result:
                    sys.stderr.write("Application success reported by tool.\n")
                    results.append({"title": job.get('title'), "company": job.get('company'), "url": job_url, "status": "Applied"})
                    applied_today += 1
                    break
                else:
                    sys.stderr.write(f"Application incomplete/failed: {result[:50]}\n")
                    results.append({"title": job.get('title'), "company": job.get('company'), "url": job_url, "status": f"Partial/Manual ({result[:20]}...)"})
                    break
            
            take_screenshot()

        # Stop streaming and quit
        stop_event.set()
        if driver:
            driver.quit()
        
        # Output results as JSON for Node.js to parse
        print(json.dumps({"results": results}))

    except Exception as e:
        # Use stderr for error logging and print JSON error to stdout
        sys.stderr.write(f"Python Exception: {str(e)}\n")
        print(json.dumps({"error": str(e)}))
        if 'stop_event' in locals(): stop_event.set()

if __name__ == "__main__":
    main()
