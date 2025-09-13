"""
Simple Backend Starter
Run this from the project root to start a backend
"""

import subprocess
import sys
import os
import time

def start_backend(backend_type):
    """Start a specific backend"""
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    
    if backend_type == "openai":
        print("🤖 Starting OpenAI Backend...")
        subprocess.Popen([sys.executable, "main.py"], cwd=backend_dir)
        print("✅ OpenAI Backend started on http://localhost:8000")
    elif backend_type == "hf":
        print("🤗 Starting Hugging Face Backend...")
        subprocess.Popen([sys.executable, "main_hf.py"], cwd=backend_dir)
        print("✅ Hugging Face Backend started on http://localhost:8001")
    else:
        print("❌ Invalid backend type. Use 'openai' or 'hf'")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        backend_type = sys.argv[1].lower()
        start_backend(backend_type)
    else:
        print("Usage: python start_backend.py [openai|hf]")
        print("Examples:")
        print("  python start_backend.py openai")
        print("  python start_backend.py hf")
