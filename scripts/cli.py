"""Development CLI — orchestrates npm for the React frontend."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _run(cmd: list[str]) -> int:
    print(f">>> {' '.join(cmd)}")
    return subprocess.call(cmd, cwd=ROOT, shell=sys.platform == "win32")


def install() -> None:
    raise SystemExit(_run(["npm", "install"]))


def dev() -> None:
    raise SystemExit(_run(["npm", "run", "dev"]))


def dev_lan() -> None:
    raise SystemExit(_run(["npm", "run", "dev:lan"]))


def preview_lan() -> None:
    raise SystemExit(_run(["npm", "run", "preview:lan"]))


def build() -> None:
    raise SystemExit(_run(["npm", "run", "build"]))


def test() -> None:
    raise SystemExit(_run(["npm", "run", "test"]))
