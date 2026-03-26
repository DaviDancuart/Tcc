import sys
import os
import base64
import requests
import io

# Configuração para garantir que o Windows aceite os acentos (UTF-8)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

API_KEY = "AIzaSyDNZx_8EM8JDnndcZBK-ti8DjTga9KwMa0"

def analisar_celula(caminho_da_imagem):
    try:
        # Busca automática do melhor modelo disponível na sua conta
        list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
        models_resp = requests.get(list_url).json()
        
        modelo_escolhido = "models/gemini-1.5-flash" 
        if "models" in models_resp:
            for m in models_resp["models"]:
                if "generateContent" in m["supportedGenerationMethods"]:
                    modelo_escolhido = m["name"]
                    break

        url_analise = f"https://generativelanguage.googleapis.com/v1beta/{modelo_escolhido}:generateContent?key={API_KEY}"
        
        with open(caminho_da_imagem, "rb") as f:
            imagem_data = base64.b64encode(f.read()).decode("utf-8")

        # PROMPT ULTRA-REFINADO: Força a IA a seguir critérios médicos reais
        prompt_especialista = (
            "CONTEXTO MÉDICO:\n"
            "Você é um Hematologista Sênior realizando uma consultoria diagnóstica. "
            "Sua análise deve ser metódica e seguir os critérios das classificações OMS e FAB.\n\n"
            
            "PASSO A PASSO DA ANÁLISE (Siga rigorosamente antes de concluir):\n"
            "1. ANÁLISE MORFOLÓGICA: Descreva o tamanho das células, relação núcleo-citoplasma (N:C), densidade da cromatina e presença de nucléolos.\n"
            "2. AGUDO vs CRÔNICO:\n"
            "   - Procure pelo 'Escalonamento Maturativo': Se houver toda a pirâmide mieloide (mielócitos, metamielócitos, bastonetes e segmentados), classifique como CRÔNICO.\n"
            "   - Procure pelo 'Hiato Leucêmico': Se houver muitos blastos e alguns neutrófilos, sem as fases intermediárias, classifique como AGUDO.\n"
            "3. MIELOIDE vs LINFOIDE:\n"
            "   - Mieloide: Procure por granulações azurófilas, bastonetes de Auer ou núcleos irregulares/reniformes.\n"
            "   - Linfoide: Procure por células menores, cromatina densa e citoplasma escasso sem grânulos.\n\n"
            
            "FORMATO DO LAUDO:\n"
            "## 1. Descrição Morfológica\n"
            "## 2. Classificação Temporal (Agudo/Crônico)\n"
            "## 3. Linhagem Celular (Mieloide/Linfoide)\n"
            "## 4. Hipótese Diagnóstica Principal\n"
            "## 5. Recomendações de Exames (Citometria/Citogenética)\n"

            "REGRAS DE OURO PARA NÃO ERRAR:\n"
            "- Se você vir MAIS DE 3 fases de maturação (ex: Mielócito + Metamielócito + Bastonete), você está PROIBIDO de dizer que é AGUDO. É OBRIGATORIAMENTE CRÔNICO (LMC).\n"
            "- Se você vir apenas células muito jovens e células muito velhas, sem nada no meio, é o HIATO LEUCÊMICO, logo é AGUDO.\n"
            "- Antes de dar o veredito, escreva: 'Eu vejo as fases X, Y e Z, portanto...'"
        )

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt_especialista},
                    {"inline_data": {"mime_type": "image/jpeg", "data": imagem_data}}
                ]
            }],
            "generationConfig": {
                "temperature": 0.1,  # Estabilidade: força a IA a ser factual e não criativa
                "topP": 0.95,
                "maxOutputTokens": 10500, # Aumentado para o laudo não vir cortado
            }
        }

        response = requests.post(url_analise, json=payload)
        res_json = response.json()

        if "candidates" in res_json:
            return res_json["candidates"][0]["content"]["parts"][0]["text"]
        else:
            return f"Erro na resposta: {res_json}"

    except Exception as e:
        return f"Erro técnico: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        caminho = " ".join(sys.argv[1:]).replace('"', '').strip()
        if os.path.exists(caminho):
            # O flush=True garante que o Node.js receba o texto na hora
            print(analisar_celula(caminho), flush=True)
        else:
            print("Erro: Arquivo não encontrado.", flush=True)