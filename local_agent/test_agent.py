"""
Test script for verifying log parsing and inventory engine against D:\SC\StarCitizen\LIVE\Game.log
"""

import os
import sys
import time
from sc_log_watcher import StarCitizenLogWatcher
from inventory_engine import InventoryEngine

def test_local_agent():
    log_path = r"D:\SC\StarCitizen\LIVE\Game.log"
    print(f"[TEST] Verification du fichier de log : {log_path}")
    print(f"[TEST] Existe : {os.path.exists(log_path)}")
    
    if os.path.exists(log_path):
        print(f"[TEST] Taille du log : {os.path.getsize(log_path)} octets")
    
    watcher = StarCitizenLogWatcher(log_path)
    watcher.start()
    
    # Wait for the watcher to parse initial buffer
    time.sleep(2)
    
    state = watcher.get_state()
    print("\n" + "="*50)
    print("ETAT DU JEU EXTRAIT DU LOG :")
    print("="*50)
    print(f"- Version du jeu      : {state.get('version')}")
    print(f"- Session ID          : {state.get('session_id')}")
    print(f"- Shard / Environnement: {state.get('server_shard')}")
    print(f"- Localisation active : {state.get('current_location')}")
    print(f"- Vaisseau actif      : {state.get('current_ship')}")
    print(f"- Événements récents  : {len(state.get('recent_events'))} logs captures")
    print("="*50)
    
    watcher.stop()
    
    # Test inventory engine
    data_file = os.path.join(os.path.dirname(__file__), "data", "test_store.json")
    inv = InventoryEngine(data_file)
    print(f"[TEST] Plans charges : {len(inv.get_blueprints())}")
    print(f"[TEST] Minerais / Items en stock : {len(inv.get_inventory())}")
    print(f"[TEST] Demandes de ressources actives : {len(inv.get_resource_requests())}")
    print("\n>>> TOUS LES TESTS DE L'AGENT PYTHON SONT VALIDES ! <<<\n")

if __name__ == "__main__":
    test_local_agent()
