// ══════════ EXERCISE DATABASE ══════════
// Fiel ao original: referência.index.html L3345–3497

export type ExerciseEntry = { id: string; nome: string };
export type ExerciseDB = Record<string, ExerciseEntry[]>;

export const EXERCISE_DB: ExerciseDB = {
  "🏋️ Peito": [
    { id: "supino_reto",        nome: "Supino reto (barra)" },
    { id: "supino_inclinado",   nome: "Supino inclinado (barra)" },
    { id: "supino_halter",      nome: "Supino reto (halter)" },
    { id: "supino_incl_halter", nome: "Supino inclinado (halter)" },
    { id: "crucifixo",          nome: "Crucifixo (halter)" },
    { id: "crossover",          nome: "Crossover (cabo)" },
    { id: "peck_deck",          nome: "Peck deck (voador)" },
    { id: "supino_maquina",     nome: "Supino máquina" },
    { id: "flexao",             nome: "Flexão de braço" },
  ],
  "🦅 Costas": [
    { id: "puxada_frontal",   nome: "Puxada frontal" },
    { id: "puxada_triang",    nome: "Puxada triângulo" },
    { id: "remada_curvada",   nome: "Remada curvada (barra)" },
    { id: "remada_halter",    nome: "Remada unilateral (halter)" },
    { id: "remada_cavalinho", nome: "Remada cavalinho" },
    { id: "remada_baixa",     nome: "Remada baixa (cabo)" },
    { id: "pulldown",         nome: "Pulldown (corda)" },
    { id: "barra_fixa",       nome: "Barra fixa" },
    { id: "remada_maquina",   nome: "Remada máquina" },
  ],
  "🦵 Quad": [
    { id: "agachamento_livre",  nome: "Agachamento livre (barra)" },
    { id: "agachamento_smith",  nome: "Agachamento Smith" },
    { id: "leg_press",          nome: "Leg press 45°" },
    { id: "leg_press_horiz",    nome: "Leg press horizontal" },
    { id: "cadeira_extensora",  nome: "Cadeira extensora" },
    { id: "hack_squat",         nome: "Hack squat" },
    { id: "passada",            nome: "Passada / Avanço" },
    { id: "bulgaro",            nome: "Agachamento búlgaro" },
    { id: "abdutora",           nome: "Cadeira abdutora" },
    { id: "adutora",            nome: "Cadeira adutora" },
    { id: "panturrilha_pe",     nome: "Panturrilha em pé" },
    { id: "panturrilha_sentado",nome: "Panturrilha sentado" },
  ],
  "🦵 Posterior": [
    { id: "cadeira_flexora", nome: "Cadeira flexora" },
    { id: "mesa_flexora",    nome: "Mesa flexora" },
    { id: "stiff",           nome: "Stiff (barra/halter)" },
  ],
  "🍑 Glúteos": [
    { id: "hip_thrust_barra",   nome: "Hip thrust (barra)" },
    { id: "hip_thrust_maquina", nome: "Hip thrust máquina" },
    { id: "gluteo_maquina",     nome: "Máquina de glúteos (kickback)" },
    { id: "gluteo_cabo",        nome: "Glúteo no cabo (kickback)" },
    { id: "elevacao_pelvica",   nome: "Elevação pélvica (peso corporal)" },
    { id: "stiff_romeno",       nome: "Stiff romeno / RDL" },
    { id: "agachamento_sumo",   nome: "Agachamento sumô" },
  ],
  "💪 Ombros": [
    { id: "desenv_halter",         nome: "Desenvolvimento (halter)" },
    { id: "desenv_barra",          nome: "Desenvolvimento (barra)" },
    { id: "desenv_maquina",        nome: "Desenvolvimento máquina" },
    { id: "elevacao_lateral",      nome: "Elevação lateral (halter)" },
    { id: "elevacao_lateral_cabo", nome: "Elevação lateral (cabo)" },
    { id: "elevacao_frontal",      nome: "Elevação frontal" },
    { id: "face_pull",             nome: "Face pull (corda)" },
    { id: "encolhimento",          nome: "Encolhimento (trapézio)" },
    { id: "crucifixo_inverso",     nome: "Crucifixo inverso" },
  ],
  "💪 Bíceps": [
    { id: "rosca_direta",      nome: "Rosca direta (barra)" },
    { id: "rosca_halter",      nome: "Rosca alternada (halter)" },
    { id: "rosca_martelo",     nome: "Rosca martelo" },
    { id: "rosca_scott",       nome: "Rosca Scott" },
    { id: "rosca_concentrada", nome: "Rosca concentrada" },
    { id: "rosca_cabo",        nome: "Rosca no cabo" },
    { id: "rosca_w",           nome: "Rosca barra W" },
  ],
  "💪 Tríceps": [
    { id: "triceps_pulley",  nome: "Tríceps pulley (corda)" },
    { id: "triceps_barra_v", nome: "Tríceps pulley (barra V)" },
    { id: "triceps_testa",   nome: "Tríceps testa" },
    { id: "triceps_frances", nome: "Tríceps francês (halter)" },
    { id: "triceps_banco",   nome: "Tríceps banco (mergulho)" },
    { id: "triceps_coice",   nome: "Tríceps coice" },
    { id: "paralelas",       nome: "Paralelas" },
  ],
  "🧱 Core": [
    { id: "abdominal_crunch",  nome: "Abdominal crunch" },
    { id: "abdominal_infra",   nome: "Abdominal infra" },
    { id: "prancha",           nome: "Prancha (isometria)" },
    { id: "prancha_lateral",   nome: "Prancha lateral" },
    { id: "abdominal_maquina", nome: "Abdominal máquina" },
    { id: "rotacao_russa",     nome: "Rotação russa" },
    { id: "roda_abdominal",    nome: "Roda abdominal" },
  ],
};

// Grupos musculares secundários por exercício (para analytics de volume — Sessão 3E)
export type MuscleGroup = keyof typeof MUSCLE_LANDMARKS;
export const EX_SECONDARY: Record<string, string[]> = {
  supino_reto:           ["💪 Tríceps", "💪 Ombros"],
  supino_inclinado:      ["💪 Tríceps", "💪 Ombros"],
  supino_halter:         ["💪 Tríceps", "💪 Ombros"],
  supino_incl_halter:    ["💪 Tríceps", "💪 Ombros"],
  crucifixo:             ["💪 Ombros"],
  crossover:             [],
  peck_deck:             [],
  supino_maquina:        ["💪 Tríceps"],
  flexao:                ["💪 Tríceps", "💪 Ombros"],
  puxada_frontal:        ["💪 Bíceps"],
  puxada_triang:         ["💪 Bíceps"],
  remada_curvada:        ["💪 Bíceps"],
  remada_halter:         ["💪 Bíceps"],
  remada_cavalinho:      ["💪 Bíceps"],
  remada_baixa:          ["💪 Bíceps"],
  pulldown:              ["💪 Bíceps"],
  barra_fixa:            ["💪 Bíceps"],
  remada_maquina:        ["💪 Bíceps"],
  agachamento_livre:     ["🍑 Glúteos", "🧱 Core"],
  agachamento_smith:     ["🍑 Glúteos"],
  leg_press:             ["🍑 Glúteos"],
  leg_press_horiz:       ["🍑 Glúteos"],
  cadeira_extensora:     [],
  hack_squat:            ["🍑 Glúteos"],
  passada:               ["🍑 Glúteos"],
  bulgaro:               ["🍑 Glúteos"],
  cadeira_flexora:       [],
  mesa_flexora:          [],
  stiff:                 ["🍑 Glúteos"],
  hip_thrust_barra:      ["🦵 Posterior"],
  hip_thrust_maquina:    ["🦵 Posterior"],
  gluteo_maquina:        [],
  gluteo_cabo:           [],
  elevacao_pelvica:      ["🦵 Posterior"],
  stiff_romeno:          ["🦵 Posterior"],
  agachamento_sumo:      ["🦵 Quad"],
  desenv_halter:         ["💪 Tríceps"],
  desenv_barra:          ["💪 Tríceps"],
  desenv_maquina:        ["💪 Tríceps"],
  elevacao_lateral:      [],
  elevacao_lateral_cabo: [],
  elevacao_frontal:      ["🏋️ Peito"],
  face_pull:             ["💪 Bíceps"],
  encolhimento:          [],
  crucifixo_inverso:     [],
  panturrilha_pe:        [],
  panturrilha_sentado:   [],
  abdutora:              ["🍑 Glúteos"],
  adutora:               [],
  abdominal_crunch:      [],
  abdominal_infra:       [],
  prancha:               [],
  prancha_lateral:       [],
  abdominal_maquina:     [],
  rotacao_russa:         [],
  roda_abdominal:        [],
};

// Landmarks de volume por grupo muscular (MEV/MAV/MRV — protocolo Lucas Campos)
export const MUSCLE_LANDMARKS = {
  "🏋️ Peito":     { mev: 10, mav: 15, mrv: 25 },
  "🦅 Costas":    { mev: 10, mav: 15, mrv: 25 },
  "🦵 Quad":      { mev:  8, mav: 15, mrv: 25 },
  "🦵 Posterior": { mev:  6, mav: 12, mrv: 20 },
  "🍑 Glúteos":   { mev: 15, mav: 20, mrv: 30 },
  "💪 Ombros":    { mev:  6, mav: 12, mrv: 20 },
  "💪 Bíceps":    { mev:  6, mav: 12, mrv: 20 },
  "💪 Tríceps":   { mev:  6, mav: 12, mrv: 20 },
  "🧱 Core":      { mev:  4, mav: 10, mrv: 16 },
} as const;

export const MUSCLE_ORDER = [
  "🏋️ Peito", "🦅 Costas", "🦵 Quad", "🦵 Posterior",
  "🍑 Glúteos", "💪 Ombros", "💪 Bíceps", "💪 Tríceps", "🧱 Core",
] as const;

// IDs auxiliares para analytics de pernas
export const QUAD_IDS = [
  "agachamento_livre", "agachamento_smith", "leg_press", "leg_press_horiz",
  "cadeira_extensora", "hack_squat", "passada", "bulgaro", "abdutora", "adutora",
];
export const POST_IDS = ["cadeira_flexora", "mesa_flexora", "stiff", "stiff_romeno"];

// Tipos de cardio com kcal estimada por minuto
export type CardioType = { id: string; nome: string; kcalMin: number };
export const CARDIO_TYPES: CardioType[] = [
  { id: "bicicleta",          nome: "🚴 Bicicleta",               kcalMin: 7   },
  { id: "bicicleta_intensa",  nome: "🚴 Bicicleta (intensa)",      kcalMin: 10  },
  { id: "esteira_caminhada",  nome: "🚶 Caminhada (esteira)",      kcalMin: 4.5 },
  { id: "esteira_corrida",    nome: "🏃 Corrida (esteira)",        kcalMin: 10  },
  { id: "caminhada_rua",      nome: "🚶 Caminhada ar livre",       kcalMin: 4   },
  { id: "corrida_rua",        nome: "🏃 Corrida ar livre",         kcalMin: 11  },
  { id: "eliptico",           nome: "🏋️ Elíptico / Transport",    kcalMin: 8   },
  { id: "escada",             nome: "🪜 Escada",                   kcalMin: 9   },
  { id: "pular_corda",        nome: "⏭️ Pular corda",             kcalMin: 12  },
  { id: "remo",               nome: "🚣 Remo",                     kcalMin: 8.5 },
  { id: "outro_cardio",       nome: "❤️ Outro",                   kcalMin: 6   },
];

// Templates padrão (aplicados na primeira vez — Sessão 3D para edição)
export type WorkoutTemplate = {
  id: string;
  nome: string;
  cor: string;
  exercicios: string[]; // array de exercicioId
  cardio: { tipo: string; min: number };
};

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: "treino_a",
    nome: "Treino A — Peito + Bíceps + Abdômen",
    cor: "#f87171",
    exercicios: ["supino_reto", "supino_inclinado", "crossover", "rosca_direta", "rosca_martelo", "abdominal_crunch"],
    cardio: { tipo: "bicicleta", min: 15 },
  },
  {
    id: "treino_b",
    nome: "Treino B — Costas + Tríceps + Abdômen",
    cor: "#60a5fa",
    exercicios: ["puxada_frontal", "remada_curvada", "remada_baixa", "triceps_pulley", "triceps_testa", "prancha"],
    cardio: { tipo: "bicicleta", min: 15 },
  },
  {
    id: "treino_c",
    nome: "Treino C — Pernas + Ombros + Abdômen",
    cor: "#34d399",
    exercicios: ["agachamento_livre", "leg_press", "cadeira_extensora", "cadeira_flexora", "desenv_halter", "elevacao_lateral", "abdominal_crunch"],
    cardio: { tipo: "esteira_caminhada", min: 10 },
  },
  {
    id: "treino_alt",
    nome: "Treino Alt — Peito + Costas + Braços",
    cor: "#fbbf24",
    exercicios: ["supino_reto", "supino_inclinado", "puxada_frontal", "remada_curvada", "triceps_pulley", "rosca_direta"],
    cardio: { tipo: "bicicleta", min: 15 },
  },
];

// Helper: encontra exercício por ID (built-in)
export function exById(id: string): (ExerciseEntry & { grupo: string }) | null {
  for (const [grupo, exs] of Object.entries(EXERCISE_DB)) {
    const found = exs.find((e) => e.id === id);
    if (found) return { ...found, grupo };
  }
  return null;
}
