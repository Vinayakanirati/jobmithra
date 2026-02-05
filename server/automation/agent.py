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
from tools.linkedin_search import linkedin_search
import threading

def stream_screenshots(stop_event):
    """Periodically takes screenshots in the background"""
    import sys
    error_count = 0
    while not stop_event.is_set():
        try:
            take_screenshot()
            error_count = 0 
        except Exception as e:
            error_count += 1
            if error_count > 5:
                sys.stderr.write("Screenshot thread stopping due to consecutive errors.\n")
                break
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
            tools=[linkedin_login, detect_captcha, auto_apply, linkedin_search]
        )

        # Start streaming thread
        stop_event = threading.Event()
        stream_thread = threading.Thread(target=stream_screenshots, args=(stop_event,), daemon=True)
        stream_thread.start()

        # 1. Login
        sys.stderr.write(f"Logging in as {email}...\n")
        take_screenshot()
        login_result = job_agent.run(linkedin_login, email=email, password=password)
        sys.stderr.write(f"Login outcome: {login_result}\n")
        take_screenshot()
        
        if "Login successful" not in login_result:
            sys.stderr.write(f"Authentication failed/aborted: {login_result}\n")
            print(json.dumps({"error": login_result}))
            stop_event.set()
            return

        # Continuing with driver check...

        driver = get_driver()
        if not driver:
            print(json.dumps({"error": "Failed to initialize driver."}))
            stop_event.set()
            return

        # 2. Extract preferences
        pref_role = profile_data.get('preferredRole', '').lower()
        pref_loc = profile_data.get('preferredLocation', '').lower()
        
        # Keywords from preferred role
        pref_role_keywords = [w for w in pref_role.split() if len(w) > 2]
        
        # Suited roles keywords (fallback/additional)
        suited_roles = [[word for word in r.lower().split() if len(word) > 2] for r in profile_data.get('rolesSuited', [])]
        
        sys.stderr.write(f"Parameters: Role={pref_role}, Loc={pref_loc}, Suited={profile_data.get('rolesSuited')}\n")

        # 3. Dynamic Search if requested or database list is small
        if not job_matches or len(job_matches) < 3:
            sys.stderr.write("Insufficient jobs in database. Performing dynamic LinkedIn search...\n")
            search_results = job_agent.run(linkedin_search, driver=driver, role=pref_role, location=pref_loc)
            if search_results:
                # Merge or replace (preferring dynamic search results for freshness)
                job_matches = search_results + job_matches
            
        # 3. Process jobs
        results = []
        applied_today = 0
        
        for job in job_matches:
            if applied_today >= limit:
                sys.stderr.write("Daily limit reached. Stopping.\n")
                break
                
            job_url = job.get('link', '')
            job_title = job.get('title', '').lower()
            job_loc = job.get('location', '').lower()
            
            sys.stderr.write(f"Evaluating: {job.get('title')} at {job.get('company')}\n")

            # 1. Check Role Match
            is_match = False
            if not pref_role_keywords and not suited_roles:
                is_match = True # No preferences, match all
            else:
                # Check preferred role first - strictly
                if pref_role_keywords:
                    # Must contain at least some keywords
                    match_count = sum(1 for kw in pref_role_keywords if kw in job_title)
                    if match_count > 0:
                        is_match = True
                
                # Check suited roles if no match yet
                if not is_match and suited_roles:
                    for role_keywords in suited_roles:
                        match_count = sum(1 for keyword in role_keywords if keyword in job_title)
                        if match_count > 0:
                            is_match = True
                            break
            
            # 2. Check Location Match
            # If the job came from a dynamic search with location filtered, we trust it more.
            # But let's keep a soft check.
            if is_match and pref_loc:
                loc_found = False
                pref_loc_list = [l.strip().lower() for l in pref_loc.split(',') if l.strip()]
                
                # If job_loc is empty, we'll give it the benefit of the doubt IF it's a dynamic search result
                # Or if it matches title keywords
                if not job_loc or job_loc == "unknown":
                    if any(loc in job_title for loc in pref_loc_list):
                        loc_found = True
                    else:
                        # Be lenient if we found it via search
                        loc_found = True 
                else:
                    for loc in pref_loc_list:
                        if loc in job_title or loc in job_loc:
                            loc_found = True
                            break
                        if "remote" in loc and ("remote" in job_title or "remote" in job_loc or "anywhere" in job_title):
                            loc_found = True
                            break
                
                if not loc_found:
                    sys.stderr.write(f"Skipping job due to location mismatch: {job.get('title')} at {job_loc} (Pref: {pref_loc})\n")
                    is_match = False
            
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
