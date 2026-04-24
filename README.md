# Tech Calculus Hub

Sistema industrial de calculos tecnicos para engenharia, com interface i9TMG em formato de dashboard tecnico.

## Stack

- React 18
- TypeScript
- Vite
- React Router
- TailwindCSS
- shadcn/ui
- Recharts
- Framer Motion
- Lucide React

## Estrutura principal

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    layout/
      AppLayout.tsx
      AppSidebar.tsx
      Topbar.tsx
    ui/
      button.tsx
      card.tsx
      data-table.tsx
      input.tsx
      table.tsx
      ...
    CalculationPanel.tsx
    DashboardCard.tsx
    FormulaCard.tsx
    SectorCard.tsx
    StepByStepViewer.tsx
  lib/
    industrial-data.ts
    utils.ts
  pages/
    Dashboard.tsx
    Calculos.tsx
    Formulas.tsx
    Historico.tsx
    Setores.tsx
    Configuracoes.tsx
```

## Requisitos no Windows

1. Instale o Node.js LTS pelo site oficial:
   - https://nodejs.org
   - Baixe a versao marcada como LTS.
   - Durante a instalacao, mantenha a opcao de adicionar Node/npm ao PATH.
2. Feche e abra novamente o VS Code ou o terminal.
3. Confirme no terminal:

```powershell
node -v
npm -v
```

Se os comandos nao forem reconhecidos, reinicie o Windows ou reinstale o Node.js marcando a opcao de PATH.

## Pasta correta no VS Code

Abra esta pasta como raiz do projeto:

```text
D:\Downloads d\tech-calculus-hub-main\tech-calculus-hub-main
```

No VS Code:

1. File > Open Folder...
2. Selecione `tech-calculus-hub-main\tech-calculus-hub-main`
3. Abra o terminal integrado em Terminal > New Terminal

Opcional, se o comando `code` estiver habilitado:

```powershell
code "D:\Downloads d\tech-calculus-hub-main\tech-calculus-hub-main"
```

## Instalar dependencias

O projeto tem `package-lock.json`, entao o caminho recomendado no Windows e npm:

```powershell
npm install
```

Observacao: existem tambem arquivos `bun.lock` e `bun.lockb`, mas para VS Code no Windows o fluxo mais simples e usar npm, que vem junto com Node.js.

## Rodar em desenvolvimento

```powershell
npm run dev
```

O `vite.config.ts` esta configurado para usar a porta `8080`. Acesse:

```text
http://localhost:8080
```

Se a porta estiver ocupada, o Vite pode sugerir outra porta no terminal.

## Build de producao

```powershell
npm run build
```

Para testar o build localmente:

```powershell
npm run preview
```

## Lint

```powershell
npm run lint
```

## Scripts de apoio para Windows

Verificar ambiente e arquivos principais:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\check-windows-env.ps1
```

Instalar dependencias se necessario e iniciar o Vite:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-dev.ps1
```

## Scripts do package.json

```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

## Solucao de erros comuns

### `npm nao e reconhecido`

O Node.js nao esta instalado ou nao entrou no PATH. Instale o Node.js LTS, feche e abra o VS Code e rode:

```powershell
node -v
npm -v
```

### `Missing script: dev`

Confirme que voce abriu a pasta correta. O terminal deve estar em:

```text
D:\Downloads d\tech-calculus-hub-main\tech-calculus-hub-main
```

### `Cannot find module` ou `vite nao e reconhecido`

As dependencias ainda nao foram instaladas. Rode:

```powershell
npm install
```

### Porta `8080` ocupada

Feche outro servidor que esteja usando a porta ou rode:

```powershell
npm run dev -- --port 5173
```

Depois acesse:

```text
http://localhost:5173
```

### Erros depois de trocar de gerenciador

Use apenas um gerenciador por vez. Para este projeto no Windows, prefira npm. Se voce tentou Bun ou Yarn antes, apague `node_modules` e rode:

```powershell
npm install
```

### Problemas com cache do Vite

Feche o servidor e rode novamente:

```powershell
npm run dev
```
