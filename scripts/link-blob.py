#!/usr/bin/env python3
"""Link a Vercel Blob store to the current project by completing the interactive prompts."""
import os
import subprocess
import sys
import time
import threading

script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)

proc = subprocess.Popen(
    "npx vercel blob store add brief-wheel-storage-final",
    stdin=subprocess.PIPE,
    stdout=sys.stdout,
    stderr=sys.stderr,
    cwd=project_dir,
    shell=True,
    text=True,
)

def send_inputs():
    time.sleep(1.5)
    proc.stdin.write("y\n")
    proc.stdin.flush()
    time.sleep(2.5)
    proc.stdin.write("\n")
    proc.stdin.flush()
    proc.stdin.close()

t = threading.Thread(target=send_inputs)
t.start()
sys.exit(proc.wait())
