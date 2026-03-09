// Tipos de medições corporais — Fase 4 (port de blocos_tracker_measure_v6)

export interface Skinfolds {
  chest: number  // Peito (mm)
  ax:    number  // Axilar média (mm)
  tri:   number  // Tríceps (mm)
  sub:   number  // Subescapular (mm)
  ab:    number  // Abdominal (mm)
  sup:   number  // Supra-ilíaca (mm)
  th:    number  // Coxa (mm)
}

export interface BodyMeasurement {
  weightKg:   number | null
  waistCm:    number | null
  bfPct:      number | null
  note:       string
  skinfolds?: Skinfolds
}

// Linha retornada por getAllBodyRows() para histórico/charts
export interface BodyRow extends BodyMeasurement {
  date: string  // ISO "YYYY-MM-DD"
}
