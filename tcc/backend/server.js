const { spawn } = require('child_process');
const express = require('express');
const app = express();

app.use(express.json()); // Permite que o servidor entenda JSON

app.get('/analisar/:nomeArquivo', (req, res) => {
    // Dados que queremos enviar para o Python (simulando uma escolha de imagem)
    const arquivo = req.params.nomeArquivo;
    const path = require('path'); // Adicione esta linha no topo se não tiver

    const caminhoImagem = path.join(__dirname, 'amostras', arquivo);

    // Usamos aspas simples por fora e aspas duplas por dentro para o caminho
    // No seu server.js
    const python = spawn('python', ['analise_celular.py', caminhoImagem], {
        shell: true
    });

    let resultado = "";
    let erroPython = "";

    python.stdout.on('data', (data) => {
        resultado += data.toString();
    });

    // É bom ouvir o erro também, caso o Python trave
    python.stderr.on('data', (data) => {
        erroPython += data.toString();
    });

    python.on('close', (code) => {
        if (code !== 0) {
            console.error("Erro no Python:", erroPython);
            return res.status(500).json({ erro: "Falha no processamento da IA", detalhes: erroPython });
        }

        try {
            // Converte a string que o Python deu 'print' de volta para objeto JSON
            res.json(JSON.parse(resultado));
        } catch (e) {
            res.json({ status: "Concluido", laudo: resultado });
        }
    });
});

app.listen(3000, () => console.log("Servidor rodando: http://localhost:3000/analisar"));

//Imagine que você está no terminal (CMD) e digita python analise.py. O spawn é a forma de o JavaScript fazer exatamente isso por você, de forma automática.
//O JavaScript usa o stdout.on('data', ...) para ficar "ouvindo" tudo o que o Python imprime. É como se o JS estivesse com o ouvido na porta da sala onde o Python está trabalhando, anotando tudo o que ele grita (daí o print).
