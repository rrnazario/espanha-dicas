## Introdução

Acesse: https://rrnazario.github.io/espanha-dicas

Este repositório tem como propósito reunir as dicas para brasileiros vivendo na Espanha 🇪🇸

## Tópicos de interesse

TBD

## Contribuir

Contribuições são muito bem-vindas! Você pode corrigir uma informação desatualizada, completar um artigo existente ou escrever um artigo novo sobre algum processo que você passou na Espanha.

### Corrigir ou completar um artigo existente

O jeito mais rápido é pelo próprio site:

1. Abra o artigo em https://rrnazario.github.io/espanha-dicas.
2. Clique em **Editar no GitHub**, no topo da página.
3. Faça a alteração no editor do GitHub (ele cria um fork automaticamente, se necessário).
4. Descreva o que mudou e clique em **Propose changes**, depois em **Create pull request**.

Se preferir, os artigos ficam na pasta [`_posts/`](_posts) e podem ser editados diretamente.

### Escrever um artigo novo

#### 1. Faça um fork e crie um branch

```bash
git clone https://github.com/<seu-usuario>/espanha-dicas.git
cd espanha-dicas
git checkout -b meu-novo-artigo
```

#### 2. Crie o arquivo em `_posts/`

O nome do arquivo deve seguir o padrão `AAAA-MM-DD-titulo-do-artigo.md`, por exemplo:

```
_posts/2026-10-28-abrir-conta-em-banco.md
```

Use letras minúsculas e hífens no lugar de espaços, sem acentos. A data é a de criação do artigo.

#### 3. Preencha o cabeçalho (front matter)

Todo artigo começa com um bloco de configuração entre `---`:

```yaml
---
layout: post
title: "Como abrir uma conta em banco na Espanha"
description: "Documentos necessários e passo a passo para abrir uma conta."
section: dicas-gerais
last_updated: "Outubro de 2026"
---
```

| Campo          | O que é                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `layout`       | Sempre `post`.                                                           |
| `title`        | Título exibido na página e no menu lateral.                              |
| `description`  | Resumo curto, exibido abaixo do título e usado na busca.                 |
| `section`      | Seção do menu lateral onde o artigo aparece (veja a lista abaixo).       |
| `last_updated` | Mês e ano da última revisão do conteúdo. Atualize ao editar o artigo.    |

Seções disponíveis (definidas em [`_data/navigation.yml`](_data/navigation.yml)):

- `nacionalidade`
- `documentos`
- `carteira-de-motorista`
- `trabalho`
- `dicas-gerais`

Se nenhuma seção servir, adicione uma nova em `_data/navigation.yml` com `id`, `title` e `icon` (um ícone do [Bootstrap Icons](https://icons.getbootstrap.com/), ex.: `bi-house`).

#### 4. Escreva o conteúdo em Markdown

Abaixo do cabeçalho, escreva o artigo em [Markdown](https://docs.github.com/pt/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax). Algumas dicas:

- Use títulos `##` e `###` para organizar as etapas; eles aparecem no índice lateral da página.
- Inclua links para as fontes oficiais (sites do governo, formulários etc.).
- Para linkar outro artigo do site, use o caminho relativo do arquivo:
  ```markdown
  [Exemplo de canje](./2026-01-27-exemplo-de-canje-para-malaga.md)
  ```

#### 5. Adicione imagens (opcional)

Coloque as imagens em uma pasta própria dentro de `images/`, por exemplo `images/contabanco/tela01.png`, e referencie com o prefixo `/espanha-dicas`:

```markdown
![Tela de cadastro](/espanha-dicas/images/contabanco/tela01.png)
```

Lembre-se de esconder dados pessoais (nome, documentos, endereço) nas capturas de tela.

#### 6. Visualize localmente (opcional)

Com o [Docker](https://www.docker.com/) instalado, rode na raiz do projeto:

```bash
./build.sh   # cria a imagem (só na primeira vez ou quando o Gemfile mudar)
./test.sh    # sobe o site
```

Acesse http://localhost:4000/espanha-dicas. As alterações nos arquivos são recarregadas automaticamente.

#### 7. Abra o Pull Request

```bash
git add .
git commit -m "Adiciona artigo sobre abertura de conta em banco"
git push origin meu-novo-artigo
```

No GitHub, abra um Pull Request do seu branch para o branch `master` deste repositório, descrevendo brevemente o conteúdo. Depois de revisado e aprovado, o artigo é publicado automaticamente no site.