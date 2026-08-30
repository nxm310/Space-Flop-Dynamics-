"""
Star Citizen Log Watcher - Local Agent
Monitors Star Citizen's Game.log file in real-time, extracts live telemetry,
ship status, server shard, locations, and session state.
"""

import os
import re
import time
import threading
from datetime import datetime
from typing import Dict, List, Any, Optional

class StarCitizenLogWatcher:
    def __init__(self, log_path: str):
        self.log_path = log_path
        self.running = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()
        
        # Live state
        self.state: Dict[str, Any] = {
            "game_running": False,
            "version": "Unknown",
            "session_id": "None",
            "env_session": "None",
            "server_shard": "None",
            "current_location": "En orbite / Inconnu",
            "current_ship": "Aucun vaisseau actif",
            "last_event_time": None,
            "connected_at": None,
            "recent_events": [],
            "log_file_found": False,
            "log_file_size": 0
        }
        
        # Regex patterns for Game.log parsing
        self._patterns = {
            "version": re.compile(r"FileVersion:\s+([0-9\.]+)"),
            "build": re.compile(r"BackupNameAttachment=\"\s*Build\(([0-9]+)\)"),
            "session": re.compile(r"@session:\s+'([^']+)'"),
            "env_session": re.compile(r"@env_session:\s+'([^']+)'"),
            "host_session": re.compile(r"@host_session:\s+'([^']+)'"),
            "location_zone": re.compile(r"(?:Entering zone|Location|Zone|Spawn location|Entity .* entered zone)\s*[:=]?\s*['\"]?([A-Za-z0-9_\-\s]+)['\"]?", re.IGNORECASE),
            "ship_spawn": re.compile(r"(?:Spawned vehicle|Vehicle spawned|Vehicle|ASOP spawned)\s*[:=]?\s*['\"]?([A-Za-z0-9_\-\s]+)['\"]?", re.IGNORECASE),
            "game_shutdown": re.compile(r"(?:CSystem::Quit|Game shutdown|Client quit|Application exit)", re.IGNORECASE)
        }

    def set_log_path(self, new_log_path: str):
        """Dynamically updates the log file path being monitored."""
        with self._lock:
            self.log_path = new_log_path
            self.state["log_file_found"] = os.path.exists(new_log_path)
            if self.state["log_file_found"]:
                self.state["log_file_size"] = os.path.getsize(new_log_path)
        self._add_event("Config", f"Nouveau chemin Game.log configuré : {new_log_path}")
        print(f"[SC-Watcher] Updated log path to: {new_log_path}")

    def start(self):
        """Starts background log monitoring thread."""
        if self.running:
            return
        self.running = True
        self._thread = threading.Thread(target=self._watch_loop, daemon=True)
        self._thread.start()
        print(f"[SC-Watcher] Started monitoring: {self.log_path}")

    def stop(self):
        """Stops the watcher thread."""
        self.running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2)
        print("[SC-Watcher] Stopped.")

    def get_state(self) -> Dict[str, Any]:
        """Thread-safe copy of live game status."""
        with self._lock:
            return dict(self.state)

    def _add_event(self, category: str, message: str):
        timestamp = datetime.now().strftime("%H:%M:%S")
        with self._lock:
            self.state["last_event_time"] = timestamp
            self.state["recent_events"].insert(0, {
                "time": timestamp,
                "category": category,
                "message": message
            })
            # Keep last 50 events
            self.state["recent_events"] = self.state["recent_events"][:50]

    def _check_process_running(self) -> bool:
        """Checks if StarCitizen.exe is running on Windows."""
        try:
            output = subprocess.check_output(
                ["tasklist", "/FI", "IMAGENAME eq StarCitizen.exe", "/NH"],
                creationflags=0x08000000 if os.name == 'nt' else 0
            ).decode("utf-8", errors="ignore")
            return "starcitizen.exe" in output.lower()
        except Exception:
            return False

    def _watch_loop(self):
        last_file_size = 0
        file_obj = None
        last_proc_check = 0

        while self.running:
            try:
                now = time.time()
                # Check process status every 5 seconds
                if now - last_proc_check > 5:
                    is_proc_running = self._check_process_running()
                    last_proc_check = now
                    with self._lock:
                        self.state["game_running"] = is_proc_running

                if not os.path.exists(self.log_path):
                    with self._lock:
                        self.state["log_file_found"] = False
                    time.sleep(2)
                    continue

                curr_size = os.path.getsize(self.log_path)
                with self._lock:
                    self.state["log_file_found"] = True
                    self.state["log_file_size"] = curr_size

                # If file was truncated or opened newly
                if file_obj is None or curr_size < last_file_size:
                    if file_obj:
                        file_obj.close()
                    file_obj = open(self.log_path, "r", encoding="utf-8", errors="replace")
                    
                    # 1. Read header (first 8KB) for version, build, shard, session startup
                    header_lines = [file_obj.readline() for _ in range(150)]
                    for line in header_lines:
                        self._parse_line(line)

                    # 2. Seek near end for recent live activity if file is large
                    if curr_size > 80000:
                        file_obj.seek(curr_size - 80000)
                    last_file_size = file_obj.tell()

                # Read newly appended lines
                new_lines = file_obj.readlines()
                if new_lines:
                    last_file_size = file_obj.tell()
                    with self._lock:
                        self.state["game_running"] = True
                    for line in new_lines:
                        self._parse_line(line)

            except Exception as e:
                pass

            time.sleep(1.5)

        if file_obj:
            file_obj.close()

    def _parse_line(self, line: str):
        line = line.strip()
        if not line:
            return

        with self._lock:
            # Check version
            m_ver = self._patterns["version"].search(line)
            if m_ver:
                self.state["version"] = m_ver.group(1)
                self.state["game_running"] = True
                if not self.state["connected_at"]:
                    self.state["connected_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Check session
            m_sess = self._patterns["session"].search(line)
            if m_sess:
                self.state["session_id"] = m_sess.group(1)
                self.state["game_running"] = True

            # Check env session / shard
            m_env = self._patterns["env_session"].search(line)
            if m_env:
                self.state["env_session"] = m_env.group(1)
                self.state["server_shard"] = m_env.group(1)

            # Check host session
            m_host = self._patterns["host_session"].search(line)
            if m_host and self.state["server_shard"] == "None":
                self.state["server_shard"] = m_host.group(1)

            # Detect locations
            known_locations = [
                "Lorville", "Area18", "Orison", "New Babbage", "Grim HEX",
                "Port Tressler", "Everus Harbor", "Baijini Point", "Seraphim Station",
                "HUR-L1", "HUR-L2", "HUR-L3", "HUR-L4", "HUR-L5",
                "CRU-L1", "CRU-L4", "CRU-L5",
                "MIC-L1", "MIC-L2", "MIC-L3", "MIC-L4", "MIC-L5",
                "ARC-L1", "ARC-L2", "ARC-L3", "ARC-L4", "ARC-L5",
                "Pyro", "Stanton", "Magnus", "Terra", "Levski",
                "Checkmate", "Ruin Station", "Gaslight", "Orbit"
            ]
            for loc in known_locations:
                if loc.lower() in line.lower():
                    if "zone" in line.lower() or "spawn" in line.lower() or "station" in line.lower() or "arrived" in line.lower() or "jump" in line.lower():
                        self.state["current_location"] = loc

            # Detect ships
            known_ships = [
                "Constellation", "Cutlass Black", "Carrack", "Prospector", "Mole",
                "Vulture", "Reclaimer", "Corsair", "C2 Hercules", "A2 Hercules",
                "M2 Hercules", "Caterpillar", "Mercury Star Runner", "Avenger Titan",
                "Gladius", "Arrow", "Eclipse", "Retaliator", "Hammerhead",
                "Vanguard Warden", "Vanguard Sentinel", "Vanguard Harbinger", "600i",
                "890 Jump", "Freelancer", "Raft", "Hull A", "Hull C", "Terrapin",
                "Scorpius", "F7C Hornet", "F8C Lightning", "Zeus Mk II", "SRV"
            ]
            for ship in known_ships:
                if ship.lower() in line.lower() and ("spawn" in line.lower() or "vehicle" in line.lower() or "claim" in line.lower() or "asop" in line.lower()):
                    self.state["current_ship"] = ship

            # Detect shutdown
            if self._patterns["game_shutdown"].search(line):
                self.state["game_running"] = False
                self.state["current_ship"] = "Aucun vaisseau actif"

        # Log notable events
        if any(keyword in line.lower() for keyword in ["spawn", "login", "quit", "crash", "refine", "cargo", "station", "quantum"]):
            # Short clean message
            clean_msg = line[:140] + ("..." if len(line) > 140 else "")
            self._add_event("Telemetry", clean_msg)
