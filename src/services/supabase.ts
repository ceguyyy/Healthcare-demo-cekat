import { Scenario, Category } from '../types/scenario';

const SUPABASE_REST_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sxavoyplmlgzlctphnxb.supabase.co/rest/v1';

export class SupabaseService {
  private static SCENARIOS_KEY = 'cekat_ai_custom_scenarios_v2';
  private static CATEGORIES_KEY = 'cekat_ai_custom_categories_v2';
  private static API_KEY_STORAGE = 'cekat_supabase_anon_key';

  static getApiKey(): string {
    // 1. Check Service Role Key first (Master Admin Access)
    const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey && serviceKey.trim()) return serviceKey.trim();

    // 2. Check Anon Key
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (envKey && envKey.trim()) return envKey.trim();

    // 3. Fallback to localStorage user entered key
    return localStorage.getItem(this.API_KEY_STORAGE) || '';
  }

  static setApiKey(key: string): void {
    localStorage.setItem(this.API_KEY_STORAGE, key.trim());
  }

  private static getHeaders() {
    const key = this.getApiKey();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (key) {
      headers['apikey'] = key;
      headers['Authorization'] = `Bearer ${key}`;
    }
    return headers;
  }

  // --- SCENARIO CRUD ---

  static async fetchScenarios(): Promise<Scenario[]> {
    const localData = localStorage.getItem(this.SCENARIOS_KEY);
    const localScs: Scenario[] = localData ? JSON.parse(localData) : [];

    const key = this.getApiKey();
    if (key) {
      try {
        const response = await fetch(`${SUPABASE_REST_URL}/scenarios?select=*`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            // Merge remote items with local items so imported scenarios in localStorage are NEVER erased!
            const merged = [...data];
            localScs.forEach(loc => {
              const idx = merged.findIndex(m => m.id === loc.id);
              if (idx < 0) {
                merged.push(loc);
              }
            });
            localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(merged));
            return merged as Scenario[];
          }
        }
      } catch (err) {
        console.warn('Supabase fetchScenarios fallback to localStorage:', err);
      }
    }

    return localScs;
  }

  static async saveScenario(scenario: Scenario): Promise<boolean> {
    // 1. Immediately save full scenario object to localStorage
    const localData = localStorage.getItem(this.SCENARIOS_KEY);
    const existing: Scenario[] = localData ? JSON.parse(localData) : [];
    const idx = existing.findIndex(s => s.id === scenario.id);
    if (idx >= 0) {
      existing[idx] = scenario;
    } else {
      existing.push(scenario);
    }
    localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(existing));

    // 2. Sync to Supabase REST API using cleansed payload (only existing Postgres columns)
    const key = this.getApiKey();
    if (!key) return true;

    const supabasePayload: Record<string, any> = {
      id: scenario.id,
      categoryId: scenario.categoryId || 'healthcare',
      name: scenario.name,
      title: scenario.title,
      tag: scenario.tag || 'Core Feature',
      triggerType: scenario.triggerType || 'INBOUND_USER',
      outboundPill: scenario.outboundPill || null,
      description: scenario.description || '',
      initialText: scenario.initialText || '',
      cekatComponents: scenario.cekatComponents || [],
      apiScopes: scenario.apiScopes || [],
      ruleNote: scenario.ruleNote || '',
      stepsDetail: scenario.stepsDetail || [],
      steps: scenario.steps || []
    };

    if (scenario.saAuthor) {
      supabasePayload.saAuthor = scenario.saAuthor;
    }

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/scenarios`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(supabasePayload)
      });
      return response.ok;
    } catch (err) {
      return true;
    }
  }

  static async deleteScenario(id: string): Promise<boolean> {
    const localData = localStorage.getItem(this.SCENARIOS_KEY);
    const existing: Scenario[] = localData ? JSON.parse(localData) : [];
    const filtered = existing.filter(s => s.id !== id);
    localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(filtered));

    const key = this.getApiKey();
    if (!key) return true;

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/scenarios?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (err) {
      return true;
    }
  }

  // --- CATEGORY CRUD ---

  static async fetchCategories(): Promise<Category[]> {
    const localData = localStorage.getItem(this.CATEGORIES_KEY);
    const localCats: Category[] = localData ? JSON.parse(localData) : [];

    const key = this.getApiKey();
    if (key) {
      try {
        const response = await fetch(`${SUPABASE_REST_URL}/categories?select=*`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const merged = [...data];
            localCats.forEach(loc => {
              const idx = merged.findIndex(m => m.id === loc.id);
              if (idx < 0) {
                merged.push(loc);
              }
            });
            localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(merged));
            return merged as Category[];
          }
        }
      } catch (err) {
        console.warn('Supabase fetchCategories fallback to localStorage:', err);
      }
    }

    return localCats;
  }

  static async saveCategory(category: Category): Promise<boolean> {
    const localData = localStorage.getItem(this.CATEGORIES_KEY);
    const existing: Category[] = localData ? JSON.parse(localData) : [];
    const idx = existing.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      existing[idx] = category;
    } else {
      existing.push(category);
    }
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(existing));

    const key = this.getApiKey();
    if (!key) return true;

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/categories`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(category)
      });
      return response.ok;
    } catch (err) {
      return true;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const localData = localStorage.getItem(this.CATEGORIES_KEY);
    const existing: Category[] = localData ? JSON.parse(localData) : [];
    const filtered = existing.filter(c => c.id !== id);
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(filtered));

    const key = this.getApiKey();
    if (!key) return true;

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/categories?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (err) {
      return true;
    }
  }
}
