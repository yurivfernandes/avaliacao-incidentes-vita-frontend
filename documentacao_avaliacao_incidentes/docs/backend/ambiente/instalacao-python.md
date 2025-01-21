# Instalação do Python

## O que é Python?
Python é uma linguagem de programação de alto nível, interpretada e de propósito geral. Se você está familiarizado com C#, Python seria algo como uma linguagem mais simples e dinâmica, sem tipagem estática.

## Instalação por Sistema Operacional

### Windows

1. **Baixar o Instalador**
   - Acesse [python.org/downloads](https://www.python.org/downloads/)
   - Clique em "Download Python" (pegue a versão 3.8 ou superior)

2. **Executar o Instalador**
   - Marque a opção "Add Python to PATH" ⚠️ MUITO IMPORTANTE!
   - Clique em "Install Now"
   - Aguarde a instalação finalizar

3. **Verificar a Instalação**
   - Abra o Prompt de Comando (cmd)
   - Digite:
     ```bash
     python --version
     pip --version
     ```
   - Você deve ver as versões instaladas

### Linux (Ubuntu/Debian)

1. **Atualizar os Repositórios**
   ```bash
   sudo apt update
   ```

2. **Instalar o Python**
   ```bash
   sudo apt install python3 python3-pip python3-venv
   ```

3. **Verificar a Instalação**
   ```bash
   python3 --version
   pip3 --version
   ```

### macOS

1. **Instalar o Homebrew** (se não tiver)
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Instalar o Python**
   ```bash
   brew install python
   ```

3. **Verificar a Instalação**
   ```bash
   python3 --version
   pip3 --version
   ```

## Resolução de Problemas

### Windows
1. **Python não encontrado**
   - Verifique se marcou "Add Python to PATH"
   - Reinicie o computador
   - Reinstale o Python

2. **Múltiplas versões**
   - Use o Python Launcher: `py -3.8`
   - Especifique a versão: `python3.8`

### Linux/macOS
1. **Comando não encontrado**
   - Use `python3` em vez de `python`
   - Use `pip3` em vez de `pip`

2. **Permissões**
   - Adicione `sudo` antes dos comandos
   - Verifique as permissões da pasta

## Próximos Passos
Após instalar o Python com sucesso, continue para a [Configuração do Projeto](configuracao-projeto.md).
