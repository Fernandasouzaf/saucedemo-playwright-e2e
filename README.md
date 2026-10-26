# Desafio Técnico: QA Automation

Testes E2E automatizados do fluxo de compra do [Sauce Demo](https://www.saucedemo.com), usando **Playwright** com **TypeScript**.

## Pré-requisitos

- Node.js 20 ou superior (testado com Node 24 LTS)
- Git

## Instalação

```bash
git clone https://github.com/Fernandasouzaf/saucedemo-playwright-e2e.git
cd saucedemo-playwright-e2e
npm install
npx playwright install chromium
```

## Como executar os testes

```bash
npx playwright test                       # todos os testes (headless)
npx playwright test --headed              # com o navegador visível
npx playwright test --ui                  # modo interativo
npx playwright test tests/login.spec.ts   # um arquivo específico
npx playwright show-report                # abre o relatório HTML
```

## Estrutura do projeto

```
├── data/        # dados de teste desacoplados (usuários, produtos, checkout)
├── fixtures/    # fixtures: Page Objects prontos e login automático
├── pages/       # Page Objects (um por tela)
├── tests/       # specs: login, produtos, carrinho e checkout
└── playwright.config.ts
```

## Decisões técnicas

- **Page Object Model:** seletores e ações ficam em `pages/`; as asserções ficam nos testes.
- **Fixtures:** entregam os Page Objects e a fixture `loggedInPage`, que faz o login antes do teste e evita repetição.
- **Test id `data-test`:** configurado em `testIdAttribute`, pois o Sauce Demo usa esse atributo. Os seletores por test id são estáveis.
- **Asserções web-first:** uso de `await expect(...)` com auto-retry e `expect.poll` na ordenação. Não há esperas fixas (`waitForTimeout`).
- **Estabilidade na navegação:** após mudar de tela, os testes esperam um elemento exclusivo da tela de destino, e não apenas a URL, porque a URL muda antes de o conteúdo ser renderizado.
- **Testes independentes:** cada teste prepara o próprio estado, podendo rodar em paralelo e em qualquer ordem.
- **Dados desacoplados:** usuários, produtos e dados de checkout ficam em `data/`.
- **Testes parametrizados:** ordenação e validação de campos obrigatórios usam laços sobre uma lista de casos, evitando código repetido.
- **`test.step()`:** usado no fluxo de compra completa para deixar o relatório legível.
- **Somente Chromium:** suficiente para o escopo do desafio.
- **BDD (Cucumber) descartado:** adicionaria complexidade sem ganho para o escopo.
- **Relatório HTML:** gerado em `playwright-report/`, com trace e screenshot em caso de falha.

## Cenários cobertos

| Área | Cenário |
|---|---|
| Login | Login com credenciais válidas |
| Login | Senha incorreta exibe erro |
| Login | Usuário bloqueado (`locked_out_user`) |
| Login | Campos vazios (usuário obrigatório) e senha vazia (senha obrigatória) |
| Login | Logout encerra a sessão |
| Login | Acesso direto a `/inventory.html` sem login é bloqueado |
| Produtos | Listagem com 6 produtos completos |
| Produtos | Ordenação por nome (A-Z e Z-A) e por preço (menor-maior e maior-menor) |
| Produtos | Página de detalhes com dados iguais aos da listagem |
| Carrinho | Adicionar um produto (badge e botão) |
| Carrinho | Conteúdo do carrinho (nome, preço e quantidade) |
| Carrinho | Adicionar vários produtos |
| Carrinho | Remover um produto mantendo os demais |
| Carrinho | Continuar comprando preserva o item no carrinho |
| Checkout | Compra completa de ponta a ponta |
| Checkout | Revisão do pedido (subtotal + imposto = total) |
| Checkout | Cancelar o checkout volta ao carrinho preservando o item |
| Checkout | Validação de nome, sobrenome e CEP obrigatórios |

## Cenários pendentes e como seriam abordados

- **Outros usuários de teste** (`problem_user`, `performance_glitch_user`, `error_user`, `visual_user`): um projeto ou fixture por tipo de usuário. Esses usuários têm falhas propositais, então os testes confirmariam os defeitos conhecidos.
- - **Firefox e WebKit (cross-browser):** a suíte roda só em Chromium. Para ampliar, adicionaria projetos em `playwright.config.ts` e rodaria nesses navegadores apenas um subconjunto marcado como `@smoke`, mantendo a suíte rápida e estável. O WebKit teria prioridade sobre o Firefox, por representar o Safari.
- **CI:** workflow do GitHub Actions rodando os testes a cada push e publicando o relatório.
- **Acessibilidade** (`@axe-core/playwright`) e **testes visuais** (comparação de screenshots).