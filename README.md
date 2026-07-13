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

A conexão celular ↔ projetor é **peer-to-peer (WebRTC via PeerJS)** — o jogo em si não
precisa de servidor nem login. As bibliotecas (`peerjs`, `qrcode`) já estão embutidas em
`frontend/assets/js/vendor/`, então funciona mesmo sem internet estável na sala (desde que
os celulares consigam alcançar o broker público do PeerJS para o "aperto de mão" inicial).

Opcionalmente, o professor grava as **interações dos alunos** (respostas + ranking final)
num **MongoDB**, através de uma pequena função em `backend/` — veja *Persistência* abaixo.

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

> Dica: o tempo por questão (20/30/45/60s) é ajustável no lobby. O código da sala e as
> pontuações sobrevivem a um F5 do professor (o link do QR continua válido).

## Publicando (para o QR funcionar)

O QR precisa apontar para uma URL que os celulares consigam abrir. Opções:

- **Vercel (recomendado)**: conecte o repositório no painel da Vercel. Cada `git push`
  faz **deploy automático**. É o único que roda o `backend/` (função serverless), então é
  o necessário para gravar no MongoDB. Configure a variável `MONGO_URI` em
  *Settings → Environment Variables* (nunca no `.env` público).
- **GitHub Pages / hospedagem estática**: servem só o `frontend/` (o QR e o quiz funcionam),
  mas **não** executam o `backend/`, então não gravam no MongoDB.
- **Teste local na mesma rede**: `pnpm dev` serve o `frontend/` e você acessa pelo IP da
  máquina no celular (`http://SEU_IP:8000`). Para testar o backend junto: `pnpm dev:api`
  (usa `vercel dev`).

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
    js/host.js            Lógica do professor (sala, respostas, ranking, envio ao backend)
    js/player.js          Lógica do celular
    js/vendor/            peerjs.min.js e qrcode.min.js (embutidos)
    img/                  Imagens extraídas do material
backend/                  PRIVADO — servidor (lê variáveis de ambiente; nunca exposto)
  api/log.js              Endpoint POST /api/log — grava as interações no MongoDB
  lib/config.js           Configuração (MONGO_URI etc.) lida SÓ do ambiente
  lib/db.js               Conexão MongoDB reutilizável
vercel.json               Roteia estático (frontend) e a função (/api/log → backend)
.env.example              Modelo do .env (o .env real fica fora do git)
```

## Identidade visual

Segue a identidade **Grupo MedCof** da apresentação de referência: fundo vinho, dourado +
rosé, fontes **Archivo** (títulos) e **Spline Sans** (texto), cartões de vidro com barra de
acento e a assinatura da marca — a **barra de progresso em batimento (ECG) dourado** no topo
(um batimento por questão). O logo, a marca-d'água e a textura de fundo foram reaproveitados
da apresentação de referência (`assets/img/medcof-*`, `bg-texture.jpg`).

As fontes vêm do Google Fonts; sem internet, o sistema usa fontes locais equivalentes
(Segoe UI/system-ui) — cores, layout e componentes seguem idênticos.

Tudo é controlado por **variáveis CSS** no início de `assets/css/styles.css` (paleta vinho/
dourado/rosé, cores das alternativas A–E, raios, fontes), então qualquer ajuste fino de marca
é feito ali — sem tocar na lógica.
