# TODO — Fix “foto cropped” em ecra pequeno (Projetos)

- [ ] Ler `projetos.html` e identificar o CSS inline que controla `.media-stage`.
- [ ] Atualizar CSS em `projetos.html` para que `.media-stage` não dependa de `height: 100%` no mobile (evitar crop por alturas fixas + `overflow:hidden`).
- [ ] Aplicar `min-height`/`flex`/`height:auto` no breakpoint `max-width: 900px` e/ou `max-width: 560px`.
- [ ] Garantir que `object-fit: contain` continua ativo.
- [ ] Validar rapidamente: trocar entre projetos (foto) e verificar se a imagem fica toda visível sem cortar.

