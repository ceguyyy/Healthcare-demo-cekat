import { Scenario } from '../types/scenario';

const SUPABASE_REST_URL = 'https://sxavoyplmlgzlctphnxb.supabase.co/rest/v1';

export class SupabaseService {
  private static STORAGE_KEY = 'cekat_ai_custom_scenarios';

  static async fetchScenarios(): Promise<Scenario[]> {
    try {
      const response = await fetch(`${SUPABASE_REST_URL}/scenarios?select=*`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data as Scenario[];
        }
      }
    } catch (err) {
      console.warn('Supabase REST endpoint offline or unauthenticated, using local storage fallback:', err);
    }

    // Fallback to local storage
    const localData = localStorage.getItem(this.STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  }

  static async saveScenario(scenario: Scenario): Promise<boolean> {
    // Save to local storage first
    try {
      const existing = await this.fetchScenarios();
      const idx = existing.findIndex(s => s.id === scenario.id);
      if (idx >= 0) {
        existing[idx] = scenario;
      } else {
        existing.push(scenario);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }

    // Try posting to Supabase REST endpoint
    try {
      const response = await fetch(`${SUPABASE_REST_URL}/scenarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(scenario)
      });
      return response.ok;
    } catch (err) {
      console.warn('Supabase post fallback to local state:', err);
      return true; // Local save succeeded
    }
  }

  static async deleteScenario(id: string): Promise<boolean> {
    try {
      const existing = await this.fetchScenarios();
      const filtered = existing.filter(s => s.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {}

    try {
      const response = await fetch(`${SUPABASE_REST_URL}/scenarios?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (err) {
      return true;
    }
  }
}
