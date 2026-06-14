import { Octokit } from "octokit";
import fs from "fs";
import path from "path";

// 1. Configure suas credenciais e informações do repositório aqui:
const TOKEN = "SEU_TOKEN_DO_GITHUB_AQUI"; 
const OWNER = "SEU_USUARIO_DO_GITHUB";
const REPO = "NOME_DO_SEU_REPOSITORIO";
const BRANCH = "main"; // ou 'master'

// Inicializa o cliente do GitHub API
const octokit = new Octokit({ auth: TOKEN });

// Função para enviar um arquivo para o GitHub
async function uploadFile(fileName) {
    try {
        const filePath = path.resolve(fileName);
        
        // Lê o arquivo local
        const fileContent = fs.readFileSync(filePath);
        // Converte o conteúdo para Base64 (exigência da API do GitHub)
        const contentBase64 = fileContent.toString("base64");

        console.log(`⏳ Enviando ${fileName}...`);

        // Tenta verificar se o arquivo já existe no GitHub para pegar o 'sha' (necessário para atualizar)
        let sha = undefined;
        try {
            const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: OWNER,
                repo: REPO,
                path: fileName,
                ref: BRANCH
            });
            sha = data.sha;
        } catch (error) {
            // Se der erro 404, significa que o arquivo é novo, então o sha continua undefined (tudo bem!)
        }

        // Envia ou atualiza o arquivo no repositório
        await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: OWNER,
            repo: REPO,
            path: fileName,
            message: `🤖 Auto upload: ${fileName} adicionado/atualizado`,
            content: contentBase64,
            branch: BRANCH,
            sha: sha // Incluído se o arquivo já existir
        });

        console.log(`✅ ${fileName} enviado com sucesso!`);
    } catch (error) {
        console.error(`❌ Erro ao enviar o arquivo ${fileName}:`, error.message);
    }
}

// Executa o upload para os dois arquivos do seu projeto do Agrinho
async function main() {
    await uploadFile("index.html");
    await uploadFile("style.css");
    console.log("\n🎉 Processo concluído!");
}

main();