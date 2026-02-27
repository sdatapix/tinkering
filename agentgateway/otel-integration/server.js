const http = require('http');

const pets = [
  { id: "1", name: "Buddy", species: "dog" },
  { id: "2", name: "Whiskers", species: "cat" }
];

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/pets') {
    res.end(JSON.stringify(pets));
  } else if (req.method === 'GET' && req.url.startsWith('/pets/')) {
    const id = req.url.split('/')[2];
    const pet = pets.find(p => p.id === id);
    if (pet) {
      res.end(JSON.stringify(pet));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Pet not found" }));
    }
  } else if (req.method === 'POST' && req.url === '/pets') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const newPet = JSON.parse(body);
      newPet.id = String(pets.length + 1);
      pets.push(newPet);
      res.statusCode = 201;
      res.end(JSON.stringify(newPet));
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(10080, () => console.log('Mock API running on http://localhost:10080'));
