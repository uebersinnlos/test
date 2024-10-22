import React, { useState, useEffect } from 'react';
import { getServers, addServer, updateServer, importYAML, exportYAML } from './db';
import { Download, Plus, Search, Upload, Edit } from 'lucide-react';

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

const INITIAL_SERVER: Omit<Server, 'id'> = {
  serverName: '',
  standort: '',
  dmz: '',
  verfuegbarkeit: '',
  schutzbedarf: '',
  artDerUmgebung: '',
  fqdnProd: '',
  fqdnAdmin: '',
  ipProd: '',
  ipAdmin: '',
  betriebssystem: '',
  dbms: '',
  dbmsEdition: '',
  majorRelease: '',
  kunde: '',
  instanzname: '',
  verbindungsart: '',
  sicherungsmethode: '',
  verfahrenZweck: '',
  kommentar: '',
  clustername: '',
  itsmBusinessService: '',
  lebenszyklus: '',
  supportEnde: '',
  anzeigename: '',
  ccUndMem: '',
  service: ''
};

const COLUMNS = [
  { key: 'serverName', label: 'Server' },
  { key: 'standort', label: 'Standort' },
  { key: 'dmz', label: 'DMZ' },
  { key: 'verfuegbarkeit', label: 'Verfügbarkeit' },
  { key: 'schutzbedarf', label: 'Schutzbedarf' },
  { key: 'artDerUmgebung', label: 'Art der Umgebung' },
  { key: 'fqdnProd', label: 'FQDN (Prod)' },
  { key: 'fqdnAdmin', label: 'FQDN (Admin)' },
  { key: 'ipProd', label: 'IP (Prod)' },
  { key: 'ipAdmin', label: 'IP (Admin)' },
  { key: 'betriebssystem', label: 'Betriebssystem' },
  { key: 'dbms', label: 'DBMS' },
  { key: 'dbmsEdition', label: 'DBMS Edition' },
  { key: 'majorRelease', label: 'Major Release' },
  { key: 'kunde', label: 'Kunde' },
  { key: 'instanzname', label: 'Instanzname' },
  { key: 'verbindungsart', label: 'Verbindungsart' },
  { key: 'sicherungsmethode', label: 'Sicherungsmethode' },
  { key: 'verfahrenZweck', label: 'Verfahren / Zweck' },
  { key: 'kommentar', label: 'Kommentar' },
  { key: 'clustername', label: 'Clustername' },
  { key: 'itsmBusinessService', label: 'ITSM Business Service' },
  { key: 'lebenszyklus', label: 'Lebenszyklus' },
  { key: 'supportEnde', label: 'Support Ende' },
  { key: 'anzeigename', label: 'Anzeigename' },
  { key: 'ccUndMem', label: 'CC und MEM' },
  { key: 'service', label: 'Service' }
];

function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [newServer, setNewServer] = useState<Omit<Server, 'id'>>(INITIAL_SERVER);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>(
    Object.fromEntries(COLUMNS.map(col => [col.key, '']))
  );
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    const fetchedServers = await getServers();
    setServers(fetchedServers);
  };

  const handleAddServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newServer.serverName.trim()) {
      await addServer(newServer);
      await fetchServers();
      setNewServer(INITIAL_SERVER);
      setShowForm(false);
    }
  };

  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingServer && editingServer.serverName.trim()) {
      await updateServer(editingServer);
      await fetchServers();
      setEditingServer(null);
    }
  };

  const filteredServers = servers.filter((server) => {
    return COLUMNS.every(col => 
      String(server[col.key as keyof Server])
        .toLowerCase()
        .includes(filters[col.key].toLowerCase())
    );
  });

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await getServers();
      setServers(results.filter(server => 
        Object.values(server).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      ));
    } else {
      await fetchServers();
    }
  };

  const handleYAMLUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const yamlData = event.target?.result as string;
        await importYAML(yamlData);
        await fetchServers();
      };
      reader.readAsText(file);
    }
  };

  const handleExportYAML = async () => {
    const yamlContent = await exportYAML();
    const blob = new Blob([yamlContent], { type: 'application/x-yaml;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'servers.yaml');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderForm = (data: Partial<Server>, setData: (data: any) => void, submitHandler: (e: React.FormEvent) => void, formTitle: string) => (
    <form onSubmit={submitHandler} className="mb-8 grid grid-cols-3 gap-4 bg-green-100 p-8 rounded">
      {COLUMNS.map(col => (
        <div key={col.key} className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">{col.label}</label>
          <input
            type="text"
            value={data[col.key as keyof Server] || ''}
            onChange={(e) => setData({ ...data, [col.key]: e.target.value })}
            className="border rounded p-2 mt-1"
          />
        </div>
      ))}
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center col-span-3">
        <Plus size={20} className="mr-2" />
        {formTitle}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-full mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Serverübersicht MxSQL</h1>

        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Server suchen..."
            className="border rounded p-2 flex-grow"
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center">
            <Search size={20} className="mr-2" />
            Suchen
          </button>

          <button type="button" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} className="mr-2" />
            {showForm ? 'Ausblenden' : 'Server hinzufügen'}
          </button>

          <label className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors flex items-center justify-center cursor-pointer">
            <Upload size={20} className="mr-2" />
            YAML importieren
            <input type="file" accept=".yaml,.yml" onChange={handleYAMLUpload} className="hidden" />
          </label>
          <button onClick={handleExportYAML} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors flex items-center justify-center">
            <Download size={20} className="mr-2" />
            YAML exportieren
          </button>
        </div>

        {showForm && renderForm(newServer, setNewServer, handleAddServer, "Server hinzufügen")}
        {editingServer && renderForm(editingServer, setEditingServer, handleUpdateServer, "Server aktualisieren")}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {COLUMNS.map(col => (
                  <th key={col.key} className="px-4 py-2 bg-slate-600 text-left text-white">
                    {col.label}
                    <input
                      type="text"
                      value={filters[col.key]}
                      onChange={(e) => setFilters({ ...filters, [col.key]: e.target.value })}
                      placeholder="Filtern"
                      className="border rounded p-1 mt-2 w-full text-slate-600"
                    />
                  </th>
                ))}
                <th className="px-4 py-2 bg-slate-600 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServers.map((server) => (
                <tr key={server.id} className="border-b hover:bg-gray-50">
                  {COLUMNS.map(col => (
                    <td key={col.key} className="px-4 py-2">
                      {server[col.key as keyof Server]}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <button onClick={() => setEditingServer(server)} className="text-blue-500 hover:text-blue-700">
                      <Edit size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;