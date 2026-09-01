import { Scenario, Category } from '../types/scenario';

const SUPABASE_REST_URL = 'https://sxavoyplmlgzlctphnxb.supabase.co/rest/v1';

export class SupabaseService {
  private static SCENARIOS_KEY = 'cekat_ai_custom_scenarios_v2';
  private static CATEGORIES_KEY = 'cekat_ai_custom_categories_v2';
  private static API_KEY_STORAGE = 'cekat_supabase_anon_key';

  static getApiKey(): string {
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
            // Also sync to local storage
            localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(data));
            return data as Scenario[];
          }
        }
      } catch (err) {
        console.warn('Supabase fetchScenarios fallback to localStorage:', err);
      }
    }

    const localData = localStorage.getItem(this.SCENARIOS_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  static async saveScenario(scenario: Scenario): Promise<boolean> {
    // Local persistence
    const existing = await this.fetchScenarios();
    const idx = existing.findIndex(s => s.id === scenario.id);
    if (idx >= 0) {
      existing[idx] = scenario;
    } else {
      existing.push(scenario);
    }
    localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(existing));

    // Supabase REST Persistence
    const key = this.getApiKey();
    if (!key) return true;

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/scenarios`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(scenario)
      });
      return response.ok;
    } catch (err) {
      return true;
    }
  }

  static async deleteScenario(id: string): Promise<boolean> {
    const existing = await this.fetchScenarios();
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
            localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(data));
            return data as Category[];
          }
        }
      } catch (err) {
        console.warn('Supabase fetchCategories fallback to localStorage:', err);
      }
    }

    const localData = localStorage.getItem(this.CATEGORIES_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  static async saveCategory(category: Category): Promise<boolean> {
    const existing = await this.fetchCategories();
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
    const existing = await this.fetchCategories();
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
