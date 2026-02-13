const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

/* CONFIGURAÇÕES */
const CONFIG = {
  nomeLoja: "Comida Caseira EdCasa",
  whatsapp: "5582996004116"
};

/* PREÇOS */
const precosQuentinha = {
  normal: { especial: 22, padrao: 25 },
  grande: 27
};

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<title>${CONFIG.nomeLoja}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial;background:#000;color:#fff}
.container{max-width:420px;margin:auto;padding:16px}
.box{background:#111;padding:14px;border-radius:10px;margin-bottom:14px}
input,select{width:100%;padding:10px;margin-top:8px;border-radius:8px;border:none}
button{background:#25d366;color:#000;border:none;padding:16px;width:100%;font-weight:bold;border-radius:10px;margin-top:10px}
.total{font-weight:bold;margin-top:10px}
</style>
</head>
<body>

<div class="container">

<h1>${CONFIG.nomeLoja}</h1>

<div class="box">
<h2>Nome do cliente</h2>
<input id="nomeCliente">
</div>

<div class="box">
<h2>Bairro</h2>
<input id="bairro" placeholder="Digite o bairro">
</div>

<div class="box">
<h2>Número de quentinhas</h2>
<input id="numQuentinhas" type="number" min="1" value="1">
<button type="button" onclick="gerarQuentinhas()">Gerar quentinhas</button>
</div>

<div id="quentinhasContainer"></div>

<div class="box total">
Total geral: R$ <span id="totalGeral">0</span>,00
</div>

<button onclick="enviar()">Enviar pedido</button>

</div>

<script>
const precosQuentinha = ${JSON.stringify(precosQuentinha)};
const numeroWhats = "${CONFIG.whatsapp}";

function bairroEspecial() {
  const bairro = document.getElementById("bairro").value.toLowerCase();
  return bairro.includes("arnon de melo") || bairro.includes("senador arnon de melo");
}

function gerarQuentinhas(){
  const num = parseInt(document.getElementById("numQuentinhas").value);
  const container = document.getElementById("quentinhasContainer");
  container.innerHTML = "";

  if(num < 1 || isNaN(num)){
    alert("Informe um número válido de quentinhas");
    return;
  }

  for(let i=1;i<=num;i++){
    const div = document.createElement("div");
    div.className="box quentinha";

    div.innerHTML=
    '<h3>Quentinha '+i+'</h3>'+
    '<select class="tipo">'+
    '<option value="">Escolha o tamanho</option>'+
    '<option value="normal">Normal</option>'+
    '<option value="grande">G</option>'+
    '</select>'+
    '<div class="total">Total: R$ <span class="totalQ">0</span>,00</div>';

    container.appendChild(div);

    div.querySelectorAll("select").forEach(el=>{
      el.addEventListener("change",calcularTotal);
    });
  }

  calcularTotal();
}

function calcularTotal(){
  let totalGeral = 0;

  document.querySelectorAll(".quentinha").forEach(div=>{
    const tipo = div.querySelector(".tipo").value;
    let total = 0;

    if(tipo === "normal"){
      total += bairroEspecial()
        ? precosQuentinha.normal.especial
        : precosQuentinha.normal.padrao;
    }

    if(tipo === "grande"){
      total += precosQuentinha.grande;
    }

    div.querySelector(".totalQ").innerText = total;
    totalGeral += total;
  });

  document.getElementById("totalGeral").innerText = totalGeral;
}

function enviar(){
  const nome = document.getElementById("nomeCliente").value;
  const bairro = document.getElementById("bairro").value;

  if(!nome || !bairro){
    alert("Preencha nome e bairro");
    return;
  }

  let msg="*Pedido - ${CONFIG.nomeLoja}*\\n";
  msg+="Nome: "+nome+"\\n";
  msg+="Bairro: "+bairro+"\\n\\n";

  let totalGeral = 0;

  document.querySelectorAll(".quentinha").forEach((div,i)=>{
    const tipo = div.querySelector(".tipo").value;
    let total = 0;

    if(tipo === "normal"){
      total += bairroEspecial()
        ? precosQuentinha.normal.especial
        : precosQuentinha.normal.padrao;
    }

    if(tipo === "grande"){
      total += precosQuentinha.grande;
    }

    msg+="Quentinha "+(i+1)+" - "+tipo+" - R$ "+total+"\\n";
    totalGeral += total;
  });

  msg+="\\nTotal Geral: R$ "+totalGeral;

  const url="https://wa.me/"+numeroWhats+"?text="+encodeURIComponent(msg);
  window.open(url);
}
</script>

</body>
</html>
`);
});

app.listen(PORT, ()=>{
  console.log("Servidor rodando na porta "+PORT);
});
