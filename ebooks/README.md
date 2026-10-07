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

## O que já está publicado

| Arquivo | Material | Fases |
| --- | --- | --- |
| `100-nomes-de-meninas.pdf` | 100 nomes de meninas (8 págs) | todas |
| `100-nomes-de-meninos.pdf` | 100 nomes de meninos (8 págs) | todas |
| `guia-de-ansiedade.pdf` | Guia Florescer: gestão da ansiedade e a espera (5 págs) | tentantes |

Os três são **gratuitos**. O catálogo padrão fica em `EBOOKS`, no
`assets/js/content.js`; o painel pode sobrescrever sem mexer em código.

O guia de ansiedade foi entregue em `.docx` e convertido para PDF
(`tools/` não guarda o script porque foi uma conversão única — o original
em Word continua com a cliente). O conteúdo foi conferido parágrafo a
parágrafo contra o documento original.

## Limites

- PDF é o formato esperado (abre no leitor nativo do celular, sem biblioteca).
- Evite arquivos muito grandes: eles são baixados pela rede da usuária.
- O material **não** entra no cache offline do service worker; é preciso
  internet na primeira abertura.
