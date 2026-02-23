const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* CONFIGURAÇÕES */
const CONFIG = {
  nomeLoja: "Comida Caseira EdCasa",
  whatsapp: "5582996004116"
};

/* PREÇOS */
const precosQuentinha = {
  normal: { bairro: 22, fora: 25 },
  grande: { bairro: 25, fora: 27 }
};

const precosBatata = { P:5, M:8, G:10 };

/* CARDÁPIO */
const pratoPrincipal = [
  "Feijão tropeiro",
  "Feijão caseiro",
  "Arroz refogado",
  "Arroz branco",
  "Macarrão espaguete",
  "Farofa"
];

const acompanhamentos = [
  "Vinagrete",
  "Salada de maionese",
  "Purê de macaxeira"
];

const proteinas = [
  "Boi assado",
  "Porco assado",
  "Linguiça",
  "Bife acebolado",
  "Fígado acebolado",
  "Galinha guisada",
  "Frango no forno",
  "Peixe frito",
  "Bife ao molho",
  "Bisteca suína no forno",
  "Boi guisado"
];

const db = new sqlite3.Database("./database.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS cardapio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT,
    nome TEXT,
    preco REAL
  )
`);

app.get("/api/cardapio-organizado", (req, res) => {
  db.all("SELECT * FROM cardapio", (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: "Erro no banco" });
    }

    const organizado = {
      prato: [],
      acompanhamento: [],
      proteina: []
    };

    rows.forEach(item => {
      if (organizado[item.categoria]) {
        organizado[item.categoria].push(item.nome);
      }
    });

    res.json(organizado);
  });
});


app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>${CONFIG.nomeLoja}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="manifest" href="/manifest.json">
<style>
* { box-sizing: border-box; }
body { margin:0; font-family:Arial,sans-serif; background:#000; color:#fff; }
.container { max-width:420px; margin:auto; padding:16px; }
.logo { text-align:center; margin-bottom:12px; }
.logo img { width:150px; }
h1 { text-align:center; font-size:22px; margin-bottom:4px; }
p { text-align:center; opacity:.8; }
h2 { font-size:18px; margin-bottom:10px; }
h3 { font-size:16px; margin-top:10px; }
.box { background:#111; padding:14px; border-radius:10px; margin-bottom:14px; }
input, select { width:100%; padding:10px; margin-top:8px; border-radius:8px; border:none; font-size:15px; }
label { display:flex; align-items:center; gap:8px; margin-top:8px; font-size:15px; }
input[type="checkbox"], input[type="radio"] { width:auto; }
button { background:#25d366; color:#000; border:none; padding:16px; width:100%; font-size:17px; border-radius:10px; font-weight:bold; }
.total { margin-top:10px; font-weight:bold; }
</style>
</head>
<body>
<div class="container">

<div class="logo">
  <img src="/logo.png" alt="Logo">
</div>

<h1>${CONFIG.nomeLoja}</h1>
<p><strong>Deus seja louvado</strong></p>

<div class="box">
<h2>Nome do cliente</h2>
<input id="nomeCliente" placeholder="Nome do cliente">
</div>

<div class="box">
<h2>Endereço</h2>
<input id="endereco" placeholder="Endereço completo">
</div>

<div class="box">
<h2>Número de quentinhas</h2>
<input id="numQuentinhas" type="number" min="1" value="1">
<button type="button" id="btnGerar">Gerar quentinhas</button>
</div>

<div id="quentinhasContainer"></div>

<div class="box total">
Total geral: R$ <span id="totalGeral">0</span>,00
</div>

<button onclick="enviar()">Enviar pedido no WhatsApp</button>

</div>

<script>
const precosQuentinha = ${JSON.stringify(precosQuentinha)};
const precosBatata = ${JSON.stringify(precosBatata)};
let pratoPrincipal = [];
let acompanhamentos = [];
let proteinas = [];

fetch("/api/cardapio-organizado")
  .then(res => res.json())
  .then(dados => {
    pratoPrincipal = dados.prato || [];
    acompanhamentos = dados.acompanhamento || [];
    proteinas = dados.proteina || [];
  });
const numeroWhats = "${CONFIG.whatsapp}";

function limitarSelecoes(container, classe, max) {
  container.querySelectorAll(classe).forEach(cb => {
    cb.addEventListener("change", () => {
      const marcadas = container.querySelectorAll(classe + ":checked");
      if (marcadas.length > max) {
        cb.checked = false;
        alert("Você pode escolher no máximo " + max + " opções.");
      }
      calcularTotal();
    });
  });
}

function gerarQuentinhas() {
  const num = parseInt(document.getElementById("numQuentinhas").value);
  const container = document.getElementById("quentinhasContainer");
  container.innerHTML = "";

  for (let q = 1; q <= num; q++) {
    const div = document.createElement("div");
    div.className = "box";

    div.innerHTML =
      '<h2>Quentinha ' + q + '</h2>' +
      '<select class="tipoQuentinha">' +
      '<option value="">Tipo de quentinha</option>' +
      '<option value="normal">Normal</option>' +
      '<option value="grande">G</option>' +
      '</select>' +

      '<h3>Prato principal</h3>' +
      pratoPrincipal.map(i =>
        '<label><input type="checkbox" class="prato" value="'+i+'"> '+i+'</label>'
      ).join('') +

      '<h3>Acompanhamentos</h3>' +
      acompanhamentos.map(i =>
        '<label><input type="checkbox" class="acomp" value="'+i+'"> '+i+'</label>'
      ).join('') +

      '<h3>Proteínas (máx. 2)</h3>' +
      proteinas.map(i =>
        '<label><input type="checkbox" class="proteina" value="'+i+'"> '+i+'</label>'
      ).join('') +

      '<h3>Batata frita (opcional)</h3>' +
      '<label><input type="radio" name="batata'+q+'" value="P"> Pequena (R$5)</label>' +
      '<label><input type="radio" name="batata'+q+'" value="M"> Média (R$8)</label>' +
      '<label><input type="radio" name="batata'+q+'" value="G"> Grande (R$10)</label>' +

      '<h3>Deseja talher?</h3>' +
      '<label><input type="radio" name="talher'+q+'" value="Sim"> Sim</label>' +
      '<label><input type="radio" name="talher'+q+'" value="Não"> Não</label>' +

      '<h3>Pagamento</h3>' +
      '<label><input type="radio" name="pagamento'+q+'" value="PIX"> PIX</label>' +
      '<label><input type="radio" name="pagamento'+q+'" value="Cartão"> Cartão</label>' +
      '<label><input type="radio" name="pagamento'+q+'" value="À vista"> À vista</label>' +

      '<div class="total">Total quentinha ' + q + ': R$ <span class="totalQuentinha">0</span>,00</div>';

    container.appendChild(div);

    limitarSelecoes(div, ".proteina", 2);

    div.querySelectorAll("input, select").forEach(el =>
      el.addEventListener("change", calcularTotal)
    );
  }

  calcularTotal();
}

document.getElementById("btnGerar").addEventListener("click", gerarQuentinhas);

function calcularTotal() {
  let totalGeral = 0;
  const endereco = document.getElementById("endereco").value.toLowerCase();
  const bairroEspecial = endereco.includes("arnon de melo");

  document.querySelectorAll("#quentinhasContainer .box").forEach(div => {
    const tipo = div.querySelector(".tipoQuentinha").value;
    let total = 0;

    if (tipo) {
      total += bairroEspecial
        ? precosQuentinha[tipo].bairro
        : precosQuentinha[tipo].fora;
    }

    const batata = div.querySelector("input[name^=batata]:checked");
    if (batata) total += precosBatata[batata.value];

    div.querySelector(".totalQuentinha").innerText = total;
    totalGeral += total;
  });

  document.getElementById("totalGeral").innerText = totalGeral;
}

function enviar() {
  const nomeCliente = document.getElementById("nomeCliente").value;
  const endereco = document.getElementById("endereco").value;

  if (!nomeCliente || !endereco) {
    alert("Preencha o nome do cliente e o endereço");
    return;
  }

  const enderecoLower = endereco.toLowerCase();
  const bairroEspecial = enderecoLower.includes("arnon de melo");
  const linkMapa = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(endereco);

  let msg = "Pedido - ${CONFIG.nomeLoja}\\n\\n";
  msg += "Nome do cliente: " + nomeCliente + "\\n";
  msg += "Endereço: " + endereco + " (abrir no mapa: " + linkMapa + ")\\n\\n";

  let totalGeral = 0;

  document.querySelectorAll("#quentinhasContainer .box").forEach((div, idx) => {
    msg += "Quentinha " + (idx+1) + "\\n";

    const tipo = div.querySelector(".tipoQuentinha").value;
    let total = 0;

    if (tipo) {
      total += bairroEspecial
        ? precosQuentinha[tipo].bairro
        : precosQuentinha[tipo].fora;

      msg += "Tipo: " + (tipo==="normal"?"Normal":"G") + "\\n";
    }

    div.querySelectorAll("input[type=checkbox]:checked").forEach(cb => {
      msg += "• " + cb.value + "\\n";
    });

    const talher = div.querySelector("input[name^=talher]:checked");
    if (talher) msg += "Deseja talher: " + talher.value + "\\n";

    const pagamento = div.querySelector("input[name^=pagamento]:checked");
    if (pagamento) msg += "Pagamento: " + pagamento.value + "\\n";

    const batata = div.querySelector("input[name^=batata]:checked");
    if (batata) {
      total += precosBatata[batata.value];
      msg += "Batata: " + batata.value + "\\n";
    }

    msg += "Total quentinha " + (idx+1) + ": R$ " + total + "\\n\\n";
    totalGeral += total;
  });

  msg += "Total geral: R$ " + totalGeral;

  const url = "https://wa.me/" + numeroWhats + "?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
}
</script>

</body>
</html>
  `);
});

app.get("/api/cardapio", (req, res) => {
  db.all("SELECT * FROM cardapio", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ erro: "Erro ao buscar cardápio" });
    }
    res.json(rows);
  });
});

app.post("/api/cardapio", (req, res) => {
  const { categoria, nome, preco } = req.body;

  if (!categoria || !nome || preco == null) {
    return res.status(400).json({ erro: "Dados incompletos" });
  }

  db.run(
    "INSERT INTO cardapio (categoria, nome, preco) VALUES (?, ?, ?)",
    [categoria, nome, preco],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao salvar" });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.delete("/api/cardapio/:id", (req, res) => {
  db.run(
    "DELETE FROM cardapio WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ erro: "Erro ao remover" });
      }
      res.json({ ok: true });
    }
  );
});


app.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:" + PORT);
});
