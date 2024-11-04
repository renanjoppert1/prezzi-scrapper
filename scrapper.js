const puppeteer = require('puppeteer');

// Array de URLs para acessar
const urls = [
    'https://prezi.com/view/PxUwZyyU0kFGSVfppBzI/',
];

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Função principal para acessar cada URL e realizar as ações
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`Acessando URL ${i + 1}: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        let pageIndex = 0;
        let hasNextButton = true;

        // Laço para iterar enquanto o botão "próximo" existir
        while (hasNextButton) {
            await new Promise(resolve => setTimeout(resolve, 6000)); // Aguarda 6 segundos

            if (pageIndex === 0) {
                // Para a primeira página, clica no elemento específico
                await page.waitForSelector('.viewer-common-info-overlay-button-icon');
                await page.click('.viewer-common-info-overlay-button-icon');
                await new Promise(resolve => setTimeout(resolve, 6000)); // Aguarda 6 segundos
            }

            // Procura pelo canvas com ID 'canvas' a partir da segunda página
            try {
                await page.waitForSelector('#canvas', { timeout: 5000 });
                const canvasElement = await page.$('#canvas');

                if (canvasElement) {
                    const screenshotPath = `page_${i}_${pageIndex}.png`;
                    await canvasElement.screenshot({ path: screenshotPath });
                    console.log(`Captura de tela salva em: ${screenshotPath}`);
                }
            } catch (error) {
                console.log(`Canvas não encontrado na página ${pageIndex} da URL ${url}`);
            }

            // Verifica se o botão "próximo" está presente
            hasNextButton = await page.$('.webgl-viewer-navbar-button-next') !== null;

            // Se o botão existir, clica nele
            if (hasNextButton) {
                await page.click('.webgl-viewer-navbar-button-next');
                console.log(`Clicando no botão "próximo" na página ${pageIndex + 1}`);
                pageIndex += 1;
            } else {
                console.log(`Botão "próximo" não encontrado. Avançando para a próxima URL.`);
            }
        }
    }

    await browser.close();
    console.log('Processo concluído!');
})();
