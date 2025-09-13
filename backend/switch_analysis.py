"""
Analysis Backend Switcher
Easy way to switch between OpenAI and Hugging Face backends
"""

import subprocess
import sys
import os
import time

def kill_existing_backends():
    """Kill any existing Python processes running backends"""
    try:
        # Kill Python processes (be careful with this)
        subprocess.run(["taskkill", "/f", "/im", "python.exe"], capture_output=True)
        print("🔄 Killed existing backend processes")
        time.sleep(2)
    except Exception as e:
        print(f"⚠️ Could not kill processes: {e}")

def start_openai_backend():
    """Start the OpenAI backend"""
    print("🤖 Starting OpenAI Backend...")
    kill_existing_backends()
    
    try:
        # Start OpenAI backend
        subprocess.Popen([
            sys.executable, "main.py"
        ], cwd=os.getcwd())
        print("✅ OpenAI Backend started on http://localhost:8000")
        print("📊 Features: Full AI analysis with OpenAI models")
        print("💰 Cost: Higher (uses OpenAI API)")
        print("⚡ Speed: Medium")
        
    except Exception as e:
        print(f"❌ Failed to start OpenAI backend: {e}")

def start_hf_backend():
    """Start the Hugging Face backend"""
    print("🤗 Starting Hugging Face Backend...")
    kill_existing_backends()
    
    try:
        # Start HF backend
        subprocess.Popen([
            sys.executable, "main_hf.py"
        ], cwd=os.getcwd())
        print("✅ Hugging Face Backend started on http://localhost:8001")
        print("📊 Features: Fast analysis with HF models + rule-based")
        print("💰 Cost: Free (local models)")
        print("⚡ Speed: Fast")
        
    except Exception as e:
        print(f"❌ Failed to start HF backend: {e}")


def show_status():
    """Show current backend status"""
    print("\n🔍 Checking backend status...")
    
    backends = [
        ("OpenAI", "http://localhost:8000", "main.py"),
        ("Hugging Face", "http://localhost:8001", "main_hf.py")
    ]
    
    for name, url, file in backends:
        try:
            import requests
            response = requests.get(f"{url}/health", timeout=2)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {name} Backend: RUNNING on {url}")
                print(f"   Model: {data.get('model_source', 'Unknown')}")
                print(f"   AI Enabled: {data.get('ai_enabled', False)}")
            else:
                print(f"❌ {name} Backend: NOT RUNNING on {url}")
        except:
            print(f"❌ {name} Backend: NOT RUNNING on {url}")

def main():
    """Main menu"""
    while True:
        print("\n" + "="*50)
        print("🔄 ANALYSIS BACKEND SWITCHER")
        print("="*50)
        print("1. 🤖 Start OpenAI Backend (Port 8000)")
        print("2. 🤗 Start Hugging Face Backend (Port 8001)")
        print("3. 🔍 Check Backend Status")
        print("4. 🛑 Kill All Backends")
        print("5. ❌ Exit")
        print("="*50)
        
        choice = input("Choose an option (1-5): ").strip()
        
        if choice == "1":
            start_openai_backend()
        elif choice == "2":
            start_hf_backend()
        elif choice == "3":
            show_status()
        elif choice == "4":
            kill_existing_backends()
            print("🛑 All backends stopped")
        elif choice == "5":
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please try again.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
