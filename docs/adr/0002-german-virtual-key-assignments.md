# Use German virtual-key assignments, deviating from the upstream layout

The upstream `urduweb_de.klc` places Urdu characters correctly for German keycaps but
keeps US virtual-key assignments in its VK column, on 10 of 50 scancodes. Because Windows
derives keyboard shortcuts from the virtual key rather than the character, this made
Ctrl+Z send Ctrl+Y while the layout was active: undo became redo whenever you were
editing Urdu.

We remapped the VK column to the German assignments, read from Windows itself via
`MapVirtualKeyEx` against HKL `00000407` rather than from memory or documentation.

## Consequences

No character moves, so muscle memory is untouched; only shortcut behaviour changes, and
it changes to match what the German layout already does. This is a deliberate divergence
from upstream: anyone diffing the two files will see the VK column differ on scancodes
`0c 0d 15 1a 1b 27 29 2b 2c 35` and should not "correct" it back.
