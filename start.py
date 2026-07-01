import os
import sys
import subprocess
import time
import socket
import threading

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log(prefix, text, color):
    for line in text.splitlines():
        if line.strip():
            print(f"{color}{prefix}{Colors.ENDC} {line}")

def log_stream(process, prefix, color):
    # Read output line by line and print it
    for line in iter(process.stdout.readline, ''):
        log(prefix, line, color)
    process.stdout.close()

def is_port_open(port):
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1.0)
        try:
            s.connect(('127.0.0.1', port))
            return True
        except (socket.timeout, ConnectionRefusedError):
            return False

def is_model_downloaded(model_name):
    import urllib.request
    import json
    try:
        req = urllib.request.Request("http://127.0.0.1:11434/api/tags")
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            models = data.get("models", [])
            for m in models:
                name = m.get("name", "")
                if name == model_name or name.startswith(model_name + ":"):
                    return True
    except Exception:
        pass
def get_env_commands(project_root):
    """
    Detects the best way to execute Python, FastAPI and npm commands.
    Returns: (python_cmd_list, fastapi_cmd_str, frontend_cmd_str, env_name)
    """
    # 1. Check if running inside an already activated environment (venv or conda)
    # sys.prefix != sys.base_prefix is True inside a standard virtualenv.
    # CONDA_DEFAULT_ENV is set inside active Conda environments.
    is_venv = (sys.prefix != sys.base_prefix)
    is_conda = 'CONDA_DEFAULT_ENV' in os.environ or 'CONDA_PREFIX' in os.environ
    
    if is_venv or is_conda:
        env_name = os.environ.get('CONDA_DEFAULT_ENV') or os.path.basename(sys.prefix)
        print(f"Detected active environment: {Colors.GREEN}{env_name}{Colors.ENDC}")
        
        # FastAPI might be installed in the active environment's Scripts/bin folder
        fastapi_bin = "fastapi"
        bindir = os.path.dirname(sys.executable)
        fastapi_exe = os.path.join(bindir, "fastapi.exe" if sys.platform == "win32" else "fastapi")
        if os.path.exists(fastapi_exe):
            fastapi_bin = f'"{fastapi_exe}"'
            
        return [sys.executable], fastapi_bin, "npm run dev", env_name

    # 2. Check for local venv or .venv folder in backend directory
    for venv_dir in ["venv", ".venv"]:
        venv_path = os.path.join(project_root, "backend", venv_dir)
        if os.path.isdir(venv_path):
            if sys.platform == "win32":
                python_exe = os.path.join(venv_path, "Scripts", "python.exe")
                fastapi_exe = os.path.join(venv_path, "Scripts", "fastapi.exe")
            else:
                python_exe = os.path.join(venv_path, "bin", "python")
                fastapi_exe = os.path.join(venv_path, "bin", "fastapi")
                
            if os.path.exists(python_exe):
                print(f"Detected local virtual environment at: {Colors.GREEN}backend/{venv_dir}{Colors.ENDC}")
                fastapi_bin = f'"{fastapi_exe}"' if os.path.exists(fastapi_exe) else "fastapi"
                return [python_exe], fastapi_bin, "npm run dev", f"backend/{venv_dir}"

    # 3. Check if conda exists and solino environment exists
    import shutil
    if shutil.which("conda"):
        print(f"Detected conda in path. Attempting to run via conda environment '{Colors.GREEN}solino{Colors.ENDC}'...")
        return ["conda", "run", "-n", "solino", "python"], "conda run -n solino fastapi", "conda run -n solino npm run dev", "conda:solino"

    print(f"{Colors.YELLOW}Warning: No activated environment or local backend/venv detected. Running commands globally.{Colors.ENDC}")
    return [sys.executable], "fastapi", "npm run dev", "global"

def check_and_download_piper_models(project_root):
    models_dir = os.path.join(project_root, "backend", "assets", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    files_to_download = {
        "de_DE-thorsten-high.onnx": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx?download=true",
        "de_DE-thorsten-high.onnx.json": "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json?download=true",
        "de_DE-kerstin-low.onnx": "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx?download=true",
        "de_DE-kerstin-low.onnx.json": "https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE/kerstin/low/de_DE-kerstin-low.onnx.json?download=true"
    }
    
    import urllib.request
    
    for filename, url in files_to_download.items():
        filepath = os.path.join(models_dir, filename)
        if not os.path.exists(filepath):
            print(f"{Colors.BLUE}[TTS Models]{Colors.ENDC} Downloading {filename}...")
            try:
                # Basic progress reporter
                def progress_hook(count, block_size, total_size):
                    percent = int(count * block_size * 100 / total_size)
                    sys.stdout.write(f"\rDownloading: {percent}%")
                    sys.stdout.flush()
                
                urllib.request.urlretrieve(url, filepath, reporthook=progress_hook)
                print(f"\n{Colors.GREEN}[TTS Models]{Colors.ENDC} Successfully downloaded {filename}")
            except Exception as e:
                print(f"\n{Colors.RED}[TTS Models] Failed to download {filename}: {e}{Colors.ENDC}")

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Solino Launcher (Cross-Platform)")
    parser.add_argument("--assistant", action="store_true", help="Launch the interactive voice assistant in the foreground and suppress background logs.")
    args = parser.parse_args()

    # Enable color output on Windows Command Prompt if needed
    if sys.platform == "win32":
        os.system('color')
        
    # Force UTF-8 encoding on stdout/stderr to prevent emoji crashes on Windows
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8')

    print(f"{Colors.HEADER}=== Solino Launcher (Cross-Platform) ==={Colors.ENDC}")
    
    # Get project root directory
    project_root = os.path.dirname(os.path.abspath(__file__))
    python_cmd_list, fastapi_cmd_str, frontend_cmd_str, env_name = get_env_commands(project_root)
    
    # Auto-download Piper voice models if missing
    check_and_download_piper_models(project_root)
    
    processes = []
    
    # Configure child environments to prevent emoji encoding crashes on Windows standard terminal (CP1252)
    child_env = os.environ.copy()
    child_env["PYTHONIOENCODING"] = "utf-8"
    child_env["PYTHONUTF8"] = "1"
    
    # 1. Start Ollama if not running
    print(f"{Colors.BLUE}[Ollama]{Colors.ENDC} Checking Ollama status...")
    if not is_port_open(11434):
        print(f"{Colors.BLUE}[Ollama]{Colors.ENDC} Ollama is not running on port 11434. Attempting to start it...")
        
        # Determine the Ollama executable command path
        ollama_cmd = "ollama"
        if sys.platform == "win32":
            import shutil
            if not shutil.which("ollama"):
                local_appdata = os.environ.get("LOCALAPPDATA", os.path.expanduser("~\\AppData\\Local"))
                default_ollama = os.path.join(local_appdata, "Programs", "Ollama", "ollama.exe")
                if os.path.exists(default_ollama):
                    ollama_cmd = f'"{default_ollama}"'
                    
        try:
            ollama_proc = subprocess.Popen(
                f"{ollama_cmd} serve",
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                cwd=project_root
            )
            processes.append(ollama_proc)
            print(f"{Colors.BLUE}[Ollama]{Colors.ENDC} Ollama server launched in background.")
            # Wait for Ollama to spin up
            for _ in range(5):
                if is_port_open(11434):
                    break
                time.sleep(1)
        except Exception as e:
            print(f"{Colors.RED}[Ollama] Error starting Ollama: {e}{Colors.ENDC}")
            print(f"{Colors.YELLOW}[Ollama] Make sure Ollama is installed and running manually.{Colors.ENDC}")
    else:
        print(f"{Colors.GREEN}[Ollama]{Colors.ENDC} Ollama is already running.")

    # 1.5 Check if gemma4 model is downloaded, otherwise pull it
    if is_port_open(11434):
        print(f"{Colors.BLUE}[Ollama]{Colors.ENDC} Checking if model 'gemma4' is downloaded...")
        if not is_model_downloaded("gemma4"):
            print(f"{Colors.BLUE}[Ollama]{Colors.ENDC} Model 'gemma4' not found locally. Downloading it now (9.6 GB)...")
            try:
                ollama_cmd = "ollama"
                if sys.platform == "win32":
                    import shutil
                    if not shutil.which("ollama"):
                        local_appdata = os.environ.get("LOCALAPPDATA", os.path.expanduser("~\\AppData\\Local"))
                        default_ollama = os.path.join(local_appdata, "Programs", "Ollama", "ollama.exe")
                        if os.path.exists(default_ollama):
                            ollama_cmd = f'"{default_ollama}"'
                
                # Run pull command interactively so the user sees the progress bar
                subprocess.run(f"{ollama_cmd} pull gemma4", shell=True, check=True)
                print(f"{Colors.GREEN}[Ollama]{Colors.ENDC} Model 'gemma4' downloaded successfully.")
            except Exception as e:
                print(f"{Colors.RED}[Ollama] Error downloading model: {e}{Colors.ENDC}")

    # 2. Start Frontend dev server
    print(f"{Colors.YELLOW}[Frontend]{Colors.ENDC} Starting Vite dev server...")
    frontend_dir = os.path.join(project_root, "frontend")
    try:
        frontend_proc = subprocess.Popen(
            frontend_cmd_str,
            shell=True,
            stdout=subprocess.DEVNULL if args.assistant else subprocess.PIPE,
            stderr=subprocess.DEVNULL if args.assistant else subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            env=child_env,
            bufsize=1,
            cwd=frontend_dir
        )
        processes.append(frontend_proc)
        if not args.assistant:
            threading.Thread(target=log_stream, args=(frontend_proc, "[Frontend]", Colors.YELLOW), daemon=True).start()
    except Exception as e:
        print(f"{Colors.RED}[Frontend] Failed to start Vite: {e}{Colors.ENDC}")

    # 3. Start Backend FastAPI dev server
    print(f"{Colors.GREEN}[Backend]{Colors.ENDC} Starting FastAPI dev server...")
    backend_src_dir = os.path.join(project_root, "backend", "src")
    try:
        backend_proc = subprocess.Popen(
            f"{fastapi_cmd_str} dev api/main.py --host 0.0.0.0",
            shell=True,
            stdout=subprocess.DEVNULL if args.assistant else subprocess.PIPE,
            stderr=subprocess.DEVNULL if args.assistant else subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            env=child_env,
            bufsize=1,
            cwd=backend_src_dir
        )
        processes.append(backend_proc)
        if not args.assistant:
            threading.Thread(target=log_stream, args=(backend_proc, "[Backend]", Colors.GREEN), daemon=True).start()
    except Exception as e:
        print(f"{Colors.RED}[Backend] Failed to start FastAPI: {e}{Colors.ENDC}")

    if args.assistant:
        print(f"\n{Colors.BOLD}{Colors.GREEN}Starting Voice CLI Assistant...{Colors.ENDC}\n")
        try:
            # Run the CLI assistant in the foreground
            cli_proc = subprocess.Popen(
                python_cmd_list + ["assistant_cli.py"],
                env=child_env,
                cwd=backend_src_dir
            )
            
            # Monitor background processes and the CLI process
            while cli_proc.poll() is None:
                # Check if any background process crashed
                for p in processes:
                    if p.poll() is not None:
                        print(f"\n{Colors.RED}Warning: Background process exited with code {p.returncode}.{Colors.ENDC}")
                        try:
                            cli_proc.terminate()
                        except Exception:
                            pass
                        raise KeyboardInterrupt
                time.sleep(0.5)
                
            print(f"\n{Colors.YELLOW}CLI assistant closed.{Colors.ENDC}")
        except KeyboardInterrupt:
            pass
    else:
        print(f"\n{Colors.BOLD}{Colors.GREEN}All services are running! Press Ctrl+C to stop all services.{Colors.ENDC}")
        print(f"{Colors.YELLOW}Tip: To talk to the assistant via microphone CLI, restart this script with the --assistant flag:{Colors.ENDC}")
        print(f"     python start.py --assistant\n")

        # Keep main thread alive and monitor processes
        try:
            while True:
                # Check if any background process crashed
                for p in processes:
                    if p.poll() is not None:
                        print(f"\n{Colors.RED}Warning: Process exited with code {p.returncode}. Stopping all...{Colors.ENDC}")
                        raise KeyboardInterrupt
                time.sleep(1)
        except KeyboardInterrupt:
            pass

    print(f"\n{Colors.YELLOW}Stopping all services...{Colors.ENDC}")
    # Terminate all processes
    for p in processes:
        try:
            if sys.platform == "win32":
                # On Windows, kill the process tree to avoid orphaned CMD/Node/Python processes
                subprocess.call(f"taskkill /F /T /PID {p.pid}", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                p.terminate()
        except Exception:
            pass
    print(f"{Colors.GREEN}Cleaned up successfully. Bye!{Colors.ENDC}")

if __name__ == "__main__":
    main()
