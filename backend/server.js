const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs').promises;
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const YAML_FILE_PATH = path.join(__dirname, 'servers.yaml');

// Read YAML file
async function readYamlFile() {
  try {
    const fileContents = await fs.readFile(YAML_FILE_PATH, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    console.error('Error reading YAML file:', error);
    return [];
  }
}

// Write YAML file
async function writeYamlFile(data) {
  try {
    const yamlStr = yaml.dump(data);
    await fs.writeFile(YAML_FILE_PATH, yamlStr, 'utf8');
  } catch (error) {
    console.error('Error writing YAML file:', error);
  }
}

// Get all servers
app.get('/api/servers', async (req, res) => {
  const servers = await readYamlFile();
  res.json(servers);
});

// Add a new server
app.post('/api/servers', async (req, res) => {
  const servers = await readYamlFile();
  const newServer = req.body;
  servers.push(newServer);
  await writeYamlFile(servers);
  res.status(201).json(newServer);
});

// Update a server
app.put('/api/servers/:id', async (req, res) => {
  const servers = await readYamlFile();
  const id = parseInt(req.params.id);
  const updatedServer = req.body;
  const index = servers.findIndex(s => s.id === id);
  if (index !== -1) {
    servers[index] = { ...servers[index], ...updatedServer };
    await writeYamlFile(servers);
    res.json(servers[index]);
  } else {
    res.status(404).json({ message: 'Server not found' });
  }
});

// Delete a server
app.delete('/api/servers/:id', async (req, res) => {
  const servers = await readYamlFile();
  const id = parseInt(req.params.id);
  const filteredServers = servers.filter(s => s.id !== id);
  if (filteredServers.length < servers.length) {
    await writeYamlFile(filteredServers);
    res.json({ message: 'Server deleted successfully' });
  } else {
    res.status(404).json({ message: 'Server not found' });
  }
});

// Import YAML
app.post('/api/import', async (req, res) => {
  const { yamlData } = req.body;
  try {
    const parsedData = yaml.load(yamlData);
    await writeYamlFile(parsedData);
    res.json({ message: 'YAML imported successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error importing YAML' });
  }
});

// Export YAML
app.get('/api/export', async (req, res) => {
  const servers = await readYamlFile();
  const yamlStr = yaml.dump(servers);
  res.setHeader('Content-Type', 'application/x-yaml');
  res.setHeader('Content-Disposition', 'attachment; filename=servers.yaml');
  res.send(yamlStr);
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});