# TODO

- [ ] Ajustar layout para garantir que cada painel caiba sempre na viewport (desktop e mobile)
- [ ] Remover breakpoint do JS que desativa o horizontal scroll em <=900px
- [ ] Remover/limitar mobileFallback para não introduzir comportamento vertical
- [ ] Trocar `min-height: 100vh` por `height: 100svh/100dvh` em `.panel` e containers principais
- [ ] Ajustar `padding`/top spacing para evitar scroll vertical acidental
- [ ] Testar em larguras comuns (375px, 768px, 1024px) e verificar que não aparece scroll vertical extra
- [ ] Depois: otimizar performance (lazy/ativação de iframes + remover gsap.to dentro de onUpdate)
