/*
 * BASE DE QUESTÕES — CESMAC / Aula 15-07
 * Conteúdo (enunciados, alternativas, gabaritos, discussão e imagens)
 * transcrito integralmente do DOCX "Questões Comentadas".
 * Os cards de discussão resumem o próprio texto do DOCX (Take Home Message
 * e comentários) — nada foi inventado.
 *
 * Estrutura de cada questão:
 *   n           -> número da questão
 *   tema        -> área/tema (rótulo)
 *   enunciado   -> texto do enunciado (verbatim)
 *   imgEnunciado-> {src, caption} imagem clínica do enunciado (opcional)
 *   alternativas-> [{ letra, texto }]
 *   correta     -> letra da alternativa correta
 *   cards       -> cards de discussão: { tipo, titulo, texto, itens[], img, caption }
 *                  tipo: 'resposta' | 'conceito' | 'imagem'
 */
window.QUIZ = {
  titulo: "Questões Comentadas — CESMAC",
  subtitulo: "Aula 15/07",
  questoes: [
    /* ============================ QUESTÃO 1 ============================ */
    {
      n: 1,
      tema: "Farmacovigilância",
      enunciado:
        "Segundo a Resolução De Diretoria Colegiada - RDC nº 406/2020 da Agência Nacional de Vigilância Sanitária - Anvisa, a farmacovigilância se refere a ciência e atividades relativas à detecção, avaliação, compreensão e prevenção de Eventos Adversos ou quaisquer outros problemas relacionados a medicamentos. Dentre as afirmações abaixo, qual se encaixa MELHOR nesta atividade?",
      alternativas: [
        { letra: "A", texto: "A farmacovigilância não aborda problemas de qualidade, uso não aprovado e abuso de medicamentos." },
        { letra: "B", texto: "O Sistema Nacional de Vigilância de eventos supostamente atribuíveis à vacinação ou imunização foi criado em 1992, pelo Programa Nacional de Imunizações, antes da criação da Anvisa, portanto, as vacinas não estão sujeitas ao monitoramento de segurança no escopo da farmacovigilância." },
        { letra: "C", texto: "O VigiMed é o sistema disponibilizado pela Anvisa para que cidadãos, profissionais de saúde, detentores de registro de medicamentos e patrocinadores de estudos possam reportar suspeitas de eventos adversos relacionados apenas a medicamentos." },
        { letra: "D", texto: "Os sistemas de notificação voluntária geram o maior volume de informações, com baixo custo de manutenção, e permitem a identificação precoce de sinais de segurança relacionados aos medicamentos. Constituem a base dos sistemas nacionais de farmacovigilância." }
      ],
      correta: "D",
      cards: [
        { tipo: "resposta", titulo: "Notificação voluntária", texto: "Os sistemas de notificação voluntária geram o maior volume de informações, com baixo custo de manutenção, e permitem a identificação precoce de sinais de segurança. Constituem a base dos sistemas nacionais de farmacovigilância." },
        { tipo: "conceito", titulo: "Escopo", texto: "A farmacovigilância aborda sim problemas de qualidade, uso não aprovado e abuso de medicamentos." },
        { tipo: "conceito", titulo: "Anvisa & VigiMed", texto: "A Anvisa coordena o Sistema Nacional de Farmacovigilância e disponibiliza o VigiMed para notificação de eventos adversos e outras queixas relacionadas a medicamentos." },
        { tipo: "conceito", titulo: "Ensaios clínicos", texto: "Tem relação direta com as fases dos ensaios clínicos, sendo especialmente relevante na fase IV — após a aprovação e comercialização do medicamento." },
        { tipo: "conceito", titulo: "Vacinas", texto: "As vacinas também estão no escopo da farmacovigilância: eventos adversos relacionados a elas precisam ser monitorados." }
      ]
    },
    /* ============================ QUESTÃO 2 ============================ */
    {
      n: 2,
      tema: "Medicina Legal — Declaração de Óbito",
      enunciado:
        "Mulher com 40 anos, 7 gestações anteriores, teve o último parto 1 ano antes da gestação atual. Em consulta médica na 38ª semana dessa gestação, apresentava queixa de sangramento vaginal. Recebe a informação de que estava com placenta prévia confirmada por ultrassom. Foi encaminhada à maternidade, mas não compareceu no serviço. Dois dias após a consulta, foi internada em choque hipovolêmico, encaminhada ao centro cirúrgico para realizar a cesariana de emergência, fez uma parada cardiorrespiratória e faleceu. A causa do óbito na Declaração de Óbito (DO) original foi preenchida da seguinte forma: Parte I: a. Placenta prévia total. b. Choque hipovolêmico. c. Parada cardiorrespiratória. Parte II: Em branco. Assinale a alternativa que corresponde à forma CORRETA de preenchimento da DO para o caso:",
      alternativas: [
        { letra: "A", texto: "Parte I: a. Deslocamento de placenta / b. Parada cardiorrespiratória / c. Gestação de 38 semanas. Parte II: em branco." },
        { letra: "B", texto: "Parte I: a. Choque hipovolêmico / b. Placenta prévia com hemorragia. Parte II: Gestação de 38 semanas." },
        { letra: "C", texto: "Parte I: a. Gestação de 38 semanas / b. Placenta prévia com hemorragia / c. Parada cardiorrespiratória. Parte II: em branco." },
        { letra: "D", texto: "Parte I: a. Placenta prévia / b. Choque hipovolêmico / c. Hemorragia intraparto. Parte II: Gestação de 38 semanas." },
        { letra: "E", texto: "Nenhuma das alternativas." }
      ],
      correta: "B",
      cards: [
        { tipo: "resposta", titulo: "Como preencher", texto: "O médico declara a causa básica por último, estabelecendo uma sequência de baixo para cima até a causa terminal/imediata (linha a)." },
        { tipo: "imagem", img: "image1.png", caption: "Causas da morte na DO — a causa básica é declarada por último; sequência de baixo para cima até a causa imediata (linha a)." },
        { tipo: "conceito", titulo: "Parte II", texto: "Na Parte II declaram-se outras condições mórbidas pré-existentes, sem relação com o estado patológico que desencadeou a morte e que não entraram na sequência da Parte I." },
        { tipo: "conceito", titulo: "Causa básica", texto: "É a doença ou lesão que iniciou a cadeia de acontecimentos que conduziram diretamente à morte." },
        { tipo: "conceito", titulo: "Causa imediata/terminal", texto: "É a última circunstância da cadeia de eventos antes da morte. Lembrar: evitar o uso de termos genéricos!" }
      ]
    },
    /* ============================ QUESTÃO 3 ============================ */
    {
      n: 3,
      tema: "Epidemiologia — Estratégias diagnósticas",
      enunciado:
        "Em um hospital de referência, foi implementada recentemente uma estratégia diagnóstica em série para triagem de tuberculose latente entre profissionais de saúde. O protocolo estabelece testagem em série, com 2 testes disponíveis. Em uma avaliação rotineira, uma funcionária apresenta resultado negativo no primeiro teste. Qual deve ser a conduta considerando o resultado?",
      alternativas: [
        { letra: "A", texto: "A negatividade no primeiro teste implica que não há necessidade de realizar o segundo teste, e a investigação pode ser finalizada com segurança neste momento." },
        { letra: "B", texto: "É recomendado repetir imediatamente o mesmo teste para garantir que o resultado negativo não seja falso." },
        { letra: "C", texto: "Deve-se considerar como indeterminado o resultado e solicitar imediatamente exames de imagem antes de confirmar qualquer conduta." },
        { letra: "D", texto: "O resultado negativo do primeiro teste indica que a profissional está definitivamente livre da doença, independentemente de fatores de risco." },
        { letra: "E", texto: "Mesmo com resultado negativo inicial, testes adicionais devem sempre ser realizados para aumentar a sensibilidade da estratégia diagnóstica." }
      ],
      correta: "A",
      cards: [
        { tipo: "resposta", titulo: "Primeiro teste negativo", texto: "A estratégia em série prioriza especificidade. Como o primeiro teste resultou negativo, não há necessidade de fazer o segundo teste." },
        { tipo: "imagem", img: "image4.png", caption: "Imagem 3 — Estratégias de testagem — ACERVO MEDCOF" },
        { tipo: "conceito", titulo: "Testagem em série", texto: "O 2º teste é feito apenas quando o anterior for positivo. Aumenta a especificidade (reduz falsos-positivos) e tende a reduzir custos." },
        { tipo: "conceito", titulo: "Testagem em paralelo", texto: "Os testes são feitos ao mesmo tempo; qualquer positivo = doença. Aumenta a sensibilidade (evita falsos-negativos), mas gera mais falsos-positivos." },
        { tipo: "imagem", img: "image2.png", caption: "Imagem 1 — Fórmula de sensibilidade — ACERVO MEDCOF" },
        { tipo: "imagem", img: "image3.png", caption: "Imagem 2 — Fórmula de especificidade — ACERVO MEDCOF" }
      ]
    },
    /* ============================ QUESTÃO 4 ============================ */
    {
      n: 4,
      tema: "Cirurgia do Trauma — Acessos",
      enunciado:
        "Homem, 35 anos, vítima de 2 ferimentos por arma de fogo em região abdominal, admitido em choque hipovolêmico no pronto atendimento de hospital secundário. Exame físico: Pressão Arterial de 60 x 20 mmHg, intensa palidez, gemente, desorientado e com extremidades frias. Na inspeção do abdome observa-se 2 ferimentos perfurantes em parede abdominal, sendo um em hipocôndrio esquerdo e outro em flanco esquerdo. Na ausência de recursos de imagem o paciente será submetido a laparotomia exploradora de urgência. Qual a melhor incisão para acessar a cavidade abdominal?",
      alternativas: [
        { letra: "A", texto: "Transversa supra umbilical." },
        { letra: "B", texto: "Paramediana esquerda." },
        { letra: "C", texto: "Mediana supraumbilical." },
        { letra: "D", texto: "Subcostal esquerda (Kocher)." }
      ],
      correta: "C",
      cards: [
        { tipo: "resposta", titulo: "Por que a Mediana Supra", texto: "Excelente no trauma: permite visualização rápida de fígado, baço e estômago, além de alças e cólon, e pode ser facilmente ampliada (até xifopúbica) se necessário." },
        { tipo: "conceito", titulo: "Vantagem da mediana", texto: "É feita na linha alba (confluência das aponeuroses), sem seccionar músculos — acesso rápido e seguro: pele, subcutâneo, aponeurose e peritônio." },
        { tipo: "imagem", img: "image5.png", caption: "Imagem 1 — Algoritmo de tratamento do trauma abdominal penetrante — Fonte: Medcof" },
        { tipo: "imagem", img: "image6.png", caption: "Imagem 2 — Incisões abdominais. 1. Kocher; 2. Mediana; 3. McBurney; 4. Battle; 5. Lanz; 6. Paramediana; 7. Transversal; 8. Rutherford Morrison; 9. Pfannenstiel." },
        { tipo: "conceito", titulo: "Paramediana / Kocher / Transversa", texto: "Todas passam por músculos (reto, oblíquos, transverso), sendo mais demoradas e com menor exposição — pouco úteis no trauma do adulto." }
      ]
    },
    /* ============================ QUESTÃO 5 ============================ */
    {
      n: 5,
      tema: "Cirurgia do Trauma — Trauma pélvico",
      enunciado:
        "Um homem de 38 anos é trazido via transporte aeromédico para serviço terciário após acidente com explosivo. Dados da cena: Glasgow 14, pressão arterial 160 x 140 mmHg, FC 140 bpm. Realizado compressão de lesão, 1000 mL de Ringer Lactato intravenoso, e analgesia. Tempo total do acidente até a chegada ao centro de trauma: 1 hora. Durante o seu atendimento inicial, na sequência proposta pelo ATLS: A: Vias aéreas pérvias, colar cervical bem locado, paciente comunicante, torporoso; B: Sem sinais de estase jugular ou desvio de traquéia, Tórax simétrico, ausculta e percussão sem alterações; C: Pressão arterial 70x50, frequência cardíaca de 130 mmHg. Lesão perineal complexa com acometimento retal extenso. Pelve estável; D: Glasgow 14, pupilas isofotorreagentes; E: Sem outras lesões além das demonstradas. A conduta cirúrgica mais adequada frente ao caso deve ser, além do desbridamento de tecido desvitalizado:",
      alternativas: [
        { letra: "A", texto: "Amputação retal com colostomia terminal, drenagem sacral." },
        { letra: "B", texto: "Derivação do trânsito intestinal, drenagem da fáscia pré sacral e lavagem do coto distal." },
        { letra: "C", texto: "Rafia primária retal com ileostomia de proteção." },
        { letra: "D", texto: "Procedimento de Hartmann." }
      ],
      correta: "B",
      cards: [
        { tipo: "resposta", titulo: "Lesão retal > 25%", texto: "Trauma pélvico complexo com lesão retal extraperitoneal superior a 25% da parede: derivação proximal do trânsito intestinal + drenagem pré-sacral + lavagem do coto distal." },
        { tipo: "conceito", titulo: "Lesão < 25%", texto: "Lesão extraperitoneal do reto menor que 25% da luz: apenas a derivação proximal do trânsito intestinal (sem drenagem ou lavagem do coto distal)." },
        { tipo: "conceito", titulo: "Conduta clássica", texto: "É a preconizada na maioria dos centros de trauma brasileiros, sempre associada às medidas secundárias do trauma associado." }
      ]
    },
    /* ============================ QUESTÃO 6 ============================ */
    {
      n: 6,
      tema: "Cirurgia — Câncer gástrico",
      enunciado: "Sobre o câncer gástrico, é correto afirmar que:",
      alternativas: [
        { letra: "A", texto: "Afeta, com maior frequência, as mulheres e a faixa etária entre 40-50 anos, sendo também o tipo de câncer mais comum no Japão." },
        { letra: "B", texto: "O Helicobacter pylori pode ser considerado um dos fatores contribuintes para o câncer gástrico por gerar gastrite hipertrófica." },
        { letra: "C", texto: "O câncer gástrico difuso hereditário é uma forma herdada de carcinoma gástrico resultante da mutação do gene da E-caderina, com aproximadamente 80% de possibilidade de desenvolvimento de câncer gástrico durante a vida." },
        { letra: "D", texto: "Alimentos ricos em sal, como carnes defumadas, juntamente com o alto consumo de frutas cítricas e vegetais, são associados a um risco aumentado de câncer gástrico." },
        { letra: "E", texto: "Os pacientes com anemia perniciosa também têm um aumento no risco de desenvolvimento de câncer gástrico. A hipercloridria é a característica definidora dessa condição." }
      ],
      correta: "C",
      cards: [
        { tipo: "resposta", titulo: "Câncer gástrico difuso hereditário", texto: "A transmissão do gene da caderina-E anormal confere probabilidade de ~80% de desenvolver câncer gástrico, indicando testes genéticos, rastreamento e até gastrectomia total profilática." },
        { tipo: "conceito", titulo: "Epidemiologia", texto: "3ª causa de câncer em homens e 5ª entre mulheres nos EUA. O adenocarcinoma é 95% das neoplasias gástricas; ~3% são linfomas." },
        { tipo: "conceito", titulo: "Fatores de risco", itens: ["Anemia perniciosa (deficiência de B12)", "Histórico familiar; grupo sanguíneo A", "Tabagismo", "H. pylori e gastrite atrófica", "Cirurgias gástricas prévias (Billroth II)", "Pólipos gástricos", "Dieta rica em nitritos/nitrosaminas (conservas, defumados)"] }
      ]
    },
    /* ============================ QUESTÃO 7 ============================ */
    {
      n: 7,
      tema: "Cirurgia — Distúrbio ácido-base",
      enunciado:
        "Paciente de 68 anos, sexo masculino, está no terceiro dia de pós-operatório de esofagectomia. Ele inicia quadro de dificuldade respiratória com queda da saturação de oxigênio. Foram solicitados exames laboratoriais que mostraram: pH: 7,25; PaCO2: 42 mmHg; Na: 135 mmol/L; K: 3,8 mmol/L; Cloreto: 95 mmol/L; e bicarbonato: 13 mmol/L. Qual o diagnóstico do distúrbio ácido-base apresentado por este paciente?",
      alternativas: [
        { letra: "A", texto: "Acidose metabólica com anion gap aumentado." },
        { letra: "B", texto: "Acidose metabólica com anion gap aumentado e acidose respiratória." },
        { letra: "C", texto: "Acidose mista com ânion gap normal." },
        { letra: "D", texto: "Acidose respiratória com ânion gap normal." }
      ],
      correta: "B",
      cards: [
        { tipo: "resposta", titulo: "pH e distúrbio primário", texto: "pH 7,25 → acidose. HCO₃ 13 (diminuído) → acidose metabólica." },
        { tipo: "conceito", titulo: "Compensação (Winter)", texto: "PaCO₂ esperada = (13 × 1,5) + 8 = 27,5 ± 2. Como a PaCO₂ medida é 42 (maior que a esperada), há acidose respiratória associada → distúrbio misto." },
        { tipo: "imagem", img: "image7.png", caption: "Cálculo do Ânion Gap: AG = Na⁺ − (HCO₃⁻ + Cl⁻)" },
        { tipo: "conceito", titulo: "Ânion Gap", texto: "AG = 135 − (13 + 95) = 27. AG > 12 = aumentado. Conclusão: acidose metabólica com AG aumentado + acidose respiratória." },
        { tipo: "conceito", titulo: "Roteiro da gasometria", texto: "Checar pH → metabólica ou respiratória → verificar se está compensado → calcular o AG (se acidose metabólica)." },
        // Slide dedicado (tela cheia): fluxograma de abordagem da acidose metabólica.
        { tipo: "imagem", full: true, img: "image14.png", caption: "Abordagem da acidose metabólica — fluxograma (Acervo MedCof Anest.)" }
      ]
    },
    /* ============================ QUESTÃO 8 ============================ */
    {
      n: 8,
      tema: "Pediatria — Cardiopatias na T21",
      enunciado: "Qual é a cardiopatia cirúrgica mais comum na Trissomia do 21?",
      alternativas: [
        { letra: "A", texto: "DSAVt." },
        { letra: "B", texto: "CIA." },
        { letra: "C", texto: "Tetralogia de Fallot." },
        { letra: "D", texto: "CIV." }
      ],
      correta: "A",
      cards: [
        { tipo: "resposta", titulo: "DSAVt", texto: "O Defeito do Septo Atrioventricular Total é a cardiopatia mais característica e prevalente na Síndrome de Down (~40% dos casos de cardiopatia)." },
        { tipo: "imagem", img: "image8.png", caption: "Defeito do Septo Atrioventricular Total (DSAVt): comunicação entre as quatro câmaras e valva AV comum, com shunt esquerdo-direito." },
        { tipo: "conceito", titulo: "Fisiopatologia", texto: "Falha no desenvolvimento dos coxins endocárdicos na embriogênese. Cardiopatias ocorrem em ~40–60% dos pacientes com SD." },
        { tipo: "conceito", titulo: "Prevalência na SD", itens: ["DSAVt: 40–50%", "CIV: 20–25%", "CIA: ~10%", "Tetralogia de Fallot: 5–10% (cianótica mais comum)"] },
        { tipo: "conceito", titulo: "Rastreamento", texto: "Ecocardiograma recomendado para todo RN com SD, mesmo sem sopro, para planejar a correção cirúrgica no momento ideal." }
      ]
    },
    /* ============================ QUESTÃO 9 ============================ */
    {
      n: 9,
      tema: "Pediatria — Vasculite por IgA",
      enunciado:
        "Paciente de 4 anos previamente hígido está passando em consulta de rotina pediátrica. Mãe refere que, há cerca de 2 semanas, ele apresentou um quadro de dor nos punhos e tornozelos, dor abdominal e “caroços elevados” pelo corpo. Ela o medicou com amoxicilina por conta própria e refere que, após cerca de uma semana, as lesões começaram a melhorar. Ao exame, está em BEG, corado, hidratado, FC: 92 bpm, FR: 20 ipm, PA: 82x50 mmHg. Restante do exame clínico sem alterações, exceto por lesões residuais em membros inferiores, conforme imagem a seguir. Considerando a principal hipótese diagnóstica, assinale os exames que deverão ser realizados de forma seriada nos meses subsequentes.",
      imgEnunciado: { src: "https://medcof-assets.s3.sa-east-1.amazonaws.com/uploads/1708607195159image.png", caption: "Lesões residuais em membros inferiores" },
      alternativas: [
        { letra: "A", texto: "Hemograma com contagem de plaquetas e coagulograma." },
        { letra: "B", texto: "Anticorpo antiestreptolisina O e ecocardiograma." },
        { letra: "C", texto: "Função renal e sedimento urinário." },
        { letra: "D", texto: "Frações C3 e C4 do complemento." }
      ],
      correta: "C",
      cards: [
        { tipo: "resposta", titulo: "Por que função renal e urina", texto: "Na vasculite por IgA o acometimento renal (10–50%) é o principal determinante de prognóstico a longo prazo; hematúria e proteinúria podem persistir por até 6 meses e devem ser acompanhadas de forma seriada." },
        { tipo: "conceito", titulo: "Vasculite por IgA", texto: "Antiga púrpura de Henoch-Schönlein: vasculite primária mais comum da infância (vasos de pequeno calibre). Pico entre 4 e 6 anos." },
        { tipo: "conceito", titulo: "Quadro clínico", texto: "Púrpura palpável/petéquias que não desaparecem à digitopressão (predomínio em MMII), artralgia oligoarticular, dor abdominal e acometimento renal." },
        { tipo: "conceito", titulo: "Laboratório", texto: "PLAQUETAS NORMAIS OU AUMENTADAS. Autoanticorpos costumam ser negativos." },
        { tipo: "conceito", titulo: "Prognóstico", texto: "Bom, mas todos devem ser acompanhados até a vida adulta pelo risco de doença renal crônica (1–2% dos casos)." }
      ]
    },
    /* ============================ QUESTÃO 10 =========================== */
    {
      n: 10,
      tema: "Pediatria — Pneumonia (PAC)",
      enunciado:
        "Paciente sexo feminino, 10 meses de vida, busca atendimento em pronto-socorro devido à dificuldade respiratória notada pela mãe através do “afundamento das costelas”. Apresenta tosse úmida, rinorreia hialina, há 5 dias, e, há 1 dia, evoluiu com febre de 39,1 °C, dificuldade respiratória e diminuição da ingesta hídrica. Criança previamente hígida. Ao exame físico, apresenta-se em bom estado geral, com frequência cardíaca de 134 bpm, frequência respiratória de 40 irpm e saturação em ar ambiente de 95%, tiragem subcostal e ausculta respiratória sem particularidades. Foram realizados Raios X do tórax, conforme imagem a seguir. Em relação à conduta indicada nesse caso, assinale a alternativa correta.",
      imgEnunciado: { src: "https://medcof-assets.s3.sa-east-1.amazonaws.com/uploads/1682704287864image.png", caption: "Radiografia de tórax" },
      alternativas: [
        { letra: "A", texto: "Coleta de hemocultura e internação." },
        { letra: "B", texto: "Fisioterapia respiratória e novos raios X de tórax." },
        { letra: "C", texto: "Realização de ultrassonografia de tórax para excluir derrame pleural." },
        { letra: "D", texto: "Alta com amoxicilina 50 mg/kg/dia e retorno em 48 horas para reavaliação." },
        { letra: "E", texto: "Alta com azitromicina 10 mg/kg/dia por 5 dias." }
      ],
      correta: "A",
      cards: [
        { tipo: "resposta", titulo: "Por que internar", texto: "A criança tem sinais de gravidade (tiragem subcostal, recusa hídrica). Pacientes com sinais de gravidade devem ser internados; nesses casos podem-se coletar exames laboratoriais, incluindo hemocultura." },
        { tipo: "conceito", titulo: "Sinais de gravidade", texto: "Desconforto respiratório (tiragem), estridor em repouso, recusa hídrica/vômitos, alteração do nível de consciência, SatO₂ < 92% e complicações radiológicas (derrame/empiema)." },
        { tipo: "conceito", titulo: "Diagnóstico", texto: "O diagnóstico da PAC é clínico; a radiografia não deve ser de rotina — é indicada nos casos internados para avaliar complicações." },
        { tipo: "conceito", titulo: "Agentes por faixa etária (7m–5a)", texto: "Vírus, Streptococcus pneumoniae, Haemophilus influenzae, Staphylococcus aureus, Mycoplasma pneumoniae, Mycobacterium tuberculosis." }
      ]
    },
    /* ============================ QUESTÃO 11 =========================== */
    {
      n: 11,
      tema: "Pediatria — Anemia falciforme / STA",
      enunciado:
        "Menina, 8 anos de idade, portadora de anemia falciforme, foi admitida no serviço de emergência devido quadro de febre, dificuldade para respirar e dor em hemitórax direito há 1 dia. Feito radiografia de tórax com presença de consolidação segmentar em lobo inferior direito. Ao exame, paciente em regular estado geral, FC: 125 bpm, FR: 38 ipm, com tiragem subdiafragmática, intercostal e de fúrcula, saturação de 85% em ar ambiente, 92% em máscara não-reinalante. Resultados de exame com Hb: 6,8 g/dL, Ht: 18% (Hb basal de 7,5 g/dL). A paciente em questão tem história de ter apresentado anafilaxia em transfusão prévia de concentrado de hemácias. Com relação à indicação de hemocomponentes para essa paciente, qual das alternativas está correta?",
      alternativas: [
        { letra: "A", texto: "Está indicado concentrado de hemácias lavado e desleucocitado." },
        { letra: "B", texto: "Está indicado concentrado de hemácias irradiado." },
        { letra: "C", texto: "Está indicado concentrado de hemácias sem modificação, mas com pré-medicação." },
        { letra: "D", texto: "Não está indicado concentrado de hemácias neste momento." }
      ],
      correta: "A",
      cards: [
        { tipo: "resposta", titulo: "Lavado + desleucocitado", texto: "Pacientes com hemoglobinopatias devem receber hemácias desleucocitadas. Havendo reação alérgica grave prévia (anafilaxia), as hemácias devem também ser lavadas." },
        { tipo: "conceito", titulo: "Lavadas", texto: "Previnem reações alérgicas graves mediadas por proteínas circulantes e complemento; indicadas em deficiência de IgA e hipercalêmicos." },
        { tipo: "conceito", titulo: "Leucorreduzidas/filtradas", texto: "Removem leucócitos, reduzindo sensibilização HLA e reações febris não hemolíticas em politransfundidos." },
        { tipo: "conceito", titulo: "Síndrome Torácica Aguda", texto: "Complicação pulmonar grave da doença falciforme: febre e/ou sintomas respiratórios + infiltrado pulmonar recente ao RX. Tratar com ATB, O₂, controle álgico e transfusão." }
      ]
    },
    /* ============================ QUESTÃO 12 =========================== */
    {
      n: 12,
      tema: "Pediatria — Puericultura do prematuro",
      enunciado:
        "Que cuidado, dentre os abaixo, deve-se ter ao plotar, nos gráficos contidos na Caderneta da Criança, as medidas antropométricas de uma criança de 20 meses, nascida com 35 semanas de idade gestacional (pré-termo)?",
      alternativas: [
        { letra: "A", texto: "Utilizar as curvas de crescimento para prematuros." },
        { letra: "B", texto: "Utilizar as curvas de crescimento para crianças de 0-2 anos, sem ajustes." },
        { letra: "C", texto: "Utilizar as curvas de crescimento para crianças de 0-2 anos, descontando da idade cronológica 2 semanas." },
        { letra: "D", texto: "Utilizar as curvas de crescimento para crianças de 0-2 anos, descontando da idade cronológica 5 semanas." }
      ],
      correta: "D",
      cards: [
        { tipo: "resposta", titulo: "Idade corrigida", texto: "Desconta-se da idade cronológica as semanas que faltaram para atingir 40 semanas (40 − 35 = 5 semanas). A idade corrigida é usada até os 3 anos." },
        { tipo: "conceito", titulo: "Qual curva usar", texto: "Curva de Fenton até o RNPT atingir 40 semanas de IG corrigida. A partir daí, curva padrão da OMS/MS, mantendo a idade corrigida (de preferência escore Z)." },
        { tipo: "imagem", img: "image9.png", caption: "Classificação do estado nutricional por escore-z — 0 a 5 anos (DOCS)" },
        { tipo: "imagem", img: "image11.png", caption: "Classificação do estado nutricional por escore-z — maiores de 5 anos (DOCS)" }
      ]
    },
    /* ============================ QUESTÃO 13 =========================== */
    {
      n: 13,
      tema: "MFC — Entrevista motivacional",
      enunciado:
        "Após você realizar as orientações de redução de risco, quanto ao fumo, durante o aleitamento, você explora as motivações de Vanessa de planejar voltar a fumar após o término da gravidez. Vanessa informa que fuma “para fazer companhia ao Edberto”. Após identificar Edberto como um personagem chave para abordar o tabagismo de Vanessa, você agenda uma consulta para Edberto. Durante a consulta com Edberto, através da entrevista motivacional, você identifica que ele se encontra no estágio Contemplativo. Qual abordagem, a partir da entrevista motivacional, é a mais adequada nesse caso?",
      alternativas: [
        { letra: "A", texto: "Tirar dúvidas e ajudar na escolha de melhor estratégia em busca da mudança." },
        { letra: "B", texto: "Ajudar a perceber gatilhos para prevenir recaídas. Construir estratégias para enfrentar eventuais gatilhos." },
        { letra: "C", texto: "Levantar dúvidas sobre sintomas e queixas do paciente sobre possível relação com tabagismo e aumentar a percepção sobre riscos do hábito." },
        { letra: "D", texto: "Desfazer a postura de ambivalência, inclinando a balança ao evocar riscos de não mudar e numerar motivos para mudar. Fortalecer a autossuficiência." }
      ],
      correta: "D",
      cards: [
        { tipo: "resposta", titulo: "Estágio Contemplativo", texto: "A pessoa admite o problema e está ambivalente. Abordar a ambivalência, reforçar riscos do tabagismo e benefícios da cessação, evocar motivos para mudar e fortalecer a autossuficiência." },
        { tipo: "conceito", titulo: "Modelo transteórico", itens: ["Pré-contemplação: não considera mudar", "Contemplação: ambivalente, pensa em mudar (6 meses)", "Preparação: faz planos (30 dias)", "Ação: implementa a mudança (< 6 meses)", "Manutenção: mantém os ganhos (> 6 meses)"] },
        { tipo: "conceito", titulo: "Ambivalência", texto: "Conflito psicológico entre permanecer com o hábito ou abandoná-lo. Resolver a ambivalência é o principal objetivo da entrevista motivacional." }
      ]
    },
    /* ============================ QUESTÃO 14 =========================== */
    {
      n: 14,
      tema: "GO — RPMO / corioamnionite",
      enunciado:
        "Secundigesta (G2P1N), 33 semanas de gestação, está internada com diagnóstico de corioamniorrexe prematura em conduta expectante há uma semana. Na ocasião do diagnóstico recebeu betametasona e 48 horas de penicilina cristalina. Na avaliação realizada hoje, se queixou de dor abdominal. Exame físico: BEG, temperatura de 38,0 °C, demais sinais vitais e exame físico geral normais. Toque: colo posterior, médio, 1 polpa, feto cefálico. Exames laboratoriais: hemograma glóbulos brancos = 13.500/mm³ 17% bastões, plaquetas 180.000/mm³. Swab vaginal/endoanal para estreptococo do grupo B positivo. Quais as melhores condutas nesse momento?",
      alternativas: [
        { letra: "A", texto: "Clindamicina, betametasona por 24 horas e resolução da gestação por cesárea." },
        { letra: "B", texto: "Clindamicina, penicilina cristalina e indução do trabalho de parto." },
        { letra: "C", texto: "Amoxicilina, azitromicina, penicilina cristalina e indução do trabalho de parto na 34ª semana." },
        { letra: "D", texto: "Clindamicina, gentamicina e resolução por cesárea." }
      ],
      correta: "B",
      cards: [
        { tipo: "resposta", titulo: "Infecção intrauterina", texto: "Febre + dor abdominal + leucocitose com desvio à esquerda indicam infecção intrauterina → interrupção da gravidez independentemente da idade gestacional (afasta a C)." },
        { tipo: "conceito", titulo: "Via de parto", texto: "Na RPMO, privilegia-se a via vaginal na ausência de contraindicações (afasta cesárea das A e D). A infecção intrauterina não é indicação de cesariana por si só." },
        { tipo: "conceito", titulo: "Antibióticos", texto: "Swab EGB positivo reforça a penicilina cristalina (droga de escolha), associada à clindamicina para cobertura anaeróbia." },
        { tipo: "conceito", titulo: "Betametasona", texto: "Contraindicada na vigência de infecção intra-amniótica — não se dá corticoide para maturidade pulmonar com infecção instalada." }
      ]
    },
    /* ============================ QUESTÃO 15 =========================== */
    {
      n: 15,
      tema: "GO — Infertilidade",
      enunciado:
        "Nuligesta, 24 anos, há um ano tenta engravidar sem sucesso. Apresenta ciclos menstruais de 27 a 29 dias, com fluxo normal. Tem atividade sexual regular, com relação pênis vagina quatro vezes na semana. Marido de 28 anos, tem três filhos de outro relacionamento e nega comorbidades. Exame físico sem alterações. Exames complementares: FSH 5,4 mUI/mL (2,8 a 14,4), TSH 2 microUI/mL (0,3 a 4,0). USG TV com útero e ovários normais e contagem de folículos antrais de 9 em cada ovário. Imagem hipoecogênica alongada em topografia de anexo esquerdo. HSG com cavidade uterina normal, trompa direita filiforme e trompa esquerda dilatada, sem passagem de contraste bilateralmente. Espermograma com volume de 2 mL, 16 milhões de espermatozóides/mL, 50% vivos, 30% de motilidade progressiva e 5% normais (critérios de Kruger). Qual é o melhor tratamento para este casal?",
      alternativas: [
        { letra: "A", texto: "Ciclo de fertilização in vitro." },
        { letra: "B", texto: "Coito programado após indução da ovulação." },
        { letra: "C", texto: "Ciclo de fertilização in vitro após salpingectomia." },
        { letra: "D", texto: "Inseminação intrauterina após indução da ovulação." }
      ],
      correta: "C",
      cards: [
        { tipo: "resposta", titulo: "FIV após salpingectomia", texto: "Obstrução tubária bilateral indica reprodução de alta complexidade (FIV). A obstrução associa-se a fluido patológico que afeta a implantação — necessária salpingectomia bilateral prévia à FIV." },
        { tipo: "imagem", img: "image12.jpeg", caption: "Figura 1 — Hidrossalpinge bilateral com obstrução tubária." },
        { tipo: "conceito", titulo: "Investigação da infertilidade", itens: ["Fator tubário: histerossalpingografia", "Fator ovulatório: FSH/LH, progesterona, USG seriado", "Fator uterino: USG transvaginal", "Fator masculino: espermograma"] },
        { tipo: "conceito", titulo: "Abordagem conjugal", texto: "A infertilidade é sempre abordada como conjugal, mesmo que um dos parceiros tenha filhos de relacionamentos anteriores." }
      ]
    },
    /* ============================ QUESTÃO 16 =========================== */
    {
      n: 16,
      tema: "Clínica — Dor torácica / D-dímero",
      enunciado:
        "Paciente masculino, de 70 anos, com hipertensão de longa data, apresentou quadro súbito de dor torácica retroesternal, de forte intensidade, tendo sido trazido à Emergência. À admissão, apresentava saturação de oxigênio de 96%. Foram realizados eletrocardiografia de repouso e raio X de tórax. O resultado da dosagem de troponina estava normal, e a dosagem de D-dímeros indicou 1.900 ng/ml (valor de referência: 500 ng/ml). Qual o provável diagnóstico e qual a investigação complementar?",
      alternativas: [
        { letra: "A", texto: "Síndrome aórtica aguda - angiotomografia de tórax e abdômen." },
        { letra: "B", texto: "Síndrome coronariana aguda - coronariografia." },
        { letra: "C", texto: "Tromboembolismo pulmonar agudo - angiografia pulmonar." },
        { letra: "D", texto: "Aneurisma roto da aorta torácica - angiotomografia de tórax." }
      ],
      correta: "A",
      cards: [
        { tipo: "resposta", titulo: "Síndrome aórtica aguda", texto: "Quadro súbito e de forte intensidade sempre deve chamar atenção para fenômenos vasculares. A síndrome aórtica aguda é a principal hipótese; investigação por angiotomografia de tórax e abdômen." },
        { tipo: "conceito", titulo: "Afastando as outras", texto: "Aneurisma roto → paciente instável (não é o caso). TEP → sem dessaturação/S1Q3T3 e a angiografia é invasiva. SCA → ECG sem isquemia e troponina normal." },
        { tipo: "conceito", titulo: "D-dímero", texto: "Marcador dos produtos de degradação da fibrina — indica fibrinólise em curso. Elevação NÃO é específica de nenhuma condição (sobe em TVP, TEP, CIVD, infecção, pós-op, gestação)." }
      ]
    },
    /* ============================ QUESTÃO 17 =========================== */
    {
      n: 17,
      tema: "Clínica — Hipercalcemia",
      enunciado:
        "Um paciente de 40 anos foi internado com poliúria e desidratação, quando se detectou hipercalcemia (cálcio sérico 13,5 mg/dl). O paciente negava qualquer comorbidade ou sintomatologia prévia. A investigação laboratorial mostrou PTH no limite inferior da normalidade, hemograma normal, 25 hidroxi vitamina D acima de 150 ng/ml com níveis normais de 1,25 di-hidroxi vitamina D. Qual a causa mais provável da hipercalcemia neste caso?",
      alternativas: [
        { letra: "A", texto: "Linfoma." },
        { letra: "B", texto: "Sarcoidose." },
        { letra: "C", texto: "Intoxicação exógena." },
        { letra: "D", texto: "Hiperparatiroidismo secundário." },
        { letra: "E", texto: "Hipertiroidismo." }
      ],
      correta: "C",
      cards: [
        { tipo: "resposta", titulo: "Intoxicação por vitamina D", texto: "25(OH)-vitamina D extremamente elevada com 1,25(OH)₂D normal é padrão altamente sugestivo de intoxicação exógena por vitamina D — cada vez mais frequente pelo uso indiscriminado de suplementos." },
        { tipo: "conceito", titulo: "1º passo", texto: "Avaliar se a hipercalcemia é PTH-dependente ou independente. PTH no limite inferior afasta hiperparatireoidismo primário/terciário → causa PTH-independente." },
        { tipo: "conceito", titulo: "Diferencial", texto: "Outras causas PTH-independentes (malignidade, doenças granulomatosas como sarcoidose/linfoma) geralmente cursam com aumento da 1,25(OH)₂D — o que não ocorre aqui." },
        { tipo: "conceito", titulo: "Manejo", texto: "Suspensão da vitamina D, hidratação vigorosa e, em casos graves, fármacos hipocalcemiantes (bisfosfonatos ou corticoides, conforme a etiologia)." }
      ]
    },
    /* ============================ QUESTÃO 18 =========================== */
    {
      n: 18,
      tema: "Urologia — Escroto agudo",
      enunciado:
        "Um adolescente de 15 anos, da zona rural de Altamira, procura o pronto-socorro do Hospital Regional com dor escrotal intensa à esquerda iniciada há 8 horas, de início súbito, acompanhada de náuseas e vômitos. Nega trauma local. Ao exame físico, apresenta edema escrotal, dor acentuada à palpação e ausência do reflexo cremastérico à esquerda. Diante desse quadro clínico, a conduta mais apropriada é:",
      alternativas: [
        { letra: "A", texto: "Solicitar ultrassonografia com Doppler escrotal antes de definir conduta cirúrgica." },
        { letra: "B", texto: "Iniciar antibioticoterapia empírica para epididimite e observar evolução clínica." },
        { letra: "C", texto: "Indicar exploração escrotal imediata com destorção e orquidopexia bilateral." },
        { letra: "D", texto: "Prescrever analgesia e reavaliar em 24 horas para descartar torção de apêndice testicular." },
        { letra: "E", texto: "Realizar apenas manobra de destorção manual e alta hospitalar com seguimento ambulatorial." }
      ],
      correta: "C",
      cards: [
        { tipo: "resposta", titulo: "Não atrasar a cirurgia", texto: "Em casos claros de torção (reflexo cremastérico ausente), atrasar a conduta cirúrgica para realizar o ultrassom pode levar à perda do testículo por necrose isquêmica → exploração escrotal imediata." },
        { tipo: "imagem", img: "image13.png", caption: "Torção testicular — A) anatomia normal; B) fixação anômala (deformidade em “badalo de sino”)." },
        { tipo: "conceito", titulo: "Sinais de torção", itens: ["Reflexo cremastérico/sinal de Rabinowitz: ausente", "Sinal de Brunzel: testículo mais elevado", "Sinal de Angel (badalo de sino): testículo horizontalizado", "Sinal de Prehn: alívio à elevação → sugere orquiepididimite"] },
        { tipo: "conceito", titulo: "Conduta cirúrgica", texto: "< 6 h: testículo geralmente viável → orquidopexia BILATERAL. Evolução avançada: orquiectomia + orquidopexia contralateral." }
      ]
    }
  ]
};
