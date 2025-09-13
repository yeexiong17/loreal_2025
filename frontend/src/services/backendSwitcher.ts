/**
 * Backend Switcher Service
 * Easy way to switch between different backend APIs
 */

export interface BackendConfig {
  name: string;
  url: string;
  port: number;
  description: string;
  features: string[];
  cost: string;
  speed: string;
}

export const BACKEND_CONFIGS: BackendConfig[] = [
  {
    name: "OpenAI",
    url: "http://localhost:8000",
    port: 8000,
    description: "Full AI analysis with GPT-4o-mini",
    features: ["Sentiment", "Spam Detection", "Category", "Quality", "GPT-4o-mini"],
    cost: "Higher (uses OpenAI API)",
    speed: "Medium"
  },
  {
    name: "Hugging Face",
    url: "http://localhost:8001", 
    port: 8001,
    description: "Full analysis with Hugging Face models",
    features: ["Sentiment (HF)", "Spam (HF)", "Category (HF)", "Quality (HF)"],
    cost: "Free (local models)",
    speed: "Fast"
  }
];

class BackendSwitcher {
  private currentBackend: BackendConfig = BACKEND_CONFIGS[1]; // Default to HF
  private listeners: ((backend: BackendConfig) => void)[] = [];

  constructor() {
    // Load saved backend from localStorage
    const saved = localStorage.getItem('selectedBackend');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const found = BACKEND_CONFIGS.find(b => b.name === parsed.name);
        if (found) {
          this.currentBackend = found;
        }
      } catch (e) {
        console.warn('Failed to load saved backend config');
      }
    }
  }

  getCurrentBackend(): BackendConfig {
    return this.currentBackend;
  }

  setBackend(backendName: string): boolean {
    const backend = BACKEND_CONFIGS.find(b => b.name === backendName);
    if (backend) {
      this.currentBackend = backend;
      localStorage.setItem('selectedBackend', JSON.stringify(backend));
      
      // Notify listeners
      this.listeners.forEach(listener => listener(backend));
      
      console.log(`🔄 Switched to ${backend.name} backend: ${backend.url}`);
      return true;
    }
    return false;
  }

  getApiUrl(): string {
    return this.currentBackend.url;
  }

  getBackendInfo(): string {
    return `${this.currentBackend.name} Backend - ${this.currentBackend.description}`;
  }

  addListener(listener: (backend: BackendConfig) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (backend: BackendConfig) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  async checkBackendHealth(): Promise<{ healthy: boolean; info?: any }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`${this.currentBackend.url}/health`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return { healthy: true, info: data };
      }
      return { healthy: false };
    } catch (error) {
      console.log(`Backend ${this.currentBackend.name} not responding:`, error);
      return { healthy: false };
    }
  }
}

// Export singleton instance
export const backendSwitcher = new BackendSwitcher();

// Export the current API URL for use in api.ts
export const getCurrentApiUrl = () => backendSwitcher.getApiUrl();
