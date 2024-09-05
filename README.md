# Projeto de Automação e Desenvolvimento

## Descrição

Este projeto abrange várias funcionalidades de desenvolvimento e automação. Inclui o desenvolvimento de uma aplicação para cadastro e exibição de pets, automação de tarefas web com Puppeteer, e configurações do servidor Nginx para comunicação segura. Abaixo estão detalhes sobre as principais funcionalidades e como configurá-las.

## Funcionalidades

### 1. Aplicação de Cadastro e Exibição de Pets

Desenvolvimento de uma aplicação para cadastro e exibição de pets. Os dados dos pets são armazenados no `localStorage` e exibidos em uma tabela HTML.

### 2. Automação com Puppeteer

Utiliza o Puppeteer para realizar tarefas automatizadas em páginas web. As seguintes funcionalidades foram implementadas:

- **Extração de Comentários**: A função busca comentários de um cliente em uma página, verificando a presença de um comentário específico. O código ajustado para extrair todos os parágrafos dentro de um bloco específico é:

  ```javascript
  if (comentarioLeonardo) {
    const comentarioCliente = await page.evaluate(() => {
      const paragrafos = document.querySelectorAll('.user-content-block p');
      const comentario = Array.from(paragrafos)
        .map(p => p.textContent.trim())
        .join('\n\n');
      return comentario;
    });

    return {
      comentarioLeonardo,
      comentarioCliente: comentarioCliente || null,
    };
  }
