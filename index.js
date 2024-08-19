import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function login(page, username, password) {
  await page.goto(
    'https://portalcliente.pixeon.com/secure/QueuesExtensionAction.jspa?queue=1555938793940',
  );
  await page.setViewport({ width: 1080, height: 1024 });

  await page.type('#username-fake', username);
  await page.type('#login-form-password', password);
  await page.click('#login-form-submit');

  await page.waitForSelector('.aui');
}

async function extractComments(page) {
  await page.waitForSelector('tbody tr .issuetype a');

  const hrefs = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll('tbody tr .issuetype a'),
    );
    return links
      .filter((link) => link.href.includes('SSD'))
      .map((link) => link.href);
  });

  if (hrefs.length === 0) {
    console.error('Nenhum link contendo SSD encontrado');
    return;
  }

  let allComments = '';

  for (let href of hrefs) {
    await page.goto(href);
    await page.waitForSelector('.toggle-title');

    // Extraindo o comentário do Leonardo Fernandes como texto puro
    const comentarioLeonardo = await page.evaluate(() => {
      const autorComentario = document.querySelector(
        'a[rel="leonardo.fernandes"]',
      );
      if (autorComentario) {
        const comentarioDiv = autorComentario
          .closest('.activity-comment')
          .querySelector('.action-body.flooded');
        return comentarioDiv ? comentarioDiv.textContent : null;
      }
      return null;
    });

    if (comentarioLeonardo) {
      allComments += `COMENTÁRIO DO LEONARDO FERNANDES: {${comentarioLeonardo}}\n\n\n\n + ========================= + \n\n\n\n`;

      // Extraindo o comentário do cliente se o do Leonardo for encontrado
      const comentarioCliente = await page.evaluate(() => {
        const comentario = document.querySelector(
          '.user-content-block p',
        )?.textContent;
        return comentario;
      });

      if (comentarioCliente) {
        allComments += `COMENTÁRIO DO CLIENTE: {${comentarioCliente}}\n\n\n\n`;
      } else {
        allComments += 'COMENTÁRIO DO CLIENTE NÃO ENCONTRADO.\n\n';
      }
    }
  }

  // Caminho absoluto para o arquivo chamados.txt
  const filePath = path.resolve('chamados.txt');

  // Escrevendo todos os comentários no arquivo chamados.txt
  try {
    fs.writeFileSync(filePath, allComments);
    console.log('Comentários extraídos e salvos em chamados.txt');
  } catch (error) {
    console.error('Erro ao salvar o arquivo:', error);
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await login(page, 'lucas.silva', 'Pixeon@2026');
    await extractComments(page);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await browser.close();
  }
})();
