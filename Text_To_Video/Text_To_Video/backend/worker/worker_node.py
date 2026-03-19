import time
import requests
import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import sys

# Add current directory to path to import local modules
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

import ml_handler
import video_utils

# CONFIG
API_URL = "http://localhost:8000"
WORKER_KEY = "my_worker_secret_key"
POLL_INTERVAL = 5 # seconds

def process_task(task):
    print(f"Processing task {task['id']}: {task['prompt']} ({task['duration']}s)")
    
    try:
        # 1. Segment Duration
        # AnimateDiff usually does ~2-4s. Let's aim for 4s clips.
        clip_duration = 4
        total_duration = task['duration']
        num_clips = -(-total_duration // clip_duration) # Ceiling division
        
        print(f"Generating {num_clips} clips of ~{clip_duration}s each...")
        
        # 2. Generate Clips
        clip_paths = []
        for i in range(num_clips):
            print(f"  - Generating clip {i+1}/{num_clips}...")
            # Pass prompt and seed (can vary seed for diversity or keep consistent)
            clip_path = ml_handler.generate_clip(task['prompt'], duration_sec=clip_duration, step=i)
            clip_paths.append(clip_path)
            
        # 3. Stitch Clips
        print(f"Stitching {len(clip_paths)} clips...")
        final_video_path = video_utils.stitch_videos(clip_paths, target_duration=total_duration)
        
        # 4. Upload Result
        print(f"Uploading result: {final_video_path}")
        with open(final_video_path, 'rb') as f:
            files = {'file': (f"final_{task['id']}.mp4", f, 'video/mp4')}
            headers = {'x-worker-key': WORKER_KEY}
            response = requests.post(
                f"{API_URL}/worker/tasks/{task['id']}/result",
                headers=headers,
                files=files
            )
            
        if response.status_code == 200:
            print("Task completed and uploaded successfully.")
        else:
            print(f"Failed to upload result: {response.text}")
            
        # Cleanup
        # (Optional) delete temp clips and final video
        
    except Exception as e:
        print(f"Error processing task: {e}")
        # Notify backend of failure
        requests.post(
            f"{API_URL}/worker/tasks/{task['id']}/fail",
            headers={'x-worker-key': WORKER_KEY},
            params={'reason': str(e)}
        )

def main():
    print("Worker started. Polling for tasks...")
    while True:
        try:
            response = requests.get(
                f"{API_URL}/worker/pending-task",
                headers={'x-worker-key': WORKER_KEY}
            )
            
            if response.status_code == 200:
                data = response.json()
                task = data.get("task")
                if task:
                    process_task(task)
                else:
                    # No tasks, wait
                    time.sleep(POLL_INTERVAL)
            else:
                print(f"Error polling: {response.text}")
                time.sleep(POLL_INTERVAL)
                
        except requests.exceptions.ConnectionError:
            print("Could not connect to backend. Retrying...")
            time.sleep(POLL_INTERVAL)
        except Exception as e:
            print(f"Unexpected error: {e}")
            time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
