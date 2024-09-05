# Projeto de Automação com Puppeteer

## Descrição

Este projeto utiliza Puppeteer para automação de tarefas web, incluindo a extração de comentários e a navegação por múltiplas páginas com paginação. Este README fornece instruções sobre como configurar e executar o código Puppeteer para realizar essas tarefas.

## Funcionalidades

### 1. Extração de Comentários

A função principal do código é extrair comentários de uma página web. Especificamente, o código verifica a presença de um comentário específico e, se encontrado, extrai todos os comentários associados ao cliente.

#### Código para Extração de Comentários

```javascript
if (comentarioLeonardo) {
  const comentarioCliente = await page.evaluate(() => {
    // Seleciona todos os elementos <p> dentro do bloco user-content-block
    const paragrafos = document.querySelectorAll('.user-content-block p');
    // Extrai e junta o texto de todos os parágrafos, removendo espaços extras
    const comentario = Array.from(paragrafos)
      .map(p => p.textContent.trim())
      .join('\n\n'); // Junta os textos com uma linha em branco entre os parágrafos
    return comentario;
  });

  return {
    comentarioLeonardo,
    comentarioCliente: comentarioCliente || null,
  };
}
