import { Scenario, Category } from '../types/scenario';

const SUPABASE_REST_URL = import.meta.env.VITE_SUPABASE_URL || 'https://sxavoyplmlgzlctphnxb.supabase.co/rest/v1';

export class SupabaseService {
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

  // --- SCENARIO CRUD (PURE SUPABASE REST API) ---

  static async fetchScenarios(): Promise<Scenario[]> {
    const key = this.getApiKey();
    if (!key) return [];

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/scenarios?select=*`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data as Scenario[];
        }
      }
    } catch (err) {
      console.error('Supabase fetchScenarios error:', err);
    }
    return [];
  }

  static async saveScenario(scenario: Scenario): Promise<boolean> {
    const key = this.getApiKey();
    if (!key) return false;

    // Cleansed payload strictly matching Supabase Postgres table columns
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
      console.error('Supabase saveScenario error:', err);
      return false;
    }
  }

  static async deleteScenario(id: string): Promise<boolean> {
    const key = this.getApiKey();
    if (!key) return false;

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/scenarios?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (err) {
      console.error('Supabase deleteScenario error:', err);
      return false;
    }
  }

  // --- CATEGORY CRUD (PURE SUPABASE REST API) ---

  static async fetchCategories(): Promise<Category[]> {
    const key = this.getApiKey();
    if (!key) return [];

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/categories?select=*`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          return data as Category[];
        }
      }
    } catch (err) {
      console.error('Supabase fetchCategories error:', err);
    }
    return [];
  }

  static async saveCategory(category: Category): Promise<boolean> {
    const key = this.getApiKey();
    if (!key) return false;

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
      console.error('Supabase saveCategory error:', err);
      return false;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    const key = this.getApiKey();
    if (!key) return false;

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/categories?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (err) {
      console.error('Supabase deleteCategory error:', err);
      return false;
    }
  }
}
