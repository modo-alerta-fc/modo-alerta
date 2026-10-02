const gameData = {
  levels: [
    {
      id: 1,
      name: "Recruta",
      color: "#7AC143",
      icon: "I",
      description: "Situações mais comuns do dia a dia. Fique atento aos sinais óbvios!",
      scenarios: [
        {
          id: 1,
          type: "SMS",
          category: "Smishing",
          title: "Mensagem de texto recebida",
          sender: "+55 11 98xxx-xxxx",
          content: "BRADESCO: Parabéns! Você ganhou R$5.000,00. Resgate agora: bit.ly/brad-premio",
          isScam: true,
          explanation: "Golpe de smishing! Bancos não enviam prêmios por SMS com links encurtados. Desconfie de urgência + dinheiro fácil."
        },
        {
          id: 2,
          type: "WhatsApp",
          category: "Engenharia Social",
          title: "Mensagem no WhatsApp",
          sender: "Número desconhecido (\"do TI\")",
          content: "Oi! Aqui é do suporte de TI. Pode me confirmar sua senha de rede? É rapidinho, preciso testar um acesso.",
          isScam: true,
          explanation: "Violação da PSI: nenhum setor solicita senha por mensagem, e senha é pessoal e intransferível. Confirme sempre por outro canal (ex: ramal oficial do TI)."
        },
        {
          id: 3,
          type: "WhatsApp",
          category: "Contato pessoal",
          title: "Mensagem no WhatsApp",
          sender: "Mãe 💙 (contato salvo)",
          content: "Oi! Pode me mandar a receita do bolo de cenoura que você fez? Ficou uma delícia!",
          isScam: false,
          explanation: "Legítimo: contato salvo, contexto claro, sem pedido de dados, dinheiro ou acesso. Sem sinais de golpe."
        },
        {
          id: 4,
          type: "Ligação",
          category: "Vishing",
          title: "Chamada recebida",
          sender: "Número desconhecido",
          content: "\"Aqui é do suporte da Microsoft. Detectamos um vírus no seu computador. Preciso de acesso remoto agora.\"",
          isScam: true,
          explanation: "Vishing clássico: nenhuma empresa liga proativamente pedindo acesso remoto. Desligue e, em dúvida, reporte ao CSIRT."
        },
        {
          id: 5,
          type: "Email",
          category: "Comunicado interno",
          title: "E-mail recebido",
          sender: "mariana.torres@ferreiracosta.com.br",
          subject: "Reunião de equipe — quinta, 10h",
          content: "Olá equipe, lembrando da reunião de alinhamento quinta às 10h na sala B. Abs, Mariana — RH",
          isScam: false,
          explanation: "Legítimo: domínio oficial no padrão nome.sobrenome@ferreiracosta.com.br, conteúdo esperado, sem links suspeitos ou pedido de dados."
        },
        {
          id: 16,
          type: "SMS",
          category: "Smishing",
          title: "Mensagem de texto recebida",
          sender: "Correios",
          content: "Seu pacote está retido na alfândega. Pague a taxa de liberação: correios-taxa.com/pagar",
          isScam: true,
          explanation: "Golpe: Correios não cobram taxa por link de SMS. Domínio 'correios-taxa.com' não é oficial — o site real é correios.com.br."
        },
        {
          id: 17,
          type: "WhatsApp",
          category: "Contato de trabalho",
          title: "Mensagem no WhatsApp",
          sender: "Grupo da equipe (contato salvo)",
          content: "Bom dia! Vou chegar 15min atrasado hoje, preso no trânsito. Já aviso quando chegar.",
          isScam: false,
          explanation: "Legítimo: mensagem simples, contexto normal de trabalho, contato conhecido, sem pedido de dados ou dinheiro."
        },
        {
          id: 18,
          type: "Ligação",
          category: "Vishing",
          title: "Chamada recebida",
          sender: "\"Central do seu banco\"",
          content: "\"Detectamos uma compra suspeita no seu cartão. Pra cancelar, confirme o número completo do cartão e o código de segurança do verso.\"",
          isScam: true,
          explanation: "Vishing clássico: bancos nunca pedem o número completo do cartão nem o código de segurança por telefone. Desligue e ligue você para o número oficial no verso do cartão."
        },
        {
          id: 19,
          type: "Email",
          category: "Comunicado interno",
          title: "E-mail recebido",
          sender: "ana.pereira@ferreiracosta.com.br",
          subject: "Convite: Reunião semanal do time",
          content: "Você foi convidado para o evento recorrente 'Reunião semanal do time', toda sexta às 9h. Aceitar / Recusar / Talvez.",
          isScam: false,
          explanation: "Legítimo: convite de calendário enviado pela organizadora (nome.sobrenome@ferreiracosta.com.br), conteúdo esperado e recorrente — sem pedido de dados ou link externo."
        },
        {
          id: 20,
          type: "SMS",
          category: "Golpe de emprego",
          title: "Mensagem de texto recebida",
          sender: "Número desconhecido",
          content: "Vaga HOME OFFICE ganhando R$300/dia! Cadastre-se agora, vagas limitadas: vaga-facil.net",
          isScam: true,
          explanation: "Golpe de emprego fácil: promessa de ganho alto por pouco trabalho + link desconhecido + urgência de vagas limitadas são sinais clássicos de golpe."
        }
      ]
    },
    {
      id: 2,
      name: "Investigador",
      color: "#f5a623",
      icon: "II",
      description: "As coisas ficam mais sutis. Nem sempre é óbvio — preste atenção nos detalhes!",
      scenarios: [
        {
          id: 6,
          type: "Email",
          category: "Phishing (Domínio Falso)",
          title: "E-mail recebido",
          context: "Você está no seu e-mail pessoal, numa manhã comum, quando chega:",
          sender: "noreply@netflix-verificacao.com",
          subject: "Pagamento recusado — atualize seus dados",
          content: "Não conseguimos processar seu pagamento. Atualize seus dados agora para não perder o acesso.",
          cta: "Atualizar Meus Dados",
          isScam: true,
          explanation: "Phishing: 'netflix-verificacao.com' não é domínio da Netflix (o real é só netflix.com). Empresas não usam domínios extras para cobrança — confira sempre o endereço completo do remetente."
        },
        {
          id: 7,
          type: "Ligação",
          category: "Vishing / MFA",
          title: "Chamada recebida",
          sender: "\"TI Ferreira Costa\"",
          content: "\"Identificamos uma tentativa de invasão na sua conta. Me passa o código que chegou no seu celular agora pra eu bloquear.\"",
          isScam: true,
          explanation: "Violação grave: o código do segundo fator (MFA) nunca deve ser compartilhado, nem com quem diz ser da própria empresa. Esse pedido é sempre golpe."
        },
        {
          id: 8,
          type: "WhatsApp",
          category: "Golpe do número novo",
          title: "Mensagem no WhatsApp",
          sender: "Número desconhecido",
          content: "Oi, troquei de número! Tô com um problema urgente, pode me fazer um Pix de R$800? Te devolvo amanhã.",
          isScam: true,
          explanation: "Golpe do 'número novo': sempre confirme por outro canal (ligação, número antigo) antes de qualquer Pix, mesmo com urgência."
        },
        {
          id: 9,
          type: "Email",
          category: "Phishing / Classificação da Informação",
          title: "E-mail recebido",
          sender: "diretoria.comercial@ferreiracosta-corp.com",
          subject: "Lista de clientes — urgente",
          content: "Preciso da lista de clientes agora para uma reunião externa. Me manda pro meu Gmail, não dá tempo de usar o sistema interno.",
          isScam: true,
          explanation: "Golpe: o domínio 'ferreiracosta-corp.com' não é da empresa (o real é ferreiracosta.com.br), e mesmo que fosse, lista de clientes é Confidencial — nunca sai por Gmail pessoal. Urgência + pedido de furar a política é sinal claro de golpe."
        },
        {
          id: 10,
          type: "QR Code",
          category: "QR Code oficial",
          title: "QR Code em cartaz na empresa",
          sender: "Cartaz no mural da sala de treinamento (RH)",
          content: "'Participe da pesquisa de clima organizacional! Escaneie o QR Code e responda pelo portal oficial.'",
          isScam: false,
          explanation: "Legítimo: fonte interna conhecida (RH), sem promessa de dinheiro ou urgência artificial, e leva ao portal oficial da empresa — diferente do QR Code de rua sem identificação."
        },
        {
          id: 21,
          type: "LinkedIn",
          category: "Job Scam",
          title: "Mensagem no LinkedIn",
          sender: "\"Recrutadora\" — perfil novo, poucas conexões",
          content: "Vaga remota, R$15.000/mês, início imediato! Antes da entrevista, preciso dos seus dados bancários pra já cadastrar no sistema de pagamento.",
          isScam: true,
          explanation: "Golpe de emprego: nenhuma empresa pede dados bancários antes de uma entrevista. Salário fora da realidade + urgência são sinais de alerta."
        },
        {
          id: 22,
          type: "Site",
          category: "Phishing de Rastreio",
          title: "Link recebido por SMS",
          context: "Você recebeu um link de rastreio por SMS e abriu no navegador do celular:",
          sender: "rastreio-encomenda24h.com/entrega",
          content: "Confirme seu CPF e os dados do cartão de crédito para liberar a entrega pendente do seu pedido.",
          cta: "Confirmar Entrega",
          isScam: true,
          explanation: "Golpe: o domínio 'rastreio-encomenda24h.com' não é de nenhuma transportadora real — Correios, Sedex e transportadoras usam seus próprios domínios oficiais. Além disso, nenhuma entrega exige dados de cartão de crédito."
        },
        {
          id: 23,
          type: "Email",
          category: "Comunicado oficial de TI",
          title: "E-mail recebido",
          sender: "rafael.andrade@ferreiracosta.com.br",
          subject: "Troca de senha obrigatória — sistemas internos",
          content: "Sua senha expira hoje à meia-noite. Troque diretamente no sistema interno — não enviamos links de troca de senha por e-mail.",
          isScam: false,
          explanation: "Legítimo, mesmo com urgência real: domínio pessoal correto (nome.sobrenome@ferreiracosta.com.br), sem link externo, e instrui a trocar a senha direto no sistema. Urgência por si só não é sinal de golpe — o que importa é a origem e a ausência de link ou pedido de dado."
        },
        {
          id: 24,
          type: "WhatsApp",
          category: "Contato de RH",
          title: "Mensagem no WhatsApp",
          sender: "RH (contato salvo)",
          content: "Oi! Você teria disponibilidade pro treinamento de segurança na quinta às 14h? Só confirmar presença.",
          isScam: false,
          explanation: "Legítimo: contato conhecido, pedido simples e esperado (confirmar presença), sem solicitação de dados ou dinheiro."
        },
        {
          id: 25,
          type: "Ligação",
          category: "Pretexting",
          title: "Chamada recebida",
          sender: "\"Auditoria interna\"",
          content: "\"Estamos fazendo uma checagem de rotina. Pode me informar o valor do último Pix que você recebeu ou enviou?\"",
          isScam: true,
          explanation: "Golpe de pretexting: auditorias reais não pedem informações financeiras pessoais por telefone, sem identificação formal e sem passar pelo canal oficial."
        }
      ]
    },
    {
      id: 3,
      name: "Especialista",
      color: "#E71C35",
      icon: "III",
      description: "Golpes avançados e sofisticados. Apenas os mais atentos conseguem identificar!",
      scenarios: [
        {
          id: 11,
          type: "Email",
          category: "Spear Phishing / BEC",
          title: "E-mail recebido",
          sender: "joao.silva@ferreiracosta.com.br (CEO)",
          subject: "Preciso da sua ajuda agora",
          content: "Estou em reunião e não posso ligar. Compra 5 cartões-presente de R$500 e me manda os códigos. Não comenta com ninguém.",
          isScam: true,
          explanation: "BEC (Business Email Compromise): pedido de cartão-presente + sigilo + urgência é sempre golpe, mesmo vindo do e-mail real do executivo. Confirme por outro canal."
        },
        {
          id: 12,
          type: "WhatsApp",
          category: "Deepfake de Voz",
          title: "Áudio no WhatsApp",
          sender: "Contato salvo do seu amigo",
          content: "🎵 Áudio: \"Fui assaltado, tô sem cartão. Me manda R$1.500 no Pix agora, não liga que tô sem bateria.\"",
          isScam: true,
          explanation: "Deepfake de voz: IA clona vozes com poucos segundos de áudio. 'Não liga' é sinal máximo de alerta — sempre confirme por outro meio antes de transferir."
        },
        {
          id: 13,
          type: "Site",
          category: "Verificação de URL",
          title: "URL digitada no navegador",
          context: "Você digita o endereço do portal da empresa direto no navegador e chega nesta página:",
          sender: "https://portal.ferreiracosta.com.br/login",
          content: "Portal Ferreira Costa — entre com seu usuário e senha corporativos para acessar os sistemas internos.",
          cta: "Entrar",
          isScam: false,
          explanation: "Legítimo: 'ferreiracosta.com.br' é o domínio principal, sem nada extra antes ou depois dele. É esse padrão que diferencia de um golpe de pharming (domínio real disfarçado como subdomínio)."
        },
        {
          id: 14,
          type: "WhatsApp",
          category: "Privacidade / LGPD",
          title: "Mensagem no WhatsApp",
          sender: "Colega de outro setor",
          content: "Você pode ver no sistema se o telefone do [cliente] mudou? É pra eu mandar uma coisa pessoal pra ele, nada a ver com trabalho.",
          isScam: true,
          revealLabel: "NÃO É LEGÍTIMO",
          explanation: "Não é golpe, mas também não é legítimo — é violação da PSI (item 11): acessar dados por curiosidade ou motivo pessoal é proibido, mesmo sendo um colega pedindo. Todo acesso exige propósito legítimo de negócio."
        },
        {
          id: 15,
          type: "Email",
          category: "Comunicado oficial do CSIRT",
          title: "E-mail recebido",
          sender: "alerta.cyber@ferreiracosta.com.br",
          subject: "Manutenção programada — autenticação",
          content: "Informamos uma janela de manutenção nos sistemas de autenticação neste sábado, das 22h às 2h. Nenhuma ação é necessária.",
          isScam: false,
          explanation: "Legítimo: domínio correto e completo (ferreiracosta.com.br, sem letras trocadas nem nada a mais), sem link para clicar nem pedido de dado ou senha — só um aviso informativo, como o CSIRT realmente se comunica."
        },
        {
          id: 26,
          type: "Email",
          category: "Phishing (Domínio Falso)",
          title: "E-mail recebido",
          sender: "rh@ferreiracosta.corn.br",
          subject: "Atualização cadastral — folha de pagamento",
          content: "Para atualizar seus dados na folha de pagamento deste mês, confirme sua conta bancária respondendo este e-mail.",
          isScam: true,
          explanation: "Phishing: 'ferreiracosta.corn.br' usa 'rn' no lugar do 'm' — parece igual à primeira vista, mas não é o domínio real. RH nunca pede dados bancários por e-mail."
        },
        {
          id: 27,
          type: "WhatsApp",
          category: "Malware por Anexo",
          title: "Mensagem no WhatsApp",
          sender: "Número desconhecido",
          content: "📎 Boleto_Atualizado.pdf — \"Segue o boleto da pendência. Precisa ser pago hoje pra não gerar juros.\"",
          isScam: true,
          explanation: "Golpe: anexo inesperado de número desconhecido, cobrança urgente e sem contexto prévio. Arquivos assim podem conter malware — nunca abra sem confirmar a origem."
        },
        {
          id: 28,
          type: "QR Code",
          category: "QR Code Adulterado",
          title: "QR Code em evento da empresa",
          context: "Você está num evento interno e vai confirmar presença escaneando o cartaz oficial:",
          sender: "Adesivo colado sobre o cartaz oficial do evento",
          content: "Cartaz oficial pede para escanear o QR Code e confirmar presença — mas o QR Code tem um adesivo colado por cima, ligeiramente torto.",
          isScam: true,
          explanation: "Golpe de QR Code adulterado: alguém cola um QR falso por cima do oficial (QR swapping). Sinal de alerta: adesivo solto, mal alinhado, sobre o cartaz impresso original."
        },
        {
          id: 29,
          type: "Ligação",
          category: "Deepfake Corporativo",
          title: "Chamada recebida",
          sender: "Número do seu gestor direto",
          content: "Voz muito parecida com a do seu gestor: \"Preciso que você aprove uma transferência urgente agora, te explico depois, só confirma verbalmente.\"",
          isScam: true,
          explanation: "Deepfake corporativo: pedido de aprovação financeira urgente só por voz, sem registro formal, é sempre suspeito — mesmo que a voz pareça idêntica. Confirme por escrito e por outro canal."
        },
        {
          id: 30,
          type: "Email",
          category: "Comunicado oficial de Segurança",
          title: "E-mail recebido",
          sender: "alerta.cyber@ferreiracosta.com.br",
          subject: "Aviso: campanha de phishing simulado na próxima semana",
          content: "Na próxima semana, o time de Cibersegurança enviará e-mails de teste para avaliar nossa atenção a phishing. Nenhuma ação é necessária agora.",
          isScam: false,
          explanation: "Legítimo: domínio correto, sem link, sem pedido de dado — apenas um aviso informativo do próprio time de segurança sobre uma ação futura."
        }
      ]
    }
  ]
};
