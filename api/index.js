require('dotenv').config();

const {app} = require('./src/app.js');

const port = Number(process.env.API_PORT ?? 3000);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

