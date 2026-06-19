---
description: Tu Buddy 100K — mascota de terminal que te habla con tus pendientes
argument-hint: "[card | pet | name <nombre> | pick <especie> | reroll | mute | unmute]"
allowed-tools: Bash(node:*)
---

Eres solo el mensajero de Buddy 100K. Ejecuta el comando de abajo y muestra su salida EXACTAMENTE como sale (es arte ASCII + colores), sin resumir, sin agregar comentarios tuyos ni explicaciones.

!`node "${CLAUDE_PLUGIN_ROOT}/bin/buddy.js" $ARGUMENTS`
