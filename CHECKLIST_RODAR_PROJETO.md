# Checklist para rodar o projeto no Windows

## 1. Instalar Node.js LTS

- Acesse https://nodejs.org
- Baixe a versao LTS.
- Instale mantendo a opcao de adicionar ao PATH.
- Feche e abra novamente o VS Code.

Validar:

```powershell
node -v
npm -v
```

## 2. Abrir a pasta correta

Abra no VS Code:

```text
D:\Downloads d\tech-calculus-hub-main\tech-calculus-hub-main
```

Nao abra apenas a pasta de cima, porque ela contem outra pasta com o projeto real.

## 3. Instalar dependencias

No terminal integrado do VS Code:

```powershell
npm install
```

## 4. Rodar o modo desenvolvimento

```powershell
npm run dev
```

Abrir no navegador:

```text
http://localhost:8080
```

## 5. Testar build

```powershell
npm run build
```

Opcional:

```powershell
npm run preview
```

## 6. Diagnostico rapido

```powershell
powershell -ExecutionPolicy Bypass -File scripts\check-windows-env.ps1
```

## 7. Atalho para iniciar

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-dev.ps1
```
