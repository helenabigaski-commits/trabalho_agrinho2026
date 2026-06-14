import fs from 'fs';

// 1. Preencha com os seus dados do GitHub:
const TOKEN = "SEU_TOKEN_AQUI";
const DONO_REPO = "SEU_USUARIO_AQUI";
const NOME_REPO = "NOME_DO_REPOSITORIO_AQUI";
const BRANCH = "main"; 

async function enviarArquivo(nomeArquivo) {
    try {
        // 1. Ler o arquivo local e converter para Base64 (o GitHub exige esse formato)
        const conteudoLocal = fs.readFileSync(nomeArquivo);
        const conteudoBase64 = conteudoLocal.toString('base64');

        // URL da API do GitHub para este arquivo específico
        const url = `https://api.github.com/repos/${DONO_REPO}/${NOME_REPO}/contents/${nomeArquivo}`;

        // 2. Checar se o arquivo já existe no GitHub (para pegar o código 'sha' se precisar atualizar)
        let sha = null;
        const checarId = await fetch(url, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        if (checarId.ok) {
            const dadosArquivo = await checarId.json();
            sha = dadosArquivo.sha; // Se o arquivo já existe, pegamos o id de versão dele
        }

        // 3. Preparar os dados para o envio
        const dadosParaEnviar = {
            message: `Upload automático: ${nomeArquivo}`,
            content: conteudoBase64,
            branch: BRANCH
        };

        // Se o arquivo já existia, precisamos incluir o 'sha' no envio para o GitHub aceitar a atualização
        if (sha) {
            dadosParaEnviar.sha = sha;
        }

        // 4. Fazer o envio real (PUT)
        const resposta = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'NodeJS-Fetch'
            },
            body: JSON.stringify(dadosParaEnviar)
        });

        if (resposta.ok) {
            console.log(`✅ ${nomeArquivo} enviado com sucesso!`);
        } else {
            const erroDados = await resposta.json();
            console.error(`❌ Erro ao enviar ${nomeArquivo}:`, erroDados.message);
        }

    } catch (erro) {
        console.error(`❌ Erro no processo do arquivo ${nomeArquivo}:`, erro.message);
    }
}

// Executa a função para os seus dois arquivos do Agrinho
async function rodar() {
    await enviarArquivo('index.html');
    await enviarArquivo('style.css');
    console.log("\nFim do upload!");
}

rodar();