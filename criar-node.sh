#!/bin/bash

echo "Criando projeto Node..."
read -p "Nome do projeto: " nome

mkdir "$nome"
cd "$nome"

npm init -y
npm install express nodemon

echo "Projeto criado com sucesso."
gnome-terminal
