const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public")); // pasta pública com logo.png

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
  "Bisteca suína no forno",
  "Boi guisado"
];

/* ROTA PRINCIPAL */
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
const pratoPrincipal = ${JSON.stringify(pratoPrincipal)};
const acompanhamentos = ${JSON.stringify(acompanhamentos)};
const proteinas = ${JSON.stringify(proteinas)};
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
    div.id = "quentinha" + q;

    div.innerHTML = '<h2>Quentinha ' + q + '</h2>' +
      '<select class="tipoQuentinha">' +
      '<option value="">Tipo de quentinha</option>' +
      '<option value="normal">Normal (R$ ' + precosQuentinha.normal.bairro + ')</option>' +
      '<option value="grande">G (R$ ' + precosQuentinha.grande.bairro + ')</option>' +
      '</select>' +
      '<select class="localEntrega">' +
      '<option value="">Local da entrega</option>' +
      '<option value="bairro">No bairro</option>' +
      '<option value="fora">Fora do bairro</option>' +
      '</select>' +
      '<h3>Prato principal</h3>' +
      pratoPrincipal.map(i => '<label><input type="checkbox" class="prato" value="'+i+'"> '+i+'</label>').join('') +
      '<h3>Acompanhamentos (máx. 2)</h3>' +
      acompanhamentos.map(i => '<label><input type="checkbox" class="acomp" value="'+i+'"> '+i+'</label>').join('') +
      '<h3>Proteínas (máx. 2)</h3>' +
      proteinas.map(i => '<label><input type="checkbox" class="proteina" value="'+i+'"> '+i+'</label>').join('') +
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
    limitarSelecoes(div, ".acomp", 2);

    div.querySelectorAll("input, select").forEach(el => el.addEventListener("change", calcularTotal));
  }

  calcularTotal();
}

document.getElementById("btnGerar").addEventListener("click", gerarQuentinhas);

function calcularTotal() {
  let totalGeral = 0;
  document.querySelectorAll("#quentinhasContainer .box").forEach(div => {
    const tipo = div.querySelector(".tipoQuentinha").value;
    const local = div.querySelector(".localEntrega").value;
    let total = 0;
    if(tipo && local) total += precosQuentinha[tipo][local];
    const batata = div.querySelector("input[name^=batata]:checked");
    if(batata) total += precosBatata[batata.value];
    div.querySelector(".totalQuentinha").innerText = total;
    totalGeral += total;
  });
  document.getElementById("totalGeral").innerText = totalGeral;
}

function enviar() {
  const nomeCliente = document.getElementById("nomeCliente").value;
  const endereco = document.getElementById("endereco").value;

  if(!nomeCliente || !endereco) {
    alert("Preencha o nome do cliente e o endereço");
    return;
  }

  const enderecoLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(endereco);

  let msg = "*Pedido - ${CONFIG.nomeLoja}*\\n\\n";
  msg += "*Nome do cliente:* " + nomeCliente + "\\n";
  msg += "*Endereço:* " + endereco + " (abrir no mapa: " + enderecoLink + ")\\n\\n";

  let totalGeral = 0;

  document.querySelectorAll("#quentinhasContainer .box").forEach((div, idx) => {
    msg += "*Quentinha " + (idx+1) + "*\\n";

    const tipo = div.querySelector(".tipoQuentinha").value;
    const local = div.querySelector(".localEntrega").value;
    let total = 0;
    if(tipo && local) total += precosQuentinha[tipo][local];
    msg += "Tipo: " + (tipo==="normal"?"Normal":"G") + "\\n";

    div.querySelectorAll(".prato:checked").forEach(i => msg += "- "+i.value+"\\n");
    div.querySelectorAll(".acomp:checked").forEach(i => msg += "- "+i.value+"\\n");
    div.querySelectorAll(".proteina:checked").forEach(i => msg += "- "+i.value+"\\n");

    const batata = div.querySelector("input[name^=batata]:checked");
    if(batata) {
      total += precosBatata[batata.value];
      msg += "Batata: " + batata.value + "\\n";
    }

    const talher = div.querySelector("input[name^=talher]:checked");
    if(talher) msg += "Deseja talher: " + talher.value + "\\n";

    const pagamento = div.querySelector("input[name^=pagamento]:checked");
    if(pagamento) msg += "Pagamento: " + pagamento.value + "\\n";

    msg += "Total quentinha " + (idx+1) + ": R$ " + total + "\\n\\n";
    totalGeral += total;
  });

  msg += "*Total geral: R$ " + totalGeral + "*";

  const url = "https://wa.me/" + numeroWhats + "?text=" + encodeURIComponent(msg);
  window.open(url);
}

// Service Worker PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registrado:', reg.scope))
    .catch(err => console.log('Falha ao registrar SW:', err));
}
</script>

</body>
</html>
  `);
});

// Manifest PWA
app.get("/manifest.json", (req, res) => {
  res.json({
    name: "Comida Caseira EdCasa",
    short_name: "EdCasa",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" }
    ]
  });
});

// Service Worker
app.get("/sw.js", (req, res) => {
  res.type("application/javascript");
  res.send(`
self.addEventListener('install', e => { console.log('SW instalado'); });
self.addEventListener('activate', e => { console.log('SW ativado'); });
self.addEventListener('fetch', e => { e.respondWith(fetch(e.request)); });
`);
});

app.listen(PORT, () => {
  console.log("Servidor rodando em http://localhost:" + PORT);
});
