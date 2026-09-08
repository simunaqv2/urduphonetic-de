# A native single-keystroke layout, not a transliteration IME

Urdu can be typed either as a stateless layout (one keypress, one letter) or as a
transliteration engine that rewrites whole Latin words into Urdu script. We chose the
stateless layout, because Urdu's ~40 letters fit within Shift and AltGr on a 26-key
alphabet once do-chashmi he has its own key, which makes aspirates fall out for free.

## Consequences

A native layout compiles to a keyboard DLL, so it needs no background process and works
everywhere Windows accepts text, including the login screen, UAC prompts and password
fields. The cost is that `kh` cannot ever produce کھ by itself: sequences that depend on
what was typed before are impossible in the KBDTABLES model, and adding them later would
mean abandoning this approach for Keyman or a TSF IME, not extending it.
