import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Função para fazer login na página
async function login(page, username, password) {
  await page.goto(
    'https://portalcliente.pixeon.com/issues/?filter=73577&jql=project%20%3D%20SSD%20AND%20issuetype%20in%20(Incidente%2C%20D%C3%BAvida%2C%20Implanta%C3%A7%C3%B5es%2C%20Task%2C%20InfraService)%20AND%20cf%5B31739%5D%20in%20(%22PACS%20Aurora%20%5B36447%5D%22%2C%20%22PixPrint%20%5B36448%5D%22%2C%20%22Docscan%20%5B36441%5D%22%2C%20%22Capta%20%5B36437%5D%22%2C%20%22DICOM%20Router%20%5B36440%5D%22%2C%20%22ClickVita%20%5B36439%5D%22%2C%20%22X-Clinic%20%5B36454%5D%22%2C%20%22Korus%20%5B39277%5D%22%2C%20%22Pleres%20Desktop%20%5B36449%5D%22%2C%20%22Pleres%20Net%20%5B36450%5D%22%2C%20%22SMARTCLIN%20%5B36451%5D%22%2C%20%22SMARTHEALTH%20%5B36453%5D%22%2C%20%22SMARTLAB%20%5B36452%5D%22%2C%20%22LABLINK%20%5B36444%5D%22%2C%20%22Cetus%20%5B36438%5D%22%2C%20%22LABLINK%2FCOMMUNIS%20%5B36446%5D%22%2C%20%22LABLINK%20PRO%20%5B36445%5D%22%2C%20%22Aurora%20Drive%20%5B48243%5D%22)%20AND%20filter%20not%20in%20(%22Clientes%20Governo%22%2C%20%22Clientes%20GNDI%22)%20AND%20cf%5B31739%5D%20in%20(%22PACS%20Aurora%20%5B36447%5D%22%2C%20%22PixPrint%20%5B36448%5D%22%2C%20%22Docscan%20%5B36441%5D%22%2C%20%22Capta%20%5B36437%5D%22%2C%20%22DICOM%20Router%20%5B36440%5D%22%2C%20%22ClickVita%20%5B36439%5D%22%2C%20%22Aurora%20Drive%20%5B48243%5D%22)%20AND%20(issueFunction%20in%20commented(%22by%20leonardo.fernandes%20after%20startOfMonth(-1)%22)%20OR%20status%20changed%20by%20leonardo.fernandes%20after%20startOfMonth(-1))',
  );
  await page.setViewport({ width: 1080, height: 1024 });

  await page.type('#username-fake', username);
  await page.type('#login-form-password', password);
  await page.click('#login-form-submit');

  await page.waitForSelector('#issuetable');
}

// Função para extrair comentários dos links
async function extractCommentsFromHref(page, href) {
  await page.goto(href);
  await page.waitForSelector('.toggle-title');

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
    const comentarioCliente = await page.evaluate(() => {
      // Seleciona todos os elementos <p> dentro do bloco user-content-block
      const paragrafos = document.querySelectorAll('.user-content-block p');
      // Extrai e junta o texto de todos os parágrafos, removendo espaços extras
      const comentario = Array.from(paragrafos)
        .map((p) => p.textContent.trim())
        .join('\n\n'); // Junta os textos com uma linha em branco entre os parágrafos
      return comentario;
    });

    return {
      comentarioLeonardo,
      comentarioCliente: comentarioCliente || null,
    };
  }

  return null;
}

// Função principal para extrair todos os links dos chamados e seus comentários
async function extractLinksPage(page) {
  let pagination = 0;
  let allComments = '';

  while (true) {
    // Carregar a página com o índice de paginação atualizado
    await page.goto(
      `https://portalcliente.pixeon.com/issues/?filter=73577&jql=project%20%3D%20SSD%20AND%20issuetype%20in%20(Incidente%2C%20D%C3%BAvida%2C%20Implanta%C3%A7%C3%B5es%2C%20Task%2C%20InfraService)%20AND%20cf%5B31739%5D%20in%20(%22PACS%20Aurora%20%5B36447%5D%22%2C%20%22PixPrint%20%5B36448%5D%22%2C%20%22Docscan%20%5B36441%5D%22%2C%20%22Capta%20%5B36437%5D%22%2C%20%22DICOM%20Router%20%5B36440%5D%22%2C%20%22ClickVita%20%5B36439%5D%22%2C%20%22X-Clinic%20%5B36454%5D%22%2C%20%22Korus%20%5B39277%5D%22%2C%20%22Pleres%20Desktop%20%5B36449%5D%22%2C%20%22Pleres%20Net%20%5B36450%5D%22%2C%20%22SMARTCLIN%20%5B36451%5D%22%2C%20%22SMARTHEALTH%20%5B36453%5D%22%2C%20%22SMARTLAB%20%5B36452%5D%22%2C%20%22LABLINK%20%5B36444%5D%22%2C%20%22Cetus%20%5B36438%5D%22%2C%20%22LABLINK%2FCOMMUNIS%20%5B36446%5D%22%2C%20%22LABLINK%20PRO%20%5B36445%5D%22%2C%20%22Aurora%20Drive%20%5B48243%5D%22)%20AND%20filter%20not%20in%20(%22Clientes%20Governo%22%2C%20%22Clientes%20GNDI%22)%20AND%20cf%5B31739%5D%20in%20(%22PACS%20Aurora%20%5B36447%5D%22%2C%20%22PixPrint%20%5B36448%5D%22%2C%20%22Docscan%20%5B36441%5D%22%2C%20%22Capta%20%5B36437%5D%22%2C%20%22DICOM%20Router%20%5B36440%5D%22%2C%20%22ClickVita%20%5B36439%5D%22%2C%20%22Aurora%20Drive%20%5B48243%5D%22)%20AND%20(issueFunction%20in%20commented(%22by%20leonardo.fernandes%20after%20startOfMonth(-1)%22)%20OR%20status%20changed%20by%20leonardo.fernandes%20after%20startOfMonth(-1))&startIndex=${pagination}`,
    );

    // Esperar pelos links da tabela
    await page.waitForSelector('tbody tr .issuetype a');

    const hrefs = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll('tbody tr .issuetype a'),
      );
      const filteredLinks = links
        .filter((link) => link.href.includes('SSD'))
        .map((link) => link.href);

      return Array.from(new Set(filteredLinks)); // Remove duplicados
    });

    console.log('HREFS ' + hrefs);
    console.log(hrefs.length);
    // Se não houver mais links, sair do loop
    if (hrefs.length < 50) {
      console.log('Chegou ao fim.');
      break;
    }

    pagination += hrefs.length; // Atualiza o índice de paginação

    // Extrair comentários dos links
    for (let href of hrefs) {
      const comments = await extractCommentsFromHref(page, href);
      if (comments) {
        allComments += `COMENTÁRIO DO CLIENTE: {${comments.comentarioCliente}}\n\n\n\n`;
        allComments += `COMENTÁRIO DO LEONARDO FERNANDES: {${comments.comentarioLeonardo}}\n\n\n\n + ========================= + \n\n\n\n`;
      }
    }
  }

  // Salvar os comentários extraídos no arquivo
  const filePath = path.resolve('chamados.txt');
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
    await login(page, 'lucas.silva', 'Pixeon2030');
    await extractLinksPage(page);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await browser.close();
  }
})();
