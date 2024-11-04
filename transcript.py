import fitz  # PyMuPDF
from PIL import Image
import pytesseract
import io

def extrair_texto_de_imagens_pdf(pdf_path, output_txt_path):
    # Abrir o PDF
    pdf_document = fitz.open(pdf_path)
    texto_extraido = ""

    # Iterar sobre cada página do PDF
    for num_pagina in range(pdf_document.page_count):
        pagina = pdf_document[num_pagina]
        
        # Renderizar a página como imagem
        imagem_pix = pagina.get_pixmap()
        img_data = io.BytesIO(imagem_pix.tobytes("png"))
        imagem = Image.open(img_data)
        
        # Aplicar OCR na imagem da página
        texto = pytesseract.image_to_string(imagem, lang="por")  # 'por' para português
        texto_extraido += f"\n--- Página {num_pagina + 1} ---\n" + texto
    
    # Salvar o texto extraído em um arquivo .txt
    with open(output_txt_path, "w", encoding="utf-8") as file:
        file.write(texto_extraido)

    print(f"Texto extraído e salvo em {output_txt_path}")

# Caminho para o arquivo PDF de entrada e o arquivo TXT de saída
nome_arquivo = "Módulo Supervisor de Vendas - Parte I"
caminho_pdf = f"{nome_arquivo}.pdf"
caminho_saida_txt = f"{nome_arquivo}.txt"

# Executar a função
extrair_texto_de_imagens_pdf(caminho_pdf, caminho_saida_txt)
