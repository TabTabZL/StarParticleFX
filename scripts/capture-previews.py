#!/usr/bin/env python3

import argparse
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT / "assets" / "demo"
OUTPUT = ROOT / "docs" / "media"
SLUGS = [
    "pattern-convergence", "stellar-links", "galaxy-vortex", "black-hole-collapse",
    "supernova-burst", "warp-transit", "gravity-lensing", "nebula-breathing",
    "orbital-system", "stardust-descent", "celestial-fold", "stellar-division",
    "stellar-freeze", "stellar-rivers", "chromatic-migration", "wave-propagation",
    "flock-migration", "time-reversal", "negative-space-reveal", "planet-birth",
    "recursive-zoom",
]


def wait_for_port(port: int, timeout: float = 10) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        with socket.socket() as connection:
            connection.settimeout(0.2)
            if connection.connect_ex(("127.0.0.1", port)) == 0:
                return
        time.sleep(0.1)
    raise RuntimeError(f"Preview server did not start on port {port}")


def convert_video(source: Path, destination: Path) -> None:
    subprocess.run(
        [
            "ffmpeg", "-loglevel", "error", "-y", "-i", str(source), "-an",
            "-c:v", "libx264", "-preset", "slow", "-crf", "29",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(destination),
        ],
        check=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Record StarParticleFX MP4 previews.")
    parser.add_argument("--slugs", nargs="*", choices=SLUGS, default=SLUGS)
    parser.add_argument("--duration", type=float, default=4.0)
    parser.add_argument("--port", type=int, default=4317)
    args = parser.parse_args()

    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg is required")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(args.port), "--bind", "127.0.0.1", "--directory", str(DEMO)],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        wait_for_port(args.port)
        with tempfile.TemporaryDirectory(prefix="star-particle-fx-") as temporary:
            temporary_path = Path(temporary)
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                for slug in args.slugs:
                    context = browser.new_context(
                        viewport={"width": 960, "height": 540},
                        record_video_dir=str(temporary_path),
                        record_video_size={"width": 960, "height": 540},
                    )
                    page = context.new_page()
                    errors = []
                    page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
                    page.goto(f"http://127.0.0.1:{args.port}/?capture=1#{slug}", wait_until="networkidle")
                    page.wait_for_timeout(int(args.duration * 1000))
                    video = page.video
                    page.close()
                    context.close()
                    if errors:
                        raise RuntimeError(f"Console errors for {slug}: {errors}")
                    convert_video(Path(video.path()), OUTPUT / f"{slug}.mp4")
                    print(f"Recorded {slug}.mp4")
                browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    main()
