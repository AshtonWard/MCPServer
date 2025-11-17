import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 8000;

app.use(bodyParser.json());

// Load tools dynamically
const tools = {};
const toolsDir = path.join(process.cwd(), 'tools');
fs.readdirSync(toolsDir).forEach(file => {
  if (file.endsWith('.js')) {
    const tool = await import(`./tools/${file}`);
    tools[tool.name] = tool.handler;
  }
});

// Endpoint to call tools
app.post('/call/:toolName', async (req, res) => {
  const { toolName } = req.params;
  const tool = tools[toolName];
  if (!tool) return res.status(404).json({ error: 'Tool not found' });

  try {
    const result = await tool(req.body);
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => console.log(`MCP server running at http://localhost:${port}`));
