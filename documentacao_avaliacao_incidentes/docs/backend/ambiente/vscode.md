# Configuração do VS Code

## Extensões Necessárias

### Python
1. **Python (Microsoft)**
   - IntelliSense
   - Debugging
   - Linting
   - Jupyter Notebooks
   - Instalação: `ext install ms-python.python`

2. **Pylance**
   - Language server
   - Type checking
   - Import organization
   - Instalação: `ext install ms-python.vscode-pylance`

3. **Django**
   - Syntax highlighting
   - Snippets
   - Template support
   - Instalação: `ext install batisteo.vscode-django`

## Configurações Recomendadas

### settings.json
```json
{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "editor.formatOnSave": true,
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    }
}
```

## Configuração do Debugger

### launch.json
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Django",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/manage.py",
            "args": ["runserver"],
            "django": true,
            "justMyCode": true
        },
        {
            "name": "Django Shell",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/manage.py",
            "args": ["shell"],
            "django": true
        }
    ]
}
```

## Atalhos Úteis

### Geral
- `Ctrl+Shift+P`: Command Palette
- `Ctrl+P`: Quick Open
- `F5`: Start Debugging
- `Ctrl+F5`: Run Without Debugging

### Python Específico
- `Ctrl+Space`: IntelliSense
- `Shift+Alt+F`: Format Document
- `F12`: Go to Definition
- `Alt+F12`: Peek Definition

## Dicas de Produtividade

### 1. Python Environment Manager
- Selecione o interpretador Python correto
- Use o botão na barra de status
- Certifique-se de que está usando o venv

### 2. Integração com Git
- Source Control view (`Ctrl+Shift+G`)
- Git Lens para histórico
- Git Graph para visualização

### 3. Terminal Integrado
- Use `Ctrl+` para abrir/fechar
- Múltiplos terminais simultâneos
- PowerShell/Bash conforme necessário

### 4. Snippets
- `def`: Criar função
- `class`: Criar classe
- `try`: Bloco try/except
