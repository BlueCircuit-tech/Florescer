# E-books e materiais

Os arquivos colocados nesta pasta são servidos junto com o app, no caminho
`/ebooks/<arquivo>`. É daqui que a tela **E-books e materiais** (`#/materiais`)
lê os PDFs.

## Como publicar um material

1. Coloque o arquivo aqui, com um nome sem espaços nem acentos
   (ex.: `100-nomes-de-meninas.pdf`).
2. Abra **Painel da administradora › E-books e materiais** e cadastre:
   título, resumo, o nome exato do arquivo, número de páginas, se é exclusivo
   do Premium e para quais fases aparece.
3. Pronto — ele aparece na Central de Recursos das usuárias dessas fases.

## Por que não há arquivos aqui ainda

Os e-books foram enviados por WhatsApp e ainda não entraram no repositório.
Enquanto a pasta estiver vazia, a tela mostra um aviso honesto de que nada
foi publicado, em vez de uma estante falsa.

## Limites

- PDF é o formato esperado (abre no leitor nativo do celular, sem biblioteca).
- Evite arquivos muito grandes: eles são baixados pela rede da usuária.
- O material **não** entra no cache offline do service worker; é preciso
  internet na primeira abertura.
