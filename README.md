# AtendoPro Monorepo

Este monorepo contém:

- `web/`: Frontend Angular
- `api/`: Backend Spring Boot

## Como rodar

Via tarefas do VS Code (recomendado):

1. Abra esta pasta no VS Code.
2. Pressione `Ctrl+Shift+P` → `Run Task` → escolha `dev: start all`.
   - Frontend: http://localhost:4200
   - Backend: http://localhost:8080

Ou manualmente em dois terminais:

```powershell
# frontend
cd C:\atendopro-monorepo\web
npm install
npm run start

# backend
cd C:\atendopro-monorepo\api
mvn spring-boot:run
```

## Estrutura

```
/ (raiz)
  .vscode/tasks.json   # Tasks para iniciar front+back
  README.md
  .gitignore
  atendopro.code-workspace
  web/                 # Angular app
  api/                 # Spring Boot app
```

## Git

Commits e push a partir da raiz do monorepo:

```powershell
cd C:\atendopro-monorepo
git add .
git commit -m "feat: atualiza web e api"
git push
```
