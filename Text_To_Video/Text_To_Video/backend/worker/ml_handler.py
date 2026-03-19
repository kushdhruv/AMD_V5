import time
import os
import torch
from diffusers import AnimateDiffPipeline, MotionAdapter, EulerDiscreteScheduler
from diffusers.utils import export_to_video

# Disable mock mode for real generation
MOCK_MODE = False

# Global pipeline cache to avoid reloading model on every request
pipe = None

def get_pipeline():
    global pipe
    if pipe is None:
        print("Loading AnimateDiff Model... this may take a while (downloading ~5GB+)...")
        
        # 1. Load Motion Adapter
        adapter = MotionAdapter.from_pretrained("guoyww/animatediff-motion-adapter-v1-5-2", torch_dtype=torch.float16)
        
        # 2. Load Base SD 1.5 Model (Realistic Vision or similar)
        # Using "emilianJR/epiCRealism" as it's a good realistic checkpoint
        model_id = "emilianJR/epiCRealism"
        
        pipe = AnimateDiffPipeline.from_pretrained(
            model_id,
            motion_adapter=adapter,
            torch_dtype=torch.float16
        )
        
        # 3. Scheduler
        pipe.scheduler = EulerDiscreteScheduler.from_config(
            pipe.scheduler.config, 
            timestep_spacing="trailing", 
            beta_schedule="linear"
        )
        
        # 4. Optimizations for Consumer GPUs (8GB VRAM)
        if torch.cuda.is_available():
            # CPU Offload saves VRAM by moving models to CPU when not in use per-submodule
            pipe.enable_model_cpu_offload()
            pipe.enable_vae_slicing()
        else:
            print("Warning: CUDA not found. Running on CPU will be extremely slow.")
            
    return pipe

def generate_clip(prompt: str, duration_sec: int = 4, step: int = 0) -> str:
    """
    Generates a short video clip from text prompt using AnimateDiff.
    Returns the path to the generated .mp4 file.
    """
    output_dir = "temp_clips"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    filename = f"{output_dir}/clip_{int(time.time())}_{step}.mp4"
    
    if MOCK_MODE:
        # Fallback to previous mock logic if needed for debugging
        import subprocess
        colors = ["red", "blue", "green", "yellow", "purple"]
        color = colors[step % len(colors)]
        cmd = [
            "ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c={color}:s=512x512:d={duration_sec}",
            "-vf", f"drawtext=text='{prompt[:20]}':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", filename
        ]
        try:
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        except:
             with open(filename, "wb") as f: f.write(b"mock")
        return filename

    # REAL GENERATION
    pipeline = get_pipeline()
    
    # Generate
    # AnimateDiff default is 16 frames. At 8fps = 2s. We can try to stretch or loop.
    # To get 4 seconds, we might need more frames or interpolation, but AnimateDiff v1 is best at 16 frames.
    # We will generate 16 frames and it will be short (~2s). 
    # If the user requested 4s clips, we might need to slow it down or generate more frames (context window limit).
    # For now, let's stick to standard 16 frames to ensure quality, and maybe set fps to 8.
    
    # Seed for reproducibility if needed (using step as variant seed)
    generator = torch.Generator("cuda").manual_seed(int(time.time()) + step) if torch.cuda.is_available() else None
    
    print(f"Generating clip with prompt: {prompt}")
    
    # Robust Negative Prompt for better quality
    negative_prompt = "bad quality, worse quality, low resolution, blurry, distorted, deformed, glitch, noise, text, watermark, logo, cartoon, anime, ugly, horror"
    
    output = pipeline(
        prompt=prompt,
        negative_prompt=negative_prompt,
        num_frames=16,
        guidance_scale=8.0, # Slightly higher guidance for better prompt adherence
        num_inference_steps=30, # More steps for better detail
        generator=generator
    )
    
    frames = output.frames[0]
    
    # Export
    # export_to_video uses imageio which uses ffmpeg
    export_to_video(frames, filename, fps=8)
    
    return filename
