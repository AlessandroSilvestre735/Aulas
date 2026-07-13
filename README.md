# Questões Comentadas — CESMAC (Quiz interativo)

Apresentação em HTML para discutir as **18 questões** da aula (15/07) com a turma.
Os alunos entram pelo **celular via QR code**, respondem cada questão e disputam um
**ranking** — quem acerta **mais rápido e certo** ganha mais pontos. Depois de cada
questão vem a **discussão em cards**, com o conteúdo e as **imagens tiradas do próprio
material** (nada foi inventado).

## Como funciona

- **`frontend/index.html`** — tela do **professor** (projetor): mostra o QR, as questões, o
  ranking ao vivo e a discussão.
- **`frontend/play.html`** — tela do **aluno** (celular): entra na sala, responde e vê a pontuação.

A coordenação celular ↔ projetor é feita pelo **backend** (`/api/host` e `/api/player`,
funções serverless na Vercel) usando o **MongoDB** como estado da partida + *polling*. Isso
funciona em **qualquer rede** (tudo via HTTPS): o aluno é **cadastrado assim que digita o
nome**, a tela dele libera na hora e o aplicador vê os presentes ao vivo (estilo Kahoot).

Como as respostas passam pelo servidor, as **interações dos alunos** (cada resposta + o
ranking final) já ficam gravadas no **MongoDB** — veja *Persistência* abaixo.

## Como usar na aula

1. **Publique os arquivos** num endereço acessível pelos celulares (ver abaixo).
2. Abra o **`index.html`** no computador ligado ao projetor.
3. Os alunos **apontam a câmera** para o QR code (ou abrem o link e digitam o código da sala).
4. Cada aluno digita o **nome** e entra — o nome aparece na tela do professor.
5. Clique em **Iniciar quiz**. Para cada questão:
   - os alunos respondem no celular (quanto mais rápido e certo, mais pontos);
   - **Revelar resposta** → mostra a correta e a distribuição das respostas;
   - **Ver ranking** → placar atualizado;
   - **Discussão da questão** → cards-resumo + imagens do material;
   - **Próxima questão**.
6. No fim, aparece o **pódio** com os três primeiros.

> Dica: o tempo por questão (20/30/45/60s) é escolhido **no lobby** e **trava ao iniciar**
> (volta a ser ajustável ao voltar pro lobby em "Jogar novamente"). O código da sala
> sobrevive a um F5 do professor (o link do QR continua válido).

## Publicando (para o QR funcionar)

O QR precisa apontar para uma URL que os celulares consigam abrir. Opções:

- **Vercel (necessária)**: conecte o repositório no painel da Vercel. Cada `git push` faz
  **deploy automático**. O quiz **depende do `backend/`** (funções serverless que coordenam
  a partida), então a Vercel — ou outra plataforma com serverless — é necessária. Configure
  a variável `MONGO_URI` em *Settings → Environment Variables* (nunca no `.env` público).
- **GitHub Pages / hospedagem 100% estática**: **não** roda o `backend/`, então o quiz **não
  funciona** ali (serviria apenas os arquivos do `frontend/`).
- **Teste local**: `pnpm dev` serve só o `frontend/` (sem backend). Para rodar o backend
  junto — necessário pro quiz — use `pnpm dev:api` (`vercel dev`) com a `MONGO_URI` no `.env`.

Abrir direto do arquivo (`file://`) **não** serve para os celulares — use uma das opções acima.

## Estrutura

```
frontend/                 PÚBLICO — servido ao navegador
  index.html              Tela do professor
  play.html               Tela do aluno (celular)
  assets/
    css/styles.css        Tema (todas as cores/fontes em variáveis no topo)
    js/quiz-data.js       As 18 questões, gabaritos, cards de discussão e imagens
    js/common.js          Constantes + regra de pontuação por velocidade
    js/host.js            Professor: coordena a partida via /api/host (+ polling)
    js/player.js          Aluno: entra e responde via /api/player (+ polling)
    js/vendor/            qrcode.min.js (QR do lobby)
    img/                  Imagens extraídas do material
backend/                  PRIVADO — servidor (lê variáveis de ambiente; nunca exposto)
  api/host.js             /api/host   — aplicador controla e acompanha a partida
  api/player.js           /api/player — aluno entra, responde e acompanha
  lib/config.js           Configuração (MONGO_URI etc.) lida SÓ do ambiente
  lib/db.js               Conexão MongoDB reutilizável
  lib/http.js             Utilidades HTTP (CORS, body, coleções)
  lib/quiz.js             Pontuação e utilidades (espelham o frontend)
vercel.json               Estático (frontend) + rotas /api/host e /api/player
.env.example              Modelo do .env (o .env real fica fora do git)
```

## Persistência das interações (MongoDB)

Como a partida é coordenada pelo backend, as interações já ficam gravadas no **MongoDB**
(banco `cesmac_quiz` por padrão):

- **`salas`** — estado ao vivo de cada sala (fase, questão atual, etc.).
- **`jogadores`** — cada aluno presente (nome, pontuação, presença).
- **`respostas`** — 1 documento por resposta (aluno, questão, letra, se acertou, tempo, pontos).
- **`sessoes`** — 1 documento por partida, com o ranking final.

Cada partida tem um `sessionId` único (`sala + timestamp`) para agrupar os registros. A
pontuação é calculada **no servidor** (o gabarito não fica exposto no aparelho do aluno).

**Segurança:** a `MONGO_URI` (com a senha) vive **só** nas variáveis de ambiente do servidor
— nunca no código nem no navegador. Localmente fica no `.env` (git-ignored; use o
`.env.example` como modelo). Os endpoints são abertos (sem login): para uma atividade de
sala tudo bem, mas dá para adicionar proteção depois se necessário.

## Identidade visual

Segue a identidade **Grupo MedCof** da apresentação de referência: fundo vinho, dourado +
rosé, fontes **Archivo** (títulos) e **Spline Sans** (texto), cartões de vidro com barra de
acento e a assinatura da marca — a **barra de progresso em batimento (ECG) dourado** no topo
(um batimento por questão). O logo, a marca-d'água e a textura de fundo foram reaproveitados
da apresentação de referência (`frontend/assets/img/medcof-*`, `bg-texture.jpg`).

As fontes vêm do Google Fonts; sem internet, o sistema usa fontes locais equivalentes
(Segoe UI/system-ui) — cores, layout e componentes seguem idênticos.

Tudo é controlado por **variáveis CSS** no início de `frontend/assets/css/styles.css` (paleta vinho/
dourado/rosé, cores das alternativas A–E, raios, fontes), então qualquer ajuste fino de marca
é feito ali — sem tocar na lógica.
