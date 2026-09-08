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

The `.klc` is the source of truth. Two ways to compile it.

### Without installing MSKLC (what this layout was built with)

`MSKLC.exe` is a Microsoft-signed 7-Zip self-extracting archive wrapping an MSI, and the
MSI carries `kbdutool.exe` plus a full MSVC toolchain. Both can be extracted without
installing anything:

```powershell
.\MSKLC.exe -o"$PWD\msklc_x" -y
msiexec /a "$PWD\msklc_x\MSKLC\MSKLC.msi" /qn TARGETDIR="$PWD\msklc_files"
```

Then compile. `-u` is required because the `.klc` is UTF-16; `-m` targets AMD64 and `-o`
targets WOW64, and a 64-bit Windows needs both:

```powershell
$b = "$PWD\msklc_files"
$env:PATH = "$b\bin\i386;$b\bin\i386\amd64;$env:PATH"
$env:INCLUDE = "$b\inc"
$env:LIB = "$b\lib\amd64"   # use lib\i386 for the -o (WOW64) build
& "$b\bin\i386\kbdutool.exe" -u -w -m urduweb_de.klc
```

Install the results from an elevated prompt: the AMD64 `UrduWeb.dll` goes to
`C:\Windows\System32`, the WOW64 one to `C:\Windows\SysWOW64`, then create
`HKLM\SYSTEM\CurrentControlSet\Control\Keyboard Layouts\a0000420` with string values
`Layout File` = `UrduWeb.dll`, `Layout Text` = `UrduWeb Urdu Phonetic`, and a `Layout Id`
not already used by another layout.

Finally register it for your user (no elevation needed):

```powershell
$l = Get-WinUserLanguageList
$l.Add('ur-PK')
$l[-1].InputMethodTips.Clear()
$l[-1].InputMethodTips.Add('0420:A0000420')
Set-WinUserLanguageList $l -Force
```

### With the MSKLC GUI

Install [Microsoft Keyboard Layout Creator
1.4](https://www.microsoft.com/en-us/download/details.aspx?id=102134), open the `.klc`, and
use **Project -> Build DLL and Setup Package**, then run the generated `setup.exe`. MSKLC
needs .NET Framework 3.5, an optional Windows feature
(`dism /online /enable-feature /featurename:NetFx3 /all`).

Either way, switch to Urdu with **Win+Space**.

## License

MIT. The layout descends from UrduWeb's Urdu Phonetic mapping.
