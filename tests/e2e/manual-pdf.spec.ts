import { test, expect, type Page } from "@playwright/test";
import { promises as fs } from "node:fs";
import path from "node:path";
import { installManualApiMock } from "./helpers/manualApiMock";
import { authenticateAs } from "./helpers/authSession";

type PerfilManual = "ADMIN" | "SAC" | "ASSISTENCIA";

interface ManualScreen {
  id: string;
  titulo: string;
  rota: string;
  perfil: PerfilManual;
  objetivo: string;
  partes: string[];
  passos: string[];
  abrirModal?: "buscarCliente";
}

const OUTPUT_DIR = path.resolve("docs/manual");
const SHOTS_DIR = path.join(OUTPUT_DIR, "screenshots");
const HTML_PATH = path.join(OUTPUT_DIR, "manual-telas-sgq-rodrigues.html");
const PDF_PATH = path.join(OUTPUT_DIR, "manual-telas-sgq-rodrigues.pdf");

const screens: ManualScreen[] = [
  {
    id: "login",
    titulo: "Login",
    rota: "/login",
    perfil: "ADMIN",
    objetivo: "Autenticar o usuário no sistema SGQ.",
    partes: ["Campo E-mail", "Campo Senha", "Botao Entrar"],
    passos: ["Informe credenciais", "Clique em Entrar"],
  },
  {
    id: "dashboard",
    titulo: "Dashboard da Qualidade",
    rota: "/",
    perfil: "ADMIN",
    objetivo: "Visão executiva de indicadores de Garantias, NC e CAPA.",
    partes: ["Cards de KPIs", "Gráficos de tendência", "Distribuições por categoria/gravidade"],
    passos: ["Revise os KPIs principais", "Analise os gráficos", "Use como ponto de partida para investigação"],
  },
  {
    id: "garantias-lista",
    titulo: "Garantias - Lista",
    rota: "/garantias",
    perfil: "ADMIN",
    objetivo: "Consultar e acompanhar casos de garantia cadastrados.",
    partes: ["Tabela de casos", "Status e filtros", "Ação de nova garantia"],
    passos: ["Localize o caso desejado", "Valide status e dados do cliente", "Acesse criação de novo caso quando necessário"],
  },
  {
    id: "garantias-nova",
    titulo: "Garantias - Nova Garantia",
    rota: "/garantias/nova",
    perfil: "ADMIN",
    objetivo: "Registrar um novo caso de garantia com dados comerciais e evidências.",
    partes: ["Dados do cliente/pedido", "Dados do defeito", "Área de upload de evidências"],
    passos: ["Preencha os campos obrigatórios", "Anexe evidências", "Salve o caso"],
  },
  {
    id: "nc-lista",
    titulo: "Não Conformidades - Lista",
    rota: "/nao-conformidades",
    perfil: "ADMIN",
    objetivo: "Visualizar registros de NC e monitorar evolução de tratamento.",
    partes: ["Tabela de NCs", "Status/gravidade", "Ação de nova NC"],
    passos: ["Consulte os registros", "Priorize por gravidade", "Abra nova NC quando aplicável"],
  },
  {
    id: "nc-nova",
    titulo: "Não Conformidades - Nova NC",
    rota: "/nao-conformidades/nova",
    perfil: "ADMIN",
    objetivo: "Cadastrar nova não conformidade com classificação e plano inicial.",
    partes: ["Classificação", "Descrição e causa raiz", "Plano de ação e prazo"],
    passos: ["Defina tipo e gravidade", "Descreva a NC", "Informe responsável e prazo"],
  },
  {
    id: "capa-lista",
    titulo: "CAPA - Lista",
    rota: "/capa",
    perfil: "ADMIN",
    objetivo: "Acompanhar ações corretivas e preventivas abertas no SGQ.",
    partes: ["Cards/tabela de CAPAs", "Status das ações", "Acesso à criação"],
    passos: ["Identifique a ação", "Revise status e responsável", "Abra nova CAPA quando necessário"],
  },
  {
    id: "capa-nova",
    titulo: "CAPA - Nova CAPA",
    rota: "/capa/nova",
    perfil: "ADMIN",
    objetivo: "Planejar ação corretiva/preventiva com origem, causa e prazos.",
    partes: ["Origem da CAPA", "Descrição do problema", "Responsável e datas"],
    passos: ["Escolha origem e vínculo", "Documente causa e plano", "Defina prazo e salve"],
  },
  {
    id: "auditorias-lista",
    titulo: "Auditorias - Lista",
    rota: "/auditorias",
    perfil: "ADMIN",
    objetivo: "Consultar auditorias planejadas, em execução e concluídas.",
    partes: ["Visão da agenda/lista", "Status da auditoria", "Ações de calendário e nova auditoria"],
    passos: ["Acompanhe auditorias vigentes", "Verifique responsáveis e datas", "Acesse criação ou calendário"],
  },
  {
    id: "auditorias-calendario",
    titulo: "Auditorias - Calendário",
    rota: "/auditorias/calendario",
    perfil: "ADMIN",
    objetivo: "Visualizar auditorias em formato de calendário operacional.",
    partes: ["Calendário", "Eventos de auditoria", "Navegação mensal"],
    passos: ["Selecione o perÃ­odo", "Consulte eventos planejados", "Ajuste o planejamento conforme necessidade"],
  },
  {
    id: "auditorias-nova",
    titulo: "Auditorias - Nova Auditoria",
    rota: "/auditorias/nova",
    perfil: "ADMIN",
    objetivo: "Criar auditoria informando template, escopo e agenda.",
    partes: ["Configuração de tipo/template", "Local e auditor", "Planejamento de datas"],
    passos: ["Selecione o template", "Preencha local e auditor", "Defina datas e salve"],
  },
  {
    id: "sac-dashboard",
    titulo: "SAC - Dashboard",
    rota: "/sac/dashboard",
    perfil: "SAC",
    objetivo: "Monitorar indicadores de atendimentos e requisições do SAC.",
    partes: ["KPIs de atendimento", "Distribuição por status/tipo/planta", "Resumo de requisições"],
    passos: ["Analise os indicadores", "Compare distribuição por planta", "Acesse listas operacionais"],
  },
  {
    id: "sac-atendimentos",
    titulo: "SAC - Atendimentos",
    rota: "/sac/atendimentos",
    perfil: "SAC",
    objetivo: "Listar e gerenciar atendimentos SAC registrados.",
    partes: ["Tabela de atendimentos", "Status do atendimento", "Ações de detalhe/novo"],
    passos: ["Filtre o atendimento", "Abra detalhes para análise", "Inicie novo atendimento quando necessário"],
  },
  {
    id: "sac-novo",
    titulo: "SAC - Novo Atendimento",
    rota: "/sac/novo",
    perfil: "SAC",
    objetivo: "Registrar atendimento SAC com vínculo cliente -> pedido -> item.",
    partes: ["Dados do cliente", "Pedidos e itens do cliente", "Descrição e evidências"],
    passos: ["Busque o cliente", "Selecione pedido e item", "Descreva a reclamação e salve atendimento"],
    abrirModal: "buscarCliente",
  },
  {
    id: "sac-pesquisa",
    titulo: "SAC - Pesquisa",
    rota: "/sac/pesquisa",
    perfil: "SAC",
    objetivo: "Pesquisar histórico consolidado de SAC, garantias, NC e CAPA.",
    partes: ["Filtros de pesquisa", "Resultado consolidado", "Navegação entre contextos"],
    passos: ["Preencha filtros", "Execute pesquisa", "Analise histórico encontrado"],
  },
  {
    id: "sac-detalhe",
    titulo: "SAC - Detalhe do Atendimento",
    rota: "/sac/SAC-001",
    perfil: "SAC",
    objetivo: "Consultar dados completos de um atendimento SAC especÃ­fico.",
    partes: ["Resumo do atendimento", "Timeline de ações", "Informações de cliente/produto"],
    passos: ["Confira dados principais", "Valide timeline", "Atualize status quando aplicável"],
  },
  {
    id: "sac-req-lista",
    titulo: "SAC - Requisições de Material",
    rota: "/sac/requisicoes",
    perfil: "SAC",
    objetivo: "Gerenciar requisições de material vinculadas aos atendimentos.",
    partes: ["Abas pendentes/atendidas", "Tabela com status", "Ações de atender/detalhar"],
    passos: ["Selecione a aba desejada", "Abra a requisição", "Execute atendimento ou consulta detalhada"],
  },
  {
    id: "sac-req-nova",
    titulo: "SAC - Nova Requisição",
    rota: "/sac/requisicoes/nova",
    perfil: "SAC",
    objetivo: "Cadastrar nova requisição de material para assistência.",
    partes: ["Dados do cliente e contexto", "Motivo/prioridade", "Itens requisitados"],
    passos: ["Informe dados da requisição", "Adicione materiais", "Salve o registro"],
  },
  {
    id: "sac-req-detalhe",
    titulo: "SAC - Detalhe da Requisição",
    rota: "/sac/requisicoes/REQ-001",
    perfil: "SAC",
    objetivo: "Visualizar dados completos de uma requisição SAC.",
    partes: ["Dados do cliente", "Dados da requisição", "Itens requisitados e atendimento"],
    passos: ["Revise contexto", "Valide itens", "Acompanhe status e histórico de atendimento"],
  },
  {
    id: "sac-req-atender",
    titulo: "SAC - Atender Requisição",
    rota: "/sac/requisicoes/REQ-001/atender",
    perfil: "SAC",
    objetivo: "Executar atendimento da requisição com quantidades e situação por item.",
    partes: ["Tabela de itens", "Status final da requisição", "Observações do atendimento"],
    passos: ["Informe quantidade atendida por item", "Defina status final", "Conclua o atendimento"],
  },
  {
    id: "assist-dashboard",
    titulo: "Assistência - Dashboard",
    rota: "/assistencia/dashboard",
    perfil: "ASSISTENCIA",
    objetivo: "Acompanhar indicadores operacionais da assistência técnica.",
    partes: ["KPIs de OS e requisições", "Distribuição por status/planta", "Acessos rápidos"],
    passos: ["Observe indicadores crÃ­ticos", "Priorize OS pendentes", "Acesse telas operacionais"],
  },
  {
    id: "assist-os-lista",
    titulo: "Assistência - Lista de OS",
    rota: "/assistencia/os",
    perfil: "ASSISTENCIA",
    objetivo: "Listar ordens de serviço e navegar para o detalhe.",
    partes: ["Tabela de OS", "Status/prioridade", "Ação de nova OS"],
    passos: ["Filtre e localize a OS", "Clique na linha para abrir detalhe", "Crie nova OS quando necessário"],
  },
  {
    id: "assist-os-nova",
    titulo: "Assistência - Nova OS",
    rota: "/assistencia/os/nova",
    perfil: "SAC",
    objetivo: "Abrir nova OS com vínculo comercial e técnico.",
    partes: ["Origem da OS", "Busca cliente/pedido/item", "Dados técnicos da OS"],
    passos: ["Busque cliente", "Selecione pedido/item", "Preencha técnico e descrição e crie OS"],
    abrirModal: "buscarCliente",
  },
  {
    id: "assist-os-detalhe",
    titulo: "Assistência - Detalhe da OS",
    rota: "/assistencia/os/OS-001",
    perfil: "ASSISTENCIA",
    objetivo: "Gerenciar ciclo completo da OS (status, materiais, consumo e histórico).",
    partes: ["Resumo e dados da OS", "Ações por estado", "Requisições, consumo e logs de transição"],
    passos: ["Confira o estado atual", "Execute ações disponíveis", "Acompanhe histórico e materiais"],
  },
  {
    id: "assist-os-consumo",
    titulo: "Assistência - Consumo da OS",
    rota: "/assistencia/os/OS-001/consumo",
    perfil: "ASSISTENCIA",
    objetivo: "Registrar consumo de materiais na ordem de serviço.",
    partes: ["Dados da OS", "Materiais consumidos", "Formulário de registro"],
    passos: ["Selecione material", "Informe quantidade consumida", "Salve o consumo"],
  },
  {
    id: "assist-req-lista",
    titulo: "Assistência - Requisições",
    rota: "/assistencia/requisicoes",
    perfil: "ASSISTENCIA",
    objetivo: "Controlar requisições entre CD e assistência técnica.",
    partes: ["Tabela de requisições", "Status logístico", "Ações de recebimento"],
    passos: ["Consulte requisições em transferência", "Abra recebimento quando aplicável", "Acompanhe atendimento"],
  },
  {
    id: "assist-req-receber",
    titulo: "Assistência - Receber Requisição",
    rota: "/assistencia/requisicoes/REQA-001/receber",
    perfil: "ASSISTENCIA",
    objetivo: "Confirmar recebimento fÃ­sico dos itens enviados para assistência.",
    partes: ["Contexto da requisição", "Itens recebidos", "Confirmação final"],
    passos: ["Informe quantidades recebidas", "Adicione observação se necessário", "Confirme recebimento"],
  },
  {
    id: "assist-estoque",
    titulo: "Assistência - Estoque",
    rota: "/assistencia/estoque",
    perfil: "ASSISTENCIA",
    objetivo: "Consultar disponibilidade de materiais por planta.",
    partes: ["Tabela de materiais", "Saldos MAO/BEL/AGR", "Busca por código/descrição"],
    passos: ["Use busca para localizar material", "Compare saldos por planta", "Use referência para requisições"],
  },
  {
    id: "admin-home",
    titulo: "Administração - Visão Geral",
    rota: "/admin",
    perfil: "ADMIN",
    objetivo: "Centralizar navegação das configurações administrativas.",
    partes: ["Cards de módulos administrativos", "Acesso para usuários/perfis/logs/parâmetros"],
    passos: ["Selecione a área administrativa", "Abra a tela correspondente", "Execute manutenção do sistema"],
  },
  {
    id: "admin-usuarios",
    titulo: "Administração - Usuários",
    rota: "/administracao/usuarios",
    perfil: "ADMIN",
    objetivo: "Gerenciar cadastro e ativação de usuários do SGQ.",
    partes: ["Tabela de usuários", "Ações editar/ativar", "Modal de novo usuário"],
    passos: ["Revise usuários cadastrados", "Abra modal de edição/criação", "Salve alterações"],
  },
  {
    id: "admin-perfis",
    titulo: "Administração - Perfis",
    rota: "/administracao/perfis",
    perfil: "ADMIN",
    objetivo: "Visualizar matriz de perfis e permissões de acesso.",
    partes: ["Matriz RBAC", "Permissões avançadas da assistência"],
    passos: ["Selecione um perfil", "Consulte permissões por módulo", "Valide permissões avançadas"],
  },
  {
    id: "admin-log",
    titulo: "Administração - Log de Auditoria",
    rota: "/administracao/log-auditoria",
    perfil: "ADMIN",
    objetivo: "Rastrear ações do sistema e transições de OS.",
    partes: ["Aba geral", "Aba transições de OS", "Filtros de busca"],
    passos: ["Escolha a aba de análise", "Use filtro para localizar evento", "Revise detalhes de auditoria"],
  },
  {
    id: "admin-parametros",
    titulo: "Administração - Parâmetros",
    rota: "/administracao/parametros",
    perfil: "ADMIN",
    objetivo: "Configurar parâmetros operacionais do sistema SGQ.",
    partes: ["Lista de parâmetros", "Campos editáveis", "Ação salvar parâmetros"],
    passos: ["Ajuste valores necessários", "Revise impacto operacional", "Salve alterações"],
  },
];

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

async function setPerfil(page: Page, perfil: PerfilManual): Promise<void> {
  await authenticateAs(page, perfil);
}

async function maybeOpenModal(page: Page, modal?: ManualScreen["abrirModal"]): Promise<void> {
  if (modal !== "buscarCliente") return;
  const button = page.getByRole("button", { name: /Buscar Cliente/i }).first();
  if (await button.isVisible().catch(() => false)) {
    await button.click();
    await page.waitForTimeout(250);
  }
}

test.describe.configure({ mode: "serial" });

test("gera manual em PDF com passo a passo e prints das telas", async ({ page, context }) => {
  test.setTimeout(12 * 60_000);

  await installManualApiMock(page);
  await fs.rm(SHOTS_DIR, { recursive: true, force: true });
  await fs.mkdir(SHOTS_DIR, { recursive: true });

  await page.setViewportSize({ width: 1600, height: 1000 });

  const captured: Array<ManualScreen & { screenshotPath: string; screenshotBase64: string }> = [];

  for (const screen of screens) {
    if (screen.rota !== "/login") {
      await setPerfil(page, screen.perfil);
    } else {
      await page.goto("/login", { waitUntil: "networkidle" });
    }

    await page.goto(screen.rota, { waitUntil: "networkidle" });
    await maybeOpenModal(page, screen.abrirModal);
    await page.waitForTimeout(450);

    const screenshotPath = path.join(SHOTS_DIR, `${screen.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    const screenshotBase64 = await fs.readFile(screenshotPath, "base64");
    captured.push({ ...screen, screenshotPath, screenshotBase64 });
  }

  const generatedAt = new Date().toLocaleString("pt-BR");
  const total = captured.length;

  const sectionsHtml = captured
    .map((screen, index) => {
      const partes = screen.partes.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      const passos = screen.passos.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      return `
        <section class="screen">
          <h2>${index + 1}. ${escapeHtml(screen.titulo)}</h2>
          <p class="meta"><strong>Rota:</strong> <code>${escapeHtml(screen.rota)}</code> | <strong>Perfil:</strong> ${escapeHtml(screen.perfil)}</p>
          <p><strong>Objetivo:</strong> ${escapeHtml(screen.objetivo)}</p>
          <h3>Principais Partes da Tela</h3>
          <ul>${partes}</ul>
          <h3>Passo a Passo</h3>
          <ol>${passos}</ol>
          <div class="shot-wrap">
            <img alt="${escapeHtml(screen.titulo)}" src="data:image/png;base64,${screen.screenshotBase64}" />
          </div>
        </section>
      `;
    })
    .join("\n");

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>Manual SGQ Rodrigues</title>
        <style>
          @page { size: A4; margin: 14mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: "Segoe UI", "Arial", sans-serif;
            color: #111827;
            line-height: 1.45;
            background: #ffffff;
          }
          h1, h2, h3 { margin: 0 0 8px 0; }
          h1 { font-size: 24px; }
          h2 { font-size: 18px; margin-top: 8px; color: #0f172a; }
          h3 { font-size: 14px; margin-top: 12px; color: #334155; }
          p, li { font-size: 12px; }
          code {
            background: #f1f5f9;
            padding: 1px 4px;
            border-radius: 4px;
            font-size: 11px;
          }
          .cover {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          }
          .cover p { margin: 6px 0; }
          .screen {
            page-break-before: always;
            break-before: page;
            padding-top: 2px;
          }
          .meta { color: #475569; }
          ul, ol { margin: 0 0 10px 18px; padding: 0; }
          .shot-wrap {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            margin-top: 10px;
            background: #fff;
          }
          .shot-wrap img {
            display: block;
            width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <section class="cover">
          <h1>Manual do Sistema SGQ Rodrigues</h1>
          <p><strong>Conteúdo:</strong> passo a passo e explicação das telas principais.</p>
          <p><strong>Quantidade de telas documentadas:</strong> ${total}</p>
          <p><strong>Gerado em:</strong> ${escapeHtml(generatedAt)}</p>
          <p><strong>Origem:</strong> geração automática com captura Playwright no workspace atual.</p>
        </section>
        ${sectionsHtml}
      </body>
    </html>
  `;

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(HTML_PATH, html, "utf8");

  const pdfPage = await context.newPage();
  await pdfPage.setContent(html, { waitUntil: "networkidle" });
  await pdfPage.pdf({
    path: PDF_PATH,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
  });
  await pdfPage.close();

  expect(await fs.stat(PDF_PATH)).toBeTruthy();
});
