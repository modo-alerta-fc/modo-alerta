/* ═══════════════════════════════════════════════
   MODO ALERTA — Banco de cenários

   Regra de ouro: cada cenário tem UMA resposta defensável e a pista que
   decide está VISÍVEL na tela (domínio, número não salvo, pedido de
   senha/código/Pix, adesivo no QR…). Nada depende de interpretação.

   Campos comuns:
     type        SMS | WhatsApp | Email | Ligação | Site | QR Code | LinkedIn
     context     (opcional) frase de situação mostrada acima do cenário
     isScam      true = golpe, false = legítimo
     explanation resumo de uma frase mostrado na revelação
     signals     2–3 sinais que justificam a resposta
     action      o que fazer na vida real
   Campos por tipo: ver renderizadores em scenes.js.
   ═══════════════════════════════════════════════ */
const gameData = {
  levels: [
    {
      id: 1,
      name: "Recruta",
      color: "#7AC143",
      icon: "I",
      description: "Situações comuns do dia a dia. Fique atento aos sinais óbvios!",
      scenarios: [
        {
          id: 101, type: "SMS", category: "Smishing · prêmio falso", isScam: true,
          sender: "+55 11 97341-2290", time: "09:12",
          messages: ["Seu banco informa: parabéns! Seu CPF foi sorteado e você ganhou R$ 5.000,00. Resgate até as 18h de hoje: bit.ly/premio-cpf"],
          explanation: "Golpe: um prêmio que você nunca concorreu, com prazo curto e link escondido.",
          signals: [
            "Você não participou de nenhum sorteio",
            "Prazo apertado para você agir sem pensar",
            "Link encurtado esconde o endereço real",
          ],
          action: "Não toque no link. Na dúvida, abra o app oficial do seu banco.",
        },
        {
          id: 102, type: "SMS", category: "Smishing · falsa taxa", isScam: true,
          sender: "+55 21 98812-4471", time: "14:03",
          messages: ["Correios: sua encomenda BR8823410 está retida. Pague a taxa de R$ 7,90 até hoje para evitar a devolução: correios-entregas.net/taxa"],
          explanation: "Golpe: os Correios não cobram taxa por link de SMS.",
          signals: [
            "O site oficial é correios.com.br — “correios-entregas.net” é outro endereço",
            "Cobrança enviada de um número de celular comum",
            "Ameaça de devolução para apressar o pagamento",
          ],
          action: "Consulte o rastreio no app oficial ou digitando o site dos Correios.",
        },
        {
          id: 103, type: "WhatsApp", category: "Engenharia social · falso TI", isScam: true,
          sender: "+55 81 99632-1180", saved: false, time: "10:27",
          messages: [
            { text: "Oi! Aqui é o Lucas, do suporte de TI da Ferreira Costa 👋" },
            { text: "Estamos migrando os acessos hoje. Me confirma sua senha de rede pra eu não bloquear seu usuário?" },
          ],
          explanation: "Golpe: ninguém do TI pede sua senha — por mensagem ou de qualquer outro jeito.",
          signals: [
            "Pedido de senha: é pessoal e intransferível",
            "Número que não está nos seus contatos",
            "Ameaça de bloqueio para pressionar",
          ],
          action: "Não responda. Avise o TI pelo canal oficial.",
        },
        {
          id: 104, type: "Ligação", category: "Vishing · falso suporte", isScam: true,
          caller: "+55 11 4003-8812", callerNote: "Número não salvo", duration: "00:21",
          lines: [
            "Olá, aqui é do suporte técnico da Microsoft. Detectamos um vírus no seu computador.",
            "Para corrigir agora, instale o programa de acesso remoto que eu vou te passar.",
          ],
          explanation: "Golpe: empresas de tecnologia não ligam oferecendo um suporte que você não pediu.",
          signals: [
            "Ligação inesperada sobre um problema que você nem sabia que tinha",
            "Pedido para instalar acesso remoto: é assim que o golpista entra no computador",
          ],
          action: "Desligue. Se tiver dúvida sobre o computador, procure o TI da empresa.",
        },
        {
          id: 105, type: "SMS", category: "Golpe de emprego", isScam: true,
          sender: "+55 31 99104-5532", time: "19:48",
          messages: ["Vaga home office! Ganhe R$ 300 por dia só curtindo vídeos. Últimas vagas, cadastre-se agora: vaga-facil.net"],
          explanation: "Golpe: dinheiro fácil demais, pressa e site desconhecido.",
          signals: [
            "Ganho alto para um trabalho fácil demais",
            "Pressão: “últimas vagas”",
            "Site desconhecido pedindo cadastro",
          ],
          action: "Ignore e apague. Vagas reais não chegam do nada por SMS.",
        },
        {
          id: 106, type: "WhatsApp", category: "Golpe do número novo", isScam: true,
          sender: "+55 81 98450-7713", saved: false, time: "16:35",
          messages: [
            { text: "Oi, sou eu! Troquei de número, salva esse aí 😊" },
            { text: "Tô com um problema urgente. Consegue me fazer um Pix de R$ 850? Amanhã te devolvo" },
          ],
          explanation: "Golpe: número novo + pedido urgente de dinheiro, sem nem dizer quem é.",
          signals: [
            "A pessoa nem diz o nome — só “sou eu”",
            "Número desconhecido pedindo dinheiro com urgência",
            "Pix é instantâneo: não dá para desfazer",
          ],
          action: "Antes de qualquer Pix, ligue para o número antigo da pessoa.",
        },
        {
          id: 107, type: "WhatsApp", category: "Conversa pessoal", isScam: false,
          sender: "Mãe", saved: true, time: "17:02",
          messages: [
            { text: "Oi! Chego aí às 19h pro jantar 😊" },
            { text: "Quer que eu leve a sobremesa?" },
          ],
          explanation: "Legítimo: contato que você conhece, conversa normal, nada é pedido.",
          signals: [
            "Contato salvo, de alguém que você conhece",
            "Sem pedido de dinheiro, senha ou dados",
            "Sem link e sem urgência",
          ],
          action: "Pode responder normalmente.",
        },
        {
          id: 108, type: "Email", category: "Comunicado interno", isScam: false,
          fromName: "Mariana Torres", fromAddress: "mariana.torres@ferreiracosta.com.br", time: "08:47",
          subject: "Reunião de alinhamento — quinta, 10h",
          body: "Oi, pessoal!\n\nLembrando da nossa reunião de alinhamento na quinta, às 10h, na sala 2. Não precisa preparar nada.\n\nAté lá!\nMariana",
          explanation: "Legítimo: domínio oficial, assunto esperado e nenhum pedido.",
          signals: [
            "Endereço no domínio oficial: @ferreiracosta.com.br",
            "Assunto esperado, de alguém da equipe",
            "Sem link, anexo ou pedido de dados",
          ],
          action: "Pode seguir normalmente.",
        },
        {
          id: 109, type: "Email", category: "Convite de calendário", isScam: false,
          fromName: "Ana Pereira", fromAddress: "ana.pereira@ferreiracosta.com.br", time: "11:20",
          subject: "Convite: Reunião semanal do time",
          body: "Ana Pereira convidou você para um evento recorrente.\n\nReunião semanal do time\nToda sexta, das 9h às 9h30 · Sala 4",
          buttons: ["Sim", "Talvez", "Não"],
          explanation: "Legítimo: convite de calendário de uma colega, no domínio oficial.",
          signals: [
            "Remetente no domínio oficial da empresa",
            "Responder “Sim” ou “Não” não leva você para nenhum site",
            "Nada é pedido além da sua presença",
          ],
          action: "Pode responder ao convite.",
        },
        {
          id: 110, type: "WhatsApp", category: "Grupo de trabalho", isScam: false,
          sender: "Equipe Comercial 💼", saved: true, group: true, members: "Bruno, Carla, Diego, você",
          time: "08:15",
          messages: [
            { author: "Carla", text: "Bom dia, time! Hoje tem café dos aniversariantes às 9h no refeitório 🎉" },
            { author: "Bruno", text: "Opa, tô dentro!" },
          ],
          explanation: "Legítimo: grupo de trabalho conhecido, aviso comum e colegas conversando.",
          signals: [
            "Grupo da equipe, que você já conhece",
            "Aviso do dia a dia, sem link nem pedido",
            "Outros colegas respondendo normalmente",
          ],
          action: "Pode aproveitar o café! ☕",
        },
      ]
    },
    {
      id: 2,
      name: "Investigador",
      color: "#f5a623",
      icon: "II",
      description: "Os sinais ficam mais sutis. Preste atenção nos detalhes!",
      scenarios: [
        {
          id: 111, type: "Email", category: "Phishing · domínio falso", isScam: true,
          context: "No seu e-mail pessoal, numa manhã comum:",
          fromName: "Netflix", fromAddress: "no-reply@netflix-pagamentos.com", time: "07:55",
          subject: "Seu pagamento foi recusado",
          body: "Olá,\n\nNão conseguimos processar a cobrança da sua assinatura. Atualize seus dados de pagamento em até 24 horas para evitar o cancelamento da sua conta.",
          cta: "Atualizar pagamento", ctaUrl: "netflix-pagamentos.com/conta",
          explanation: "Golpe: o e-mail não vem da Netflix, e o botão leva para um site falso.",
          signals: [
            "O domínio da Netflix é netflix.com — “netflix-pagamentos.com” é outro site",
            "O botão leva para esse mesmo domínio falso",
            "Prazo de 24 horas para você não parar para pensar",
          ],
          action: "Confira sua conta pelo app ou digitando netflix.com no navegador.",
        },
        {
          id: 112, type: "Ligação", category: "Vishing · código MFA", isScam: true,
          caller: "+55 11 3090-4410", callerNote: "Diz ser do TI da empresa", duration: "00:34",
          lines: [
            "Oi, aqui é do TI da Ferreira Costa. Identificamos uma tentativa de invasão na sua conta.",
            "Acabei de te mandar um código por SMS. Me fala ele agora, pra eu bloquear o invasor.",
          ],
          explanation: "Golpe: o código de verificação é só seu. Quem pede o código é o invasor.",
          signals: [
            "Ninguém do TI pede o código que chega no seu celular",
            "Com o código, quem está ligando entra na sua conta",
            "Medo e urgência para você agir rápido",
          ],
          action: "Desligue, não informe o código e avise o TI pelo canal oficial.",
        },
        {
          id: 113, type: "Site", category: "Phishing · falso rastreio", isScam: true,
          context: "Você recebeu um SMS sobre uma entrega e tocou no link:",
          url: "https://rastreio-encomendas24h.com/entrega", brand: "📦 Rastreio Encomendas",
          pageTitle: "Entrega pendente",
          body: "Para liberar a entrega do seu pedido, confirme seus dados e pague a taxa de reenvio de R$ 4,90.",
          fields: ["CPF", "Número do cartão", ["Validade", "CVV"]], cta: "Confirmar e pagar",
          explanation: "Golpe: site desconhecido pedindo os dados completos do cartão.",
          signals: [
            "O endereço não é de nenhuma transportadora ou loja oficial",
            "Pede número, validade e CVV do cartão",
            "Taxa pequena para parecer inofensiva",
          ],
          action: "Feche a página. Confira a entrega no site ou app da loja onde você comprou.",
        },
        {
          id: 114, type: "LinkedIn", category: "Golpe de emprego", isScam: true,
          sender: "Juliana Mendes", headline: "Recrutadora · Contratando agora",
          meta: "18 conexões · perfil criado este mês", time: "21:10",
          messages: [
            "Olá! Seu perfil foi pré-aprovado para uma vaga remota de R$ 15.000/mês, sem entrevista.",
            "Para liberar a contratação, é só pagar a taxa de cadastro de R$ 89 via Pix.",
          ],
          explanation: "Golpe: empresa séria não cobra nada para contratar.",
          signals: [
            "Cobrança de taxa para conseguir a vaga",
            "Salário alto e sem entrevista: bom demais para ser verdade",
            "Perfil novo, com poucas conexões",
          ],
          action: "Não pague nada. Denuncie o perfil no próprio LinkedIn.",
        },
        {
          id: 115, type: "Email", category: "Phishing · dados confidenciais", isScam: true,
          fromName: "Diretoria Comercial", fromAddress: "diretoria.comercial@ferreiracosta-corp.com", time: "13:42",
          subject: "URGENTE — lista de clientes",
          body: "Preciso da planilha de clientes ativos agora para uma reunião externa.\n\nO sistema está lento, então manda direto para o meu e-mail pessoal: diretoria.fc@gmail.com",
          explanation: "Golpe: domínio falso pedindo dado confidencial para um e-mail pessoal.",
          signals: [
            "“ferreiracosta-corp.com” não é o domínio da empresa (o real é ferreiracosta.com.br)",
            "Pede dado confidencial para um Gmail pessoal",
            "Urgência e pedido para fugir do processo normal",
          ],
          action: "Não envie. Confirme com a pessoa por outro canal e reporte ao time de Cibersegurança.",
        },
        {
          id: 116, type: "WhatsApp", category: "Falsa central do banco", isScam: true,
          sender: "+55 11 94021-3376", saved: false, pushName: "Central de Segurança", time: "15:18",
          messages: [
            { text: "Olá! Identificamos uma compra de R$ 2.390,00 no seu cartão final 4521." },
            { text: "Se não reconhece, responda 1 e vamos te ligar para cancelar." },
          ],
          explanation: "Golpe: bancos não iniciam atendimento por um número comum de WhatsApp.",
          signals: [
            "Número desconhecido, não verificado",
            "O nome “Central de Segurança” foi escrito pelo próprio golpista — qualquer um pode fazer isso",
            "O objetivo é levar você para uma ligação e pedir seus dados",
          ],
          action: "Não responda. Ligue para o número que está no verso do seu cartão.",
        },
        {
          id: 117, type: "QR Code", category: "QR Code oficial", isScam: false,
          context: "Cartaz no mural do refeitório, junto com os outros comunicados do RH:",
          posterTag: "RH · Ferreira Costa", posterTitle: "Pesquisa de Clima 2026",
          posterText: "Sua opinião é anônima. Aponte a câmera e responda em 5 minutos.",
          qrUrl: "rh.ferreiracosta.com.br/pesquisa-clima",
          explanation: "Legítimo: cartaz oficial e a câmera mostra um endereço da empresa.",
          signals: [
            "A câmera mostra um endereço do domínio oficial: ferreiracosta.com.br",
            "Cartaz impresso, no mural oficial, sem nada colado por cima",
            "Não promete prêmio nem cria urgência",
          ],
          action: "Pode responder. Se pedir senha, confira o endereço de novo antes.",
        },
        {
          id: 118, type: "Email", category: "Aviso de manutenção", isScam: false,
          fromName: "Rafael Andrade", fromAddress: "rafael.andrade@ferreiracosta.com.br", time: "17:30",
          subject: "Sistema de ponto fora do ar na segunda (7h às 8h)",
          body: "Olá!\n\nNa segunda-feira, das 7h às 8h, o sistema de ponto vai passar por atualização e ficará indisponível.\n\nNão é preciso fazer nada: as marcações desse horário poderão ser feitas depois.\n\nRafael — TI",
          explanation: "Legítimo: comunicado informativo, no domínio oficial, sem pedir nada.",
          signals: [
            "Domínio oficial e remetente identificado",
            "Só informa — não pede clique, senha nem dados",
            "Comunicado comum de manutenção",
          ],
          action: "Nenhuma ação necessária.",
        },
        {
          id: 119, type: "SMS", category: "Aviso de compra", isScam: false,
          context: "Você acabou de pagar o café da manhã com o cartão e chega esta mensagem:",
          sender: "28890", time: "08:14",
          messages: ["Compra aprovada: R$ 52,30 em PADARIA PAO QUENTE, cartão final 4521, 08:14. Não reconhece? Ligue para o número do verso do seu cartão."],
          explanation: "Legítimo: confirma a compra que você acabou de fazer e não pede nada.",
          signals: [
            "Bate com a compra que você acabou de fazer",
            "Não tem link nem telefone para ligar — manda usar o verso do cartão",
            "Só informa, não pede resposta nem dados",
          ],
          action: "Tudo certo. É esse o tipo de aviso que os bancos enviam de verdade.",
        },
        {
          id: 120, type: "Ligação", category: "Atendimento oficial", isScam: false,
          context: "Você ligou para a central do banco usando o número impresso no verso do seu cartão:",
          caller: "Central de Atendimento", callerNote: "Chamada feita por você", duration: "01:12",
          speaker: "Atendente",
          lines: [
            "Central de atendimento, boa tarde! Para sua segurança, vou confirmar alguns dados.",
            "Pode me informar sua data de nascimento e os quatro últimos números do cartão?",
          ],
          explanation: "Legítimo: foi você quem ligou, para o número oficial, e só pedem dados básicos.",
          signals: [
            "Você ligou para o número oficial impresso no cartão",
            "Pedem só dados básicos de confirmação — nada de senha ou código",
            "O atendimento começou por iniciativa sua",
          ],
          action: "Pode seguir. Se pedirem senha ou código do SMS, desligue.",
        },
      ]
    },
    {
      id: 3,
      name: "Especialista",
      color: "#E71C35",
      icon: "III",
      description: "Golpes sofisticados. Só os mais atentos identificam!",
      scenarios: [
        {
          id: 121, type: "Email", category: "Phishing · domínio parecido", isScam: true,
          fromName: "RH Ferreira Costa", fromAddress: "rh@ferreiracosta.corn.br", time: "10:05",
          subject: "Atualização cadastral — folha de outubro",
          body: "Identificamos divergência nos seus dados bancários.\n\nPara receber o salário deste mês sem atraso, responda este e-mail com banco, agência e conta até sexta-feira.",
          explanation: "Golpe: o domínio imita o da empresa trocando uma letra.",
          signals: [
            "Olhe de perto: “corn.br” usa “r”+“n” no lugar do “m” de “.com.br”",
            "O RH não pede dados bancários respondendo e-mail",
            "Ameaça de atraso no salário para apressar",
          ],
          action: "Não responda. Confira seus dados pelo canal oficial do RH.",
        },
        {
          id: 122, type: "WhatsApp", category: "Deepfake de voz", isScam: true,
          sender: "Pedro Almeida", saved: true, time: "22:41",
          messages: [
            { audio: "0:11", transcript: "Fui assaltado, tô sem cartão e com o celular quase sem bateria. Me manda R$ 1.500 no Pix, por favor. Não liga que eu não consigo atender." },
            { text: "Chave Pix (é da minha prima): 318.554.207-90" },
          ],
          explanation: "Golpe: a voz pode ser clonada por IA, e o “não liga” impede você de confirmar.",
          signals: [
            "Pedido urgente de dinheiro, proibindo você de ligar",
            "Pix para a conta de outra pessoa",
            "Vozes podem ser clonadas com poucos segundos de áudio",
          ],
          action: "Ligue ou faça uma chamada de vídeo antes. Combine uma palavra-código com a família.",
        },
        {
          id: 123, type: "Site", category: "Endereço oficial", isScam: false,
          context: "Você digitou o endereço do portal da empresa direto no navegador:",
          url: "https://portal.ferreiracosta.com.br/login", brand: "Ferreira Costa",
          pageTitle: "Portal do Colaborador",
          body: "Entre com seu usuário e senha corporativos.",
          fields: ["Usuário", "Senha"], cta: "Entrar",
          explanation: "Legítimo: foi você quem digitou, e o endereço termina no domínio oficial.",
          signals: [
            "Foi você quem digitou o endereço — não veio de link",
            "O endereço termina exatamente em ferreiracosta.com.br/",
            "Nada é pedido além do login normal",
          ],
          action: "Pode entrar normalmente.",
        },
        {
          id: 124, type: "Site", category: "Phishing · subdomínio disfarçado", isScam: true,
          context: "Chegou um e-mail dizendo que sua senha expira hoje. Você tocou no link:",
          url: "https://ferreiracosta.com.br.portal-acesso.net/login", brand: "Ferreira Costa",
          pageTitle: "Portal do Colaborador",
          body: "Sua senha expira hoje. Entre para renovar seu acesso.",
          fields: ["Usuário", "Senha"], cta: "Entrar",
          explanation: "Golpe: o site de verdade é “portal-acesso.net”. O nome da empresa no começo é disfarce.",
          signals: [
            "O dono do site é o que vem logo antes da primeira “/”: aqui, portal-acesso.net",
            "“ferreiracosta.com.br” no começo é só um disfarce",
            "O cadeado só mostra que a conexão é protegida — não que o site é confiável",
          ],
          action: "Feche a página, acesse o portal digitando o endereço e reporte o e-mail.",
        },
        {
          id: 125, type: "QR Code", category: "QR Code adulterado", isScam: true,
          context: "Num evento interno, você vai confirmar presença pelo cartaz oficial:",
          posterTag: "Convenção Ferreira Costa 2026", posterTitle: "Confirme sua presença",
          posterText: "Aponte a câmera para o QR Code e faça seu check-in.",
          qrUrl: "checkin-convencao.com/fc", sticker: true,
          explanation: "Golpe: colaram um QR Code falso por cima do original.",
          signals: [
            "Tem um adesivo colado por cima do QR Code impresso",
            "A câmera mostra um endereço fora do domínio da empresa",
            "QR Code é só um link: confira o endereço antes de abrir",
          ],
          action: "Não abra. Avise a organização do evento e o time de Cibersegurança.",
        },
        {
          id: 126, type: "Ligação", category: "Deepfake corporativo", isScam: true,
          caller: "Ricardo (gestor)", callerNote: "Contato salvo · celular", duration: "00:27",
          lines: [
            "Oi, é o Ricardo. Tô entrando num voo agora e não vou conseguir falar.",
            "Preciso que você aprove hoje o pagamento daquele fornecedor, sem passar pelo fluxo normal. Depois eu formalizo, tá?",
          ],
          explanation: "Golpe: pedido para pular o processo, com urgência e sem registro — voz e número podem ser falsificados.",
          signals: [
            "Pedido para pular o fluxo de aprovação",
            "“Depois eu formalizo”: nada fica registrado",
            "Voz e número podem ser falsificados",
          ],
          action: "Não aprove. Confirme por escrito, por outro canal, e siga o fluxo normal.",
        },
        {
          id: 127, type: "WhatsApp", category: "Malware · boleto falso", isScam: true,
          sender: "+55 11 93321-0098", saved: false, pushName: "Financeiro", time: "14:56",
          messages: [
            { text: "Boa tarde! Segue o boleto atualizado da sua pendência." },
            { file: { name: "Boleto_Atualizado_0925.pdf", meta: "1 página · 182 kB · PDF" } },
            { text: "Precisa ser pago hoje para não ir a protesto." },
          ],
          explanation: "Golpe: cobrança inesperada de um número desconhecido, com anexo e ameaça.",
          signals: [
            "Número desconhecido cobrando uma pendência que você não conhece",
            "Anexo inesperado: pode ter vírus ou um boleto adulterado",
            "Ameaça de protesto para apressar",
          ],
          action: "Não abra o anexo. Confira a cobrança direto com a empresa, pelos canais oficiais.",
        },
        {
          id: 128, type: "Email", category: "Fraude do CEO", isScam: true,
          fromName: "João Silva (CEO)", fromAddress: "joao.silva.ceo@outlook.com", time: "09:58",
          subject: "Preciso de você agora",
          body: "Estou em reunião e não consigo ligar.\n\nPreciso que você compre 5 cartões-presente de R$ 500 para clientes e me mande os códigos por aqui. É confidencial: não comente com ninguém.",
          explanation: "Golpe: nome do CEO com endereço externo, pedindo cartão-presente em sigilo.",
          signals: [
            "Nome do CEO, mas o endereço é externo (outlook.com)",
            "Cartão-presente + sigilo + urgência é o golpe clássico do “chefe”",
            "Pedido para não comentar com ninguém",
          ],
          action: "Não compre nada. Confirme com a pessoa por outro canal e reporte.",
        },
        {
          id: 129, type: "SMS", category: "Código que você pediu", isScam: false,
          context: "Você acabou de digitar sua senha no portal da empresa, que avisou que enviaria um código:",
          sender: "29052", time: "09:31",
          messages: ["Ferreira Costa: seu código de verificação é 739204. Ele expira em 5 minutos. Nunca informe este código a ninguém."],
          explanation: "Legítimo: é o código que você acabou de pedir ao entrar no portal.",
          signals: [
            "Foi você quem pediu o código, ao fazer login",
            "Sem link e sem pedido de resposta",
            "A própria mensagem avisa para não passar o código a ninguém",
          ],
          action: "Use o código só no portal — e nunca o informe a outra pessoa.",
        },
        {
          id: 130, type: "Email", category: "Comunicado de Segurança", isScam: false,
          fromName: "Cibersegurança Ferreira Costa", fromAddress: "alerta.cyber@ferreiracosta.com.br", time: "16:12",
          subject: "Aviso: exercício de phishing simulado na próxima semana",
          body: "Olá!\n\nNa próxima semana, o time de Cibersegurança vai enviar e-mails de teste para treinar nossa atenção a golpes.\n\nNada precisa ser feito agora. Se receber algo suspeito, encaminhe para este endereço.",
          explanation: "Legítimo: aviso informativo do domínio oficial, sem link nem pedido de dados.",
          signals: [
            "Domínio oficial e remetente conhecido",
            "Só informa — sem link para clicar nem dado para enviar",
            "Orienta a reportar, que é o comportamento certo",
          ],
          action: "Nenhuma ação necessária — e reporte o que parecer suspeito!",
        },
      ]
    }
  ]
};
