import os
import sys
import subprocess

def run_cmd(cmd):
    print(f"Running: {' '.join(cmd)}")
    # We allow stdout/stderr to print directly to the Render build console
    res = subprocess.run(cmd)
    if res.returncode != 0:
        # If createsuperuser fails (e.g. user already exists), we do not want to fail the deploy
        if "createsuperuser" in cmd:
            print("createsuperuser failed (the user probably already exists). Continuing...")
        else:
            print(f"Command failed with exit code {res.returncode}")
            sys.exit(res.returncode)

if __name__ == "__main__":
    # 1. Run migrations
    run_cmd(["python", "manage.py", "migrate"])
    
    # 2. Create superuser from environment variables if present
    if os.getenv("DJANGO_SUPERUSER_USERNAME") and os.getenv("DJANGO_SUPERUSER_PASSWORD"):
        print("Superuser environment variables detected. Attempting automatic creation...")
        run_cmd(["python", "manage.py", "createsuperuser", "--noinput"])
    else:
        print("DJANGO_SUPERUSER_USERNAME/PASSWORD env variables not set. Skipping createsuperuser.")
        
    print("Deployment setup completed successfully!")
