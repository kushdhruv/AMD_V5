import requests
import time
import sys
import threading

API_URL = "http://localhost:8000"

def run_verification():
    print("Starting Verification...")
    
    # 1. Register
    username = f"user_{int(time.time())}"
    password = "password123"
    print(f"Registering user: {username}")
    
    try:
        res = requests.post(f"{API_URL}/auth/register", json={"username": username, "password": password})
        if res.status_code != 200:
            print(f"Registration failed: {res.text}")
            return
            
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Login successful.")
        
        # 2. Create Task
        print("Creating task...")
        res = requests.post(
            f"{API_URL}/tasks/",
            json={"prompt": "A test video", "duration": 5},
            headers=headers
        )
        if res.status_code != 200:
            print(f"Create task failed: {res.text}")
            return
            
        task_id = res.json()["id"]
        print(f"Task created: ID {task_id}")
        
        # 3. Poll for completion
        # If worker is running, it should pick it up.
        print("Polling for completion (max 20s)...")
        for _ in range(10):
            res = requests.get(f"{API_URL}/tasks/{task_id}", headers=headers)
            status = res.json()["status"]
            print(f"Task Status: {status}")
            
            if status == "completed":
                print("Task Completed Successfully!")
                print(f"Video URL: {res.json()['video_url']}")
                return
            elif status == "failed":
                print("Task Failed.")
                return
                
            time.sleep(2)
            
        print("Timeout waiting for task completion. Is the worker running?")

    except Exception as e:
        print(f"Verification Error: {e}")

if __name__ == "__main__":
    # Wait a bit for server to be ready if just started
    time.sleep(3)
    run_verification()
