const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5064";

export const FitnessAPI = {
  // === MEDIA ===
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/media/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.url;
  },

  // === EXCEL IMPORT ===
  async importSpreadsheet(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/importexport/import`, { method: "POST", body: formData });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // === SESSION LOGGING (BUG 4 FIX) ===
  async logSession(sessionData: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/sessions/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // === PROGRAM SYNC ===
  async getProgram(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/program`);
    if (!res.ok) throw new Error("Failed to fetch program");
    return res.json();
  },

  async syncProgram(phases: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/api/program/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(phases)
    });
    if (!res.ok) throw new Error("Failed to sync program");
    return res.json();
  }
};