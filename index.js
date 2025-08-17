const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  const dataHora = new Date().toLocaleString("pt-BR");
  res.send(`Bem vindo, ao Servidor Ubuntu 02 - ${dataHora}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
