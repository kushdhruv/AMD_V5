import requests
import time

API_URL = "http://localhost:8000"

def debug():
    # 1. Register/Login
    username = f"debug_{int(time.time())}"
    password = "password"
    
    print(f"Registering {username}...")
    res = requests.post(f"{API_URL}/auth/register", json={"username": username, "password": password})
    if res.status_code != 200:
        print("Register failed:", res.text)
        # Try login if exists
        res = requests.post(f"{API_URL}/auth/token", data={"username": username, "password": password})
        
    if res.status_code != 200:
        print("Login failed:", res.text)
        return

    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Task
    print("Creating task...")
    res = requests.post(
        f"{API_URL}/tasks/",
        json={"prompt": "Test video", "duration": 5},
        headers=headers
    )
    
    print(f"Status Code: {res.status_code}")
    print(f"Response Body: {res.text}")

if __name__ == "__main__":
    debug()
