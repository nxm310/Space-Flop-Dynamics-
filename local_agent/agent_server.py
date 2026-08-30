"""
Star Citizen Local Agent - REST & Realtime API Server
Provides local endpoints for the Web App with zero external pip dependencies.
Uses Python's standard library `http.server` with full CORS support.
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from sc_log_watcher import StarCitizenLogWatcher
from inventory_engine import InventoryEngine

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "inventory_store.json")

def load_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "sc_install_path": r"C:\Program Files\Roberts Space Industries\StarCitizen\LIVE",
        "log_file_path": r"C:\Program Files\Roberts Space Industries\StarCitizen\LIVE\Game.log",
        "server_host": "127.0.0.1",
        "server_port": 5500,
        "crafter_profile": {
            "callsign": "Host-MasterCrafter",
            "org": "Aegis Syndicate",
            "primary_hangar": "Lorville / HUR-L1"
        }
    }

def save_config(new_config):
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(new_config, f, indent=2, ensure_ascii=False)

def detect_sc_installations():
    """Scans all common Windows drive paths for Star Citizen installations."""
    found = []
    drives = ["C", "D", "E", "F", "G", "H", "I"]
    common_subpaths = [
        r"Program Files\Roberts Space Industries\StarCitizen\LIVE",
        r"Program Files (x86)\Roberts Space Industries\StarCitizen\LIVE",
        r"Roberts Space Industries\StarCitizen\LIVE",
        r"SC\StarCitizen\LIVE",
        r"StarCitizen\LIVE",
        r"Games\StarCitizen\LIVE",
        r"Jeux\StarCitizen\LIVE",
        r"RSI\StarCitizen\LIVE"
    ]
    for d in drives:
        for sub in common_subpaths:
            full_path = f"{d}:\\{sub}"
            log_candidate = os.path.join(full_path, "Game.log")
            if os.path.exists(full_path) and os.path.exists(log_candidate):
                found.append({
                    "path": full_path,
                    "log_path": log_candidate,
                    "log_size": os.path.getsize(log_candidate),
                    "is_current": full_path.lower() == config.get("sc_install_path", "").lower()
                })
    return found

config = load_config()
watcher = StarCitizenLogWatcher(config.get("log_file_path", r"D:\SC\StarCitizen\LIVE\Game.log"))
inventory = InventoryEngine(DATA_FILE)

class AgentRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        
        if path == "" or path == "/api/health":
            self._send_json({"status": "online", "name": "SC-Crafting-LocalAgent", "version": "1.0.0"})
            return

        if path == "/api/config":
            detected = detect_sc_installations()
            self._send_json({
                "config": config,
                "detected_installations": detected,
                "log_file_exists": os.path.exists(config.get("log_file_path", "")),
                "log_file_size": os.path.getsize(config.get("log_file_path")) if os.path.exists(config.get("log_file_path", "")) else 0
            })
            return

        if path == "/api/status":
            state = watcher.get_state()
            state["crafter_profile"] = config.get("crafter_profile", {})
            self._send_json(state)
            return

        if path == "/api/inventory":
            self._send_json({"inventory": inventory.get_inventory()})
            return

        if path == "/api/general-inventory":
            self._send_json({"general_inventory": inventory.get_general_inventory()})
            return

        if path == "/api/blueprints":
            self._send_json({"blueprints": inventory.get_blueprints()})
            return

        if path == "/api/resource-requests":
            self._send_json({"resource_requests": inventory.get_resource_requests()})
            return

        if path == "/api/orders":
            self._send_json({"orders": inventory.get_orders()})
            return

        # 404
        self._send_json({"error": "Endpoint not found", "path": path}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            body = {}

        if path == "/api/config":
            new_sc_path = body.get("sc_install_path")
            if new_sc_path:
                config["sc_install_path"] = new_sc_path
                # Normalize log file path
                if new_sc_path.lower().endswith("game.log"):
                    config["log_file_path"] = new_sc_path
                    config["sc_install_path"] = os.path.dirname(new_sc_path)
                else:
                    config["log_file_path"] = os.path.join(new_sc_path, "Game.log")

            if "crafter_profile" in body:
                config["crafter_profile"] = body["crafter_profile"]

            save_config(config)
            watcher.set_log_path(config["log_file_path"])

            exists = os.path.exists(config["log_file_path"])
            size = os.path.getsize(config["log_file_path"]) if exists else 0

            self._send_json({
                "success": True,
                "config": config,
                "log_file_exists": exists,
                "log_file_size": size
            })
            return

        if path == "/api/inventory/update":
            name = body.get("name")
            qty = float(body.get("quantity", 0))
            unit = body.get("unit", "SCU")
            loc = body.get("location", "Station")
            item = inventory.update_inventory_item(
                name=name,
                quantity=qty,
                unit=unit,
                location=loc,
                category=body.get("category"),
                unitValueUEC=body.get("unitValueUEC"),
                attachedFileType=body.get("attachedFileType"),
                attachedFileName=body.get("attachedFileName"),
                attachedFileData=body.get("attachedFileData"),
                googleDriveUrl=body.get("googleDriveUrl"),
                notes=body.get("notes")
            )
            self._send_json({"success": True, "item": item})
            return

        if path == "/api/inventory/batch-replace":
            items = body.get("items", [])
            new_inv = inventory.replace_inventory(items)
            self._send_json({
                "success": True, 
                "message": f"{len(items)} matériaux importés avec succès", 
                "count": len(items),
                "inventory": new_inv
            })
            return

        if path == "/api/inventory/reset":
            mode = body.get("mode", "default")
            new_inv = inventory.reset_inventory(mode)
            self._send_json({
                "success": True, 
                "message": "Stock réinitialisé avec succès", 
                "inventory": new_inv
            })
            return

        if path == "/api/reload-source":
            # Force watcher to reload log file
            log_path = config.get("log_file_path", "")
            watcher.set_log_path(log_path)
            stats = inventory.reload_from_disk()
            state = watcher.get_state()
            self._send_json({
                "success": True,
                "message": "Données rechargées depuis le fichier source Game.log et le disque",
                "stats": stats,
                "inventory": inventory.get_inventory(),
                "telemetry": state
            })
            return

        if path == "/api/general-inventory":
            created = inventory.add_general_item(body)
            self._send_json({"success": True, "item": created})
            return

        if path == "/api/general-inventory/update":
            item_id = body.get("id")
            updated = inventory.update_general_item(item_id, body.get("updates", {}))
            if updated:
                self._send_json({"success": True, "item": updated})
            else:
                self._send_json({"error": "Item non trouvé"}, 404)
            return

        if path == "/api/general-inventory/delete":
            item_id = body.get("id")
            success = inventory.delete_general_item(item_id)
            self._send_json({"success": success})
            return

        if path == "/api/general-inventory/reset":
            res = inventory.reset_general_inventory()
            self._send_json({"success": True, "general_inventory": res})
            return

        if path == "/api/blueprints":
            created = inventory.add_blueprint(body)
            self._send_json({"success": True, "blueprint": created})
            return

        if path == "/api/resource-requests":
            created = inventory.create_resource_request(body)
            self._send_json({"success": True, "request": created})
            return

        if path == "/api/resource-requests/contribute":
            req_id = body.get("requestId")
            uid = body.get("userId", "anonymous")
            uname = body.get("userName", "Inconnu")
            qty = float(body.get("quantity", 0))
            updated = inventory.contribute_resource(req_id, uid, uname, qty)
            if updated:
                self._send_json({"success": True, "request": updated})
            else:
                self._send_json({"error": "Demande introuvable"}, 404)
            return

        if path == "/api/orders":
            created = inventory.create_order(body)
            self._send_json({"success": True, "order": created})
            return

        if path == "/api/orders/status":
            ord_id = body.get("orderId")
            status = body.get("status")
            updated = inventory.update_order_status(ord_id, status)
            if updated:
                self._send_json({"success": True, "order": updated})
            else:
                self._send_json({"error": "Commande introuvable"}, 404)
            return

        if path == "/api/orders/price":
            ord_id = body.get("orderId")
            disc_type = body.get("discountType", "none")
            disc_val = float(body.get("discountValue", 0))
            disc_reason = body.get("discountReason", "")
            custom_price = body.get("customPrice")
            if custom_price is not None:
                custom_price = float(custom_price)
            updated = inventory.update_order_price(ord_id, disc_type, disc_val, disc_reason, custom_price)
            if updated:
                self._send_json({"success": True, "order": updated})
            else:
                self._send_json({"error": "Commande introuvable"}, 404)
            return

        self._send_json({"error": "Endpoint not found", "path": path}, 404)

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            body = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            body = {}

        if path.startswith("/api/blueprints/"):
            bp_id = path.split("/")[-1]
            updated = inventory.update_blueprint(bp_id, body)
            if updated:
                self._send_json({"success": True, "blueprint": updated})
            else:
                self._send_json({"error": "Blueprint introuvable"}, 404)
            return

        self._send_json({"error": "Endpoint not found"}, 404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        if path.startswith("/api/blueprints/"):
            bp_id = path.split("/")[-1]
            if inventory.delete_blueprint(bp_id):
                self._send_json({"success": True, "deleted": bp_id})
            else:
                self._send_json({"error": "Blueprint introuvable"}, 404)
            return

        self._send_json({"error": "Endpoint not found"}, 404)

    def log_message(self, format, *args):
        # Clean logging
        pass

def run_server():
    host = config.get("server_host", "127.0.0.1")
    port = config.get("server_port", 5500)
    server_address = (host, port)
    
    # Start log watcher
    watcher.start()
    
    httpd = HTTPServer(server_address, AgentRequestHandler)
    print("=" * 60)
    print(f"[*] Star Citizen Local Agent démarré avec succès !")
    print(f"[*] API REST locale : http://{host}:{port}")
    print(f"[*] Surveillance Log : {config.get('log_file_path')}")
    print(f"[*] Appuyez sur Ctrl+C pour arrêter.")
    print("=" * 60)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt de l'agent...")
    finally:
        watcher.stop()
        httpd.server_close()

if __name__ == "__main__":
    run_server()
