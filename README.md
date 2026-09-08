# urduphonetic-de

An Urdu phonetic keyboard layout for **German QWERTZ** keyboards on Windows.

Windows ships an Urdu layout (`KBDURDU.DLL`), but it is the NLA typewriter layout, whose
key positions have to be memorised. Windows ships phonetic layouts for Divehi, Syriac,
Cherokee, Myanmar, Bulgarian and Armenian — but not for Urdu. This is that missing layout,
built for a German keyboard.

Every Urdu letter sits on the key whose Latin sound is closest, judged by the letter
**printed on the keycap**: pressing the key labelled `Z` gives ز, and the key labelled `Y`
gives ے. See **[KEYMAP.md](KEYMAP.md)** for all 50 keys across all four shift states.

## How it types

One keypress produces one letter. There are no multi-key sequences to learn, and nothing
watches what you typed before.

Aspirated consonants fall out for free, because do-chashmi he (ھ) has its own key on `H`:

| You press | You get |
| --- | --- |
| `K` `H` | کھ |
| `B` `H` | بھ |
| `G` `H` | گھ |

Shift reaches the second letter of a pair (`T`→ت, Shift+`T`→ٹ). AltGr holds Urdu-Indic
digits ۰-۹; ASCII digits stay on the unshifted number row. Aeraab live on Shift and AltGr.

## Provenance

Derived from the **UrduWeb Urdu Phonetic** layout (`ur-PK`, LOCALEID `00000420`), via
[simunaqv/urdukeyboard](https://github.com/simunaqv/urdukeyboard). The first commit here is
that file verbatim, so every change below is visible as a diff.

Five deliberate changes:

1. **German virtual keys.** Upstream kept US VK assignments on 10 scancodes, which made
   Ctrl+Z send Ctrl+Y while Urdu was active — undo became redo. See
   [ADR-0002](docs/adr/0002-german-virtual-key-assignments.md). No character moved.
2. **ZWNJ on Shift+Space.** U+200C was absent; some words cannot be written without it.
3. **ۂ on AltGr+O** (U+06C2), replacing a duplicate of ه.
4. **ۓ on Shift+Y** (U+06D3), replacing an obscure Quranic sign.
5. **Quranic extras trimmed** to ة, ٰ and ﷺ, freeing 42 slots on the AltGr layers.

## Building and installing

The `.klc` is the source of truth. Open it in [Microsoft Keyboard Layout Creator
1.4](https://www.microsoft.com/en-us/download/details.aspx?id=22339) and use
**Project → Build DLL and Setup Package**, then run the generated `setup.exe` and accept
the UAC prompt. MSKLC needs .NET Framework 3.5, which is an optional Windows feature.

The layout can also be compiled with `kbdutool.exe` from the Windows Driver Kit, which
reads the same `.klc`.

Once installed, add Urdu under **Settings → Time & language → Language & region** and
switch with **Win+Space**.

## License

MIT. The layout descends from UrduWeb's Urdu Phonetic mapping.
