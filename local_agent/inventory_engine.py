"""
Inventory, Minerals, Blueprints and Resource Requests Engine
Manages Host inventory, crafting recipes, orders, and gathering bounties.
"""

import json
import os
import time
from typing import Dict, List, Any, Optional

DEFAULT_BLUEPRINTS = [
    {
        "id": "bp-001",
        "name": "Behring S7 Laser Cannon (Omnisky)",
        "category": "Armement Vaisseau",
        "description": "Canon laser lourd taille 7 à haute cadence et pénétration de bouclier.",
        "icon": "Crosshair",
        "requiredMaterials": [
            {"name": "Quantainium Raffiné", "quantity": 15, "unit": "SCU"},
            {"name": "Bexalite Raffiné", "quantity": 25, "unit": "SCU"},
            {"name": "Titanium", "quantity": 40, "unit": "SCU"}
        ],
        "craftTimeMinutes": 45,
        "feeUEC": 125000,
        "available": True
    },
    {
        "id": "bp-002",
        "name": "Bouclier Industriel S3 (FR-86 Militarized)",
        "category": "Composant Vaisseau",
        "description": "Générateur de bouclier taille 3 offrant une régénération ultra-rapide.",
        "icon": "Shield",
        "requiredMaterials": [
            {"name": "Laranite Raffinée", "quantity": 20, "unit": "SCU"},
            {"name": "Taranite Raffinée", "quantity": 12, "unit": "SCU"},
            {"name": "RMC (Matériaux Recyclés)", "quantity": 30, "unit": "SCU"}
        ],
        "craftTimeMinutes": 60,
        "feeUEC": 180000,
        "available": True
    },
    {
        "id": "bp-003",
        "name": "Fusil de Précision Behring P6-LR (Mastercraft Edition)",
        "category": "Arme FPS",
        "description": "Fusil sniper lourd anti-matériel avec optique thermique x16.",
        "icon": "Target",
        "requiredMaterials": [
            {"name": "Agricium Raffiné", "quantity": 4, "unit": "SCU"},
            {"name": "Titanium", "quantity": 6, "unit": "SCU"},
            {"name": "Gold Raffiné", "quantity": 2, "unit": "SCU"}
        ],
        "craftTimeMinutes": 20,
        "feeUEC": 35000,
        "available": True
    },
    {
        "id": "bp-004",
        "name": "Armure Lourde Citadel Exec (Full Set)",
        "category": "Armure FPS",
        "description": "Combinaison et armure lourde intégrale avec absorption balistique maximale.",
        "icon": "ShieldAlert",
        "requiredMaterials": [
            {"name": "RMC (Matériaux Recyclés)", "quantity": 12, "unit": "SCU"},
            {"name": "Titanium", "quantity": 18, "unit": "SCU"},
            {"name": "Copper", "quantity": 8, "unit": "SCU"}
        ],
        "craftTimeMinutes": 30,
        "feeUEC": 45000,
        "available": True
    },
    {
        "id": "bp-005",
        "name": "Quantum Drive S2 (Crossfield Overcharged)",
        "category": "Composant Vaisseau",
        "description": "Moteur Quantum militaire haute vitesse pour sauts rapides dans Stanton et Pyro.",
        "icon": "Zap",
        "requiredMaterials": [
            {"name": "Quantainium Raffiné", "quantity": 30, "unit": "SCU"},
            {"name": "Bexalite Raffiné", "quantity": 15, "unit": "SCU"},
            {"name": "Agricium Raffiné", "quantity": 10, "unit": "SCU"}
        ],
        "craftTimeMinutes": 75,
        "feeUEC": 250000,
        "available": True
    },
    {
        "id": "bp-006",
        "name": "Multi-Tool Pyro RRS + Attachement Salvage & Mining",
        "category": "Utilitaire",
        "description": "Outil multifonction avec rayon tracteur renforcé et module de réparation thermique.",
        "icon": "Wrench",
        "requiredMaterials": [
            {"name": "RMC (Matériaux Recyclés)", "quantity": 5, "unit": "SCU"},
            {"name": "Copper", "quantity": 5, "unit": "SCU"}
        ],
        "craftTimeMinutes": 10,
        "feeUEC": 15000,
        "available": True
    }
]

DEFAULT_MINERALS = [
    {"id": "mat-01", "name": "Quantainium Raffiné", "category": "Minerai Exotique", "quantity": 142, "unit": "SCU", "location": "HUR-L1 Refinery", "unitValueUEC": 88000},
    {"id": "mat-02", "name": "Bexalite Raffiné", "category": "Minerai Rare", "quantity": 210, "unit": "SCU", "location": "CRU-L1", "unitValueUEC": 44000},
    {"id": "mat-03", "name": "Taranite Raffinée", "category": "Minerai Rare", "quantity": 95, "unit": "SCU", "location": "ARC-L1", "unitValueUEC": 32000},
    {"id": "mat-04", "name": "Laranite Raffinée", "category": "Minerai Précieux", "quantity": 340, "unit": "SCU", "location": "Lorville Cargo", "unitValueUEC": 28500},
    {"id": "mat-05", "name": "Agricium Raffiné", "category": "Minerai Industriel", "quantity": 180, "unit": "SCU", "location": "HUR-L1", "unitValueUEC": 25000},
    {"id": "mat-06", "name": "RMC (Matériaux Recyclés)", "category": "Salvage Composite", "quantity": 520, "unit": "SCU", "location": "Grim HEX Depot", "unitValueUEC": 14500},
    {"id": "mat-07", "name": "Titanium", "category": "Métal Industriel", "quantity": 890, "unit": "SCU", "location": "Area18 TDD", "unitValueUEC": 8200},
    {"id": "mat-08", "name": "Gold Raffiné", "category": "Métal Précieux", "quantity": 75, "unit": "SCU", "location": "Orison Industrial", "unitValueUEC": 22000},
    {"id": "mat-09", "name": "Copper", "category": "Métal Industriel", "quantity": 640, "unit": "SCU", "location": "New Babbage", "unitValueUEC": 4500}
]

DEFAULT_RESOURCE_REQUESTS = [
    {
        "id": "req-001",
        "resourceName": "Quantainium Brut ou Raffiné",
        "targetQuantity": 100,
        "collectedQuantity": 45,
        "unit": "SCU",
        "rewardOrPriceUEC": 90000,
        "urgency": "Urgent",
        "dropoffLocation": "HUR-L1 Green Glade Station",
        "notes": "Nécessaire pour fabriquer la série de Quantum Drives militaires S2 demandés par l'escouade.",
        "status": "open",
        "createdAt": "2026-08-19 06:30",
        "contributors": [
            {"userId": "user-2", "userName": "StarPilot_Max", "quantity": 25, "timestamp": "2026-08-19 07:12"},
            {"userId": "user-3", "userName": "Miner_Ghost", "quantity": 20, "timestamp": "2026-08-19 07:45"}
        ]
    },
    {
        "id": "req-002",
        "resourceName": "RMC (Recycled Material Composite)",
        "targetQuantity": 200,
        "collectedQuantity": 160,
        "unit": "SCU",
        "rewardOrPriceUEC": 15000,
        "urgency": "Normal",
        "dropoffLocation": "Lorville L19 Hub",
        "notes": "Pour fabrication des armures lourdes Citadel et modules d'armes.",
        "status": "open",
        "createdAt": "2026-08-18 21:00",
        "contributors": [
            {"userId": "user-4", "userName": "Vulture_Scrap", "quantity": 80, "timestamp": "2026-08-19 01:15"},
            {"userId": "user-5", "userName": "Reclaimer_Crew", "quantity": 80, "timestamp": "2026-08-19 03:40"}
        ]
    }
]

class InventoryEngine:
    def __init__(self, data_file: str):
        self.data_file = data_file
        self.blueprints: List[Dict[str, Any]] = []
        self.inventory: List[Dict[str, Any]] = []
        self.resource_requests: List[Dict[str, Any]] = []
        self.orders: List[Dict[str, Any]] = []
        self.load_data()

    def load_data(self):
        """Loads data from JSON file or initializes defaults."""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.blueprints = data.get("blueprints", DEFAULT_BLUEPRINTS)
                    self.inventory = data.get("inventory", DEFAULT_MINERALS)
                    self.resource_requests = data.get("resource_requests", DEFAULT_RESOURCE_REQUESTS)
                    self.orders = data.get("orders", [])
                    self.general_inventory = data.get("general_inventory", [])
                    return
            except Exception as e:
                print(f"[InventoryEngine] Error loading {self.data_file}: {e}")

        # Default fallback
        self.blueprints = DEFAULT_BLUEPRINTS
        self.inventory = []
        self.resource_requests = DEFAULT_RESOURCE_REQUESTS
        self.orders = []
        self.general_inventory = []
        self.save_data()

    def save_data(self):
        """Persists current state to JSON file."""
        os.makedirs(os.path.dirname(self.data_file), exist_ok=True)
        data = {
            "blueprints": self.blueprints,
            "inventory": self.inventory,
            "resource_requests": self.resource_requests,
            "orders": self.orders,
            "general_inventory": getattr(self, "general_inventory", []),
            "updated_at": time.time()
        }
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def reload_from_disk(self):
        """Force reloads all data from the disk storage file."""
        self.load_data()
        return {
            "blueprints_count": len(self.blueprints),
            "inventory_count": len(self.inventory),
            "requests_count": len(self.resource_requests),
            "orders_count": len(self.orders)
        }

    def reset_inventory(self, mode: str = "empty") -> List[Dict[str, Any]]:
        """Resets inventory. If mode is 'empty' or 'zero', empties the list so nothing with 0 appears."""
        if mode == "empty" or mode == "zero":
            self.inventory = []
        else:
            self.inventory = [dict(item) for item in DEFAULT_MINERALS]
        self.save_data()
        return self.inventory

    # --- Master General Inventory (Everything the Host owns in SC) ---
    def get_general_inventory(self) -> List[Dict[str, Any]]:
        if not hasattr(self, "general_inventory"):
            self.general_inventory = []
        return self.general_inventory

    def add_general_item(self, item_data: Dict[str, Any]) -> Dict[str, Any]:
        if not hasattr(self, "general_inventory"):
            self.general_inventory = []
        new_item = {
            "id": item_data.get("id", f"gen-{int(time.time()*1000)}"),
            "name": item_data.get("name", "Objet Inconnu"),
            "category": item_data.get("category", "utilitaire"),
            "subcategory": item_data.get("subcategory", ""),
            "manufacturer": item_data.get("manufacturer", ""),
            "quantity": int(item_data.get("quantity", 1)),
            "location": item_data.get("location", "HUR-L1"),
            "condition": item_data.get("condition", "Opérationnel"),
            "estimatedValueUEC": float(item_data.get("estimatedValueUEC", 0)),
            "notes": item_data.get("notes", ""),
            "scuCapacity": item_data.get("scuCapacity"),
            "size": item_data.get("size")
        }
        self.general_inventory.insert(0, new_item)
        self.save_data()
        return new_item

    def update_general_item(self, item_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not hasattr(self, "general_inventory"):
            self.general_inventory = []
        for item in self.general_inventory:
            if item["id"] == item_id:
                item.update(updates)
                self.save_data()
                return item
        return None

    def delete_general_item(self, item_id: str) -> bool:
        if not hasattr(self, "general_inventory"):
            self.general_inventory = []
        initial_len = len(self.general_inventory)
        self.general_inventory = [i for i in self.general_inventory if i["id"] != item_id]
        if len(self.general_inventory) != initial_len:
            self.save_data()
            return True
        return False

    def reset_general_inventory(self) -> List[Dict[str, Any]]:
        self.general_inventory = []
        self.save_data()
        return self.general_inventory

    # --- Blueprints ---
    def get_blueprints(self) -> List[Dict[str, Any]]:
        return self.blueprints

    def add_blueprint(self, bp: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in bp:
            bp["id"] = f"bp-{int(time.time()*1000)}"
        self.blueprints.append(bp)
        self.save_data()
        return bp

    def update_blueprint(self, bp_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for i, bp in enumerate(self.blueprints):
            if bp["id"] == bp_id:
                self.blueprints[i].update(updates)
                self.save_data()
                return self.blueprints[i]
        return None

    def delete_blueprint(self, bp_id: str) -> bool:
        initial_len = len(self.blueprints)
        self.blueprints = [bp for bp in self.blueprints if bp["id"] != bp_id]
        if len(self.blueprints) < initial_len:
            self.save_data()
            return True
        return False

    # --- Inventory ---
    def get_inventory(self) -> List[Dict[str, Any]]:
        return self.inventory

    def update_inventory_item(self, name: str, quantity: float, unit: str = "SCU", location: str = "Station", **kwargs) -> Dict[str, Any]:
        for item in self.inventory:
            if item["name"].lower() == name.lower():
                item["quantity"] = quantity
                item["unit"] = unit
                item["location"] = location
                for k, v in kwargs.items():
                    if v is not None:
                        item[k] = v
                self.save_data()
                return item

        new_item = {
            "id": f"mat-{int(time.time()*1000)}",
            "name": name,
            "category": kwargs.get("category", "Ressource"),
            "quantity": quantity,
            "unit": unit,
            "location": location,
            "unitValueUEC": kwargs.get("unitValueUEC", 10000),
            "attachedFileType": kwargs.get("attachedFileType", "none"),
            "attachedFileName": kwargs.get("attachedFileName"),
            "attachedFileData": kwargs.get("attachedFileData"),
            "googleDriveUrl": kwargs.get("googleDriveUrl"),
            "notes": kwargs.get("notes")
        }
        self.inventory.append(new_item)
        self.save_data()
        return new_item

    def replace_inventory(self, new_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Atomically replaces the entire inventory with the extracted batch."""
        self.inventory = new_items
        self.save_data()
        return self.inventory

    # --- Resource Requests ---
    def get_resource_requests(self) -> List[Dict[str, Any]]:
        return self.resource_requests

    def create_resource_request(self, req_data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in req_data:
            req_data["id"] = f"req-{int(time.time()*1000)}"
        req_data["collectedQuantity"] = req_data.get("collectedQuantity", 0)
        req_data["contributors"] = req_data.get("contributors", [])
        req_data["status"] = "open"
        self.resource_requests.insert(0, req_data)
        self.save_data()
        return req_data

    def contribute_resource(self, req_id: str, user_id: str, user_name: str, quantity: float) -> Optional[Dict[str, Any]]:
        for req in self.resource_requests:
            if req["id"] == req_id:
                req["collectedQuantity"] = round(req["collectedQuantity"] + quantity, 2)
                req["contributors"].append({
                    "userId": user_id,
                    "userName": user_name,
                    "quantity": quantity,
                    "timestamp": time.strftime("%Y-%m-%d %H:%M")
                })
                if req["collectedQuantity"] >= req["targetQuantity"]:
                    req["status"] = "fulfilled"
                self.save_data()
                return req
        return None

    # --- Orders ---
    def get_orders(self) -> List[Dict[str, Any]]:
        return self.orders

    def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in order_data:
            order_data["id"] = f"ord-{int(time.time()*1000)}"
        order_data["status"] = "pending"
        order_data["createdAt"] = time.strftime("%Y-%m-%d %H:%M")
        self.orders.insert(0, order_data)
        self.save_data()
        return order_data

    def update_order_status(self, order_id: str, new_status: str) -> Optional[Dict[str, Any]]:
        for ord in self.orders:
            if ord["id"] == order_id:
                ord["status"] = new_status
                ord["updatedAt"] = time.strftime("%Y-%m-%d %H:%M")
                self.save_data()
                return ord
        return None

    def update_order_price(self, order_id: str, discount_type: str, discount_value: float, discount_reason: str = "", custom_price: Optional[float] = None) -> Optional[Dict[str, Any]]:
        for ord in self.orders:
            if ord["id"] == order_id:
                base = ord.get("baseFeeUEC", ord.get("totalFeeUEC", 0))
                ord["baseFeeUEC"] = base
                ord["discountType"] = discount_type
                ord["discountValue"] = discount_value
                ord["discountReason"] = discount_reason
                
                if discount_type == "free":
                    ord["totalFeeUEC"] = 0
                elif discount_type == "percent":
                    disc = round((base * discount_value) / 100)
                    ord["totalFeeUEC"] = max(0, base - disc)
                elif discount_type == "fixed":
                    ord["totalFeeUEC"] = max(0, base - discount_value)
                elif discount_type == "custom" and custom_price is not None:
                    ord["totalFeeUEC"] = max(0, custom_price)
                
                ord["updatedAt"] = time.strftime("%Y-%m-%d %H:%M")
                self.save_data()
                return ord
        return None
