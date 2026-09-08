# Urdu Phonetic Keyboard

A keyboard layout that lets Urdu be typed on a German QWERTZ laptop by sound rather
than by memorised position. Windows ships no phonetic Urdu layout, only the NLA
typewriter one.

## Language

**Phonetic layout**:
A layout where each Urdu letter sits on the Latin key whose sound is closest. Stateless:
one keypress produces one letter, with no inspection of what was typed before.
_Avoid_: transliteration, transliteration keyboard

**Transliteration**:
Rewriting a whole typed Latin word into Urdu script (`khuda` becomes خدا), using context
and candidate suggestions. A different input model, and explicitly not what we are building.
_Avoid_: phonetic

**Base keycap**:
The letter physically printed on a key. Mappings are defined against these, not against
scancodes or positions, so the key labelled `Z` produces ز even where a US board differs.
_Avoid_: key position, scancode

**Do-chashmi he**:
The letter ھ (U+06BE), used to form aspirated consonants. Occupies a key of its own.
_Avoid_: heh doachashmee, big he

**Aspirate**:
An Urdu consonant written as a base letter followed by do-chashmi he, such as کھ. Always
two keypresses, never a dedicated key.
_Avoid_: aspirated digraph

**AltGr layer**:
The third shift state of the layout, holding Urdu digits, diacritics and lower-frequency
characters that do not earn an unshifted or shifted slot.
_Avoid_: Ctrl+Alt layer, third level

**ZWNJ**:
The zero-width non-joiner (U+200C), which stops two adjacent letters from joining. Needed
to write certain words at all, so it earns a key despite being invisible.
_Avoid_: zero-width joiner, non-joiner

**UrduWeb Urdu Phonetic**:
The layout of record: `urduweb_de.klc`, locale `ur-PK`, authored in MSKLC against German
keycaps. It is the thing being ported, not a starting sketch.
_Avoid_: the old keyboard, legacy layout, v1

**Shift state**:
One of the four levels a key can produce: base, Shift, AltGr, and AltGr+Shift. The Ctrl
state is declared but left empty on every key.
_Avoid_: layer, level, modifier state
