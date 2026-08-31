import { Blueprint, BlueprintCategory, BlueprintIngredient } from '../types';

const API_BASE_URL = 'https://api.star-citizen.wiki/api';

interface ApiBlueprintItem {
  uuid: string;
  key?: string;
  output_name?: string;
  output_class?: string;
  craft_time_seconds?: number;
  ingredients?: Array<{
    name: string;
    kind: string;
    resource_type_uuid?: string;
    quantity_scu?: number;
    quantity?: number;
  }>;
  output?: {
    uuid: string;
    name: string;
    class: string;
    type: string;
    type_label: string;
    subtype?: string;
    sub_type?: string;
    grade?: string;
  };
}

export class StarCitizenApiService {
  private static CACHE_KEY = 'sc_api_blueprints_cache_v1';
  private static CACHE_TIMESTAMP_KEY = 'sc_api_blueprints_cache_ts_v1';
  private static CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24h

  static async fetchBlueprints(pageSize = 100, pageNumber = 1): Promise<{ blueprints: Blueprint[]; total: number } | null> {
    // Check cache if page 1
    if (pageNumber === 1 && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(this.CACHE_KEY);
        const cacheTs = localStorage.getItem(this.CACHE_TIMESTAMP_KEY);
        if (cached && cacheTs && (Date.now() - parseInt(cacheTs, 10)) < this.CACHE_DURATION_MS) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { blueprints: parsed, total: parsed.length };
          }
        }
      } catch {
        // Ignore cache parse error
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/blueprints?page[size]=${pageSize}&page[number]=${pageNumber}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const json = await response.json();
      const rawData = (json.data || []) as ApiBlueprintItem[];
      const total = json.meta?.total || rawData.length;

      const blueprints: Blueprint[] = rawData.map(raw => this.transformApiBlueprint(raw));

      if (pageNumber === 1 && typeof window !== 'undefined' && blueprints.length > 0) {
        try {
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(blueprints));
          localStorage.setItem(this.CACHE_TIMESTAMP_KEY, String(Date.now()));
        } catch {
          // Quota exceeded
        }
      }

      return { blueprints, total };
    } catch (e) {
      console.warn('Could not fetch blueprints from Star Citizen Wiki API:', e);
      return null;
    }
  }

  static transformApiBlueprint(raw: ApiBlueprintItem): Blueprint {
    const output = raw.output;
    const name = output?.name || raw.output_name || 'Item Inconnu';
    const type = output?.type || '';
    const typeLabel = output?.type_label || type || 'Composant';
    const category = this.mapTypeToCategory(type, output?.subtype || output?.sub_type);

    const ingredients: BlueprintIngredient[] = (raw.ingredients || []).map(ing => {
      const isItem = ing.kind === 'item' || (ing.quantity !== null && ing.quantity !== undefined && !ing.quantity_scu);
      const resId = ing.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return {
        resourceId: resId,
        resourceName: ing.name,
        quantitySCU: ing.quantity_scu || (ing.quantity ? ing.quantity / 100 : 0.1),
        isItem,
        itemQuantity: ing.quantity || undefined
      };
    });

    return {
      id: `api_${raw.uuid}`,
      key: raw.key,
      name,
      category,
      typeLabel,
      subtype: output?.subtype || output?.sub_type,
      grade: output?.grade || '1',
      craftTimeSeconds: raw.craft_time_seconds || 600,
      ingredients,
      description: `Plan officiel Star Citizen extrait des fichiers de jeu (Catégorie: ${typeLabel}).`
    };
  }

  static mapTypeToCategory(type: string, subtype?: string): BlueprintCategory {
    const t = (type || '').toLowerCase();
    const st = (subtype || '').toLowerCase();

    if (t.includes('weaponpersonal') || t.includes('personal') || t.includes('attachment') || st.includes('rifle') || st.includes('pistol') || st.includes('smg') || st.includes('sniper')) {
      return 'armes_fps';
    }
    if (t.includes('weapongun') || t.includes('weaponmining') || t.includes('gun') || t.includes('missile') || t.includes('turret')) {
      return 'armes_vaisseau';
    }
    if (t.includes('armor') || t.includes('helmet') || t.includes('torso') || t.includes('legs') || t.includes('arms') || t.includes('backpack') || t.includes('char_clothing')) {
      return 'armures';
    }
    if (t.includes('quantum') || t.includes('shield') || t.includes('cooler') || t.includes('powerplant') || t.includes('radar') || t.includes('dockingcollar')) {
      return 'vaisseau';
    }
    if (t.includes('tractor') || t.includes('miningmodifier') || t.includes('salvage') || t.includes('tool')) {
      return 'outils';
    }
    if (t.includes('container')) {
      return 'composants_industriels';
    }
    return 'divers';
  }
}
