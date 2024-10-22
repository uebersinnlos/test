import axios from 'axios';
import { load, dump } from 'js-yaml';

const API_URL = 'http://localhost:3001/api';

interface Server {
  id?: number;
  serverName: string;
  standort: string;
  dmz: string;
  verfuegbarkeit: string;
  schutzbedarf: string;
  artDerUmgebung: string;
  fqdnProd: string;
  fqdnAdmin: string;
  ipProd: string;
  ipAdmin: string;
  betriebssystem: string;
  dbms: string;
  dbmsEdition: string;
  majorRelease: string;
  kunde: string;
  instanzname: string;
  verbindungsart: string;
  sicherungsmethode: string;
  verfahrenZweck: string;
  kommentar: string;
  clustername: string;
  itsmBusinessService: string;
  lebenszyklus: string;
  supportEnde: string;
  anzeigename: string;
  ccUndMem: string;
  service: string;
}

export async function getServers(): Promise<Server[]> {
  const response = await axios.get(`${API_URL}/servers`);
  return response.data;
}

export async function addServer(serverData: Omit<Server, 'id'>): Promise<void> {
  await axios.post(`${API_URL}/servers`, serverData);
}

export async function updateServer(updatedServer: Server): Promise<void> {
  await axios.put(`${API_URL}/servers/${updatedServer.id}`, updatedServer);
}

export async function searchServers(query: string): Promise<Server[]> {
  const servers = await getServers();
  return servers.filter((server) =>
    Object.values(server).some((value) =>
      String(value).toLowerCase().includes(query.toLowerCase())
    )
  );
}

export async function importYAML(yamlData: string): Promise<void> {
  await axios.post(`${API_URL}/import`, { yamlData });
}

export async function exportYAML(): Promise<string> {
  const response = await axios.get(`${API_URL}/export`, { responseType: 'blob' });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(response.data);
  });
}