const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// Array de URLs para acessar
const urls = [
    'https://prezi.com/view/IsxPPNT0zihKzcJO9yA7/',
    'https://prezi.com/view/mPD1jLg8Lr8cuvbyPsP7/',
];

const pathName = 'Cadastrando Modelo E-mail, Causa e Solução'

// Caminho para a pasta onde as imagens e PDF serão salvos
const outputDir = path.join(__dirname, pathName);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir); // Cria a pasta se não existir
}

(async () => {
    const browser = await puppeteer.launch({ headless: false, ignoreDefaultArgs: ['--disable-extensions'] });
    const page = await browser.newPage();

    // Define a resolução do navegador para 1920x1080
    await page.setViewport({ width: 1920, height: 1080 });


    let screenshotPaths = [];

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
                    const screenshotPath = path.join(outputDir, `page_${i}_${pageIndex}.png`);
                    await canvasElement.screenshot({ path: screenshotPath });
                    screenshotPaths.push(screenshotPath); // Armazena o caminho da imagem para uso posterior
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
    console.log('Captura de telas concluída!');

    // Função para gerar o PDF com as capturas de tela
    const createPDF = async (imagePaths) => {
        const pdfDoc = await PDFDocument.create();

        for (const imgPath of imagePaths) {
            const imageBytes = fs.readFileSync(imgPath);
            const image = await pdfDoc.embedPng(imageBytes);
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }

        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(outputDir, pathName + '.pdf');
        fs.writeFileSync(pdfPath, pdfBytes);
        console.log(`Arquivo PDF salvo em: ${pdfPath}`);
    };

    // Gera o PDF com as capturas de tela
    await createPDF(screenshotPaths);
    console.log('Processo concluído e PDF gerado!');
})();
