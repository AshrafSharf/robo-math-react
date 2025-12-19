// Geometric shapes and special symbols
export const geometricMap = {
  // ∴ therefore (U+2234) - three dots: one top, two bottom
  'MJMAIN-2234': [
    'm250 610 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',  // top dot
    'm80 150 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',   // bottom left dot
    'm420 150 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0'   // bottom right dot
  ],

  // ∵ because (U+2235) - three dots: two top, one bottom
  'MJMAIN-2235': [
    'm80 610 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',   // top left dot
    'm420 610 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',  // top right dot
    'm250 150 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0'   // bottom dot
  ],

  // □ square (U+25A1) - white square outline
  'MJMAIN-25A1': ['m71 -6 v695 h525 v-695 h-525'],

  // ■ blacksquare (U+25A0) - filled square (outline for pen)
  'MJMAIN-25A0': ['m71 -6 v695 h525 v-695 h-525'],

  // △ triangle (U+25B3) - white up triangle
  'MJMAIN-25B3': ['m56 -6 l277 695 l278 -695 h-555'],

  // ▲ blacktriangle (U+25B2)
  'MJMAIN-25B2': ['m56 -6 l277 695 l278 -695 h-555'],

  // ▽ triangledown (U+25BD) - white down triangle
  'MJMAIN-25BD': ['m56 689 l277 -695 l278 695 h-555'],

  // ▼ blacktriangledown (U+25BC)
  'MJMAIN-25BC': ['m56 689 l277 -695 l278 695 h-555'],

  // ◇ diamond (U+25C7) - white diamond
  'MJMAIN-25C7': ['m333 689 l278 -348 l-278 -347 l-277 347 l277 348'],

  // ◆ blackdiamond (U+25C6)
  'MJMAIN-25C6': ['m333 689 l278 -348 l-278 -347 l-277 347 l277 348'],

  // AMS Font versions (MJAMS prefix)
  // □ square (U+25A1)
  'MJAMS-25A1': ['m71 -6 v695 h525 v-695 h-525'],

  // ■ blacksquare (U+25A0)
  'MJAMS-25A0': ['m71 -6 v695 h525 v-695 h-525'],

  // △ triangle (U+25B3)
  'MJAMS-25B3': ['m56 -6 l277 695 l278 -695 h-555'],

  // ▲ blacktriangle (U+25B2)
  'MJAMS-25B2': ['m56 -6 l277 695 l278 -695 h-555'],

  // ▽ triangledown (U+25BD)
  'MJAMS-25BD': ['m56 689 l277 -695 l278 695 h-555'],

  // ▼ blacktriangledown (U+25BC)
  'MJAMS-25BC': ['m56 689 l277 -695 l278 695 h-555'],

  // ◇ lozenge (U+25CA)
  'MJAMS-25CA': ['m333 689 l278 -348 l-278 -347 l-277 347 l277 348'],

  // ∴ therefore (U+2234)
  'MJAMS-2234': [
    'm250 610 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',
    'm80 150 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',
    'm420 150 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0'
  ],

  // ∵ because (U+2235)
  'MJAMS-2235': [
    'm80 610 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',
    'm420 610 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0',
    'm250 150 a60,60 0 1,0 120,0 a60,60 0 1,0 -120,0'
  ],
};
