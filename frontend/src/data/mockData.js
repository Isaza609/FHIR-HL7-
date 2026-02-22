/**
 * Datos estáticos para mockups/capturas sin conexión al servicio FHIR.
 * Los recursos tienen la forma esperada por las pantallas (FHIR-like).
 */

const NOW = new Date();
const nextDay = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const toISO = (d) => d.toISOString();

/** Locations (sedes) – IDs como en filtros del proyecto */
export const MOCK_LOCATIONS = [
  { id: "loc-norte", name: "Clínica Norte", identifier: [{ value: "1100155555-1" }] },
  { id: "loc-centro", name: "Clínica Centro", identifier: [{ value: "1100155555-2" }] },
  { id: "loc-sur", name: "Clínica Sur", identifier: [{ value: "1100155555-3" }] },
];

/** HealthcareService por location (id de Location en referencia) */
export const MOCK_HEALTHCARE_SERVICES = {
  "loc-norte": [
    { id: "hs-norte-mg", name: "Medicina general" },
    { id: "hs-norte-ped", name: "Pediatría" },
    { id: "hs-norte-obst", name: "Obstetricia" },
  ],
  "loc-centro": [
    { id: "hs-centro-mg", name: "Medicina general" },
    { id: "hs-centro-nef", name: "Nefrología" },
    { id: "hs-centro-gast", name: "Gastroenterología" },
  ],
  "loc-sur": [
    { id: "hs-sur-mg", name: "Medicina general" },
    { id: "hs-sur-onc", name: "Oncología" },
    { id: "hs-sur-card", name: "Cardiología" },
  ],
};

/** Slots libres (varios días y horarios) */
function buildMockSlots() {
  const slots = [];
  const starts = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  for (let day = 0; day <= 7; day++) {
    const base = nextDay(NOW, day);
    base.setHours(0, 0, 0, 0);
    starts.forEach((t, i) => {
      const [h, m] = t.split(":").map(Number);
      const start = new Date(base);
      start.setHours(h, m, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 30);
      slots.push({
        id: `slot-mock-${day}-${i}`,
        resourceType: "Slot",
        status: "free",
        start: toISO(start),
        end: toISO(end),
        schedule: { reference: "Schedule/sched-mock" },
      });
    });
  }
  return slots;
}

export const MOCK_SLOTS = buildMockSlots();

/** Pacientes para selector */
export const MOCK_PATIENTS = [
  { id: "patient-1", name: [{ given: ["María"], family: "García López" }] },
  { id: "patient-2", name: [{ given: ["Carlos"], family: "Rodríguez Pérez" }] },
  { id: "patient-3", name: [{ given: ["Ana"], family: "Martínez Sánchez" }] },
];

/** Citas de ejemplo por paciente (Appointment) */
function buildMockAppointments() {
  const s1 = new Date(NOW);
  s1.setHours(10, 0, 0, 0);
  const e1 = new Date(s1);
  e1.setMinutes(e1.getMinutes() + 30);
  const s2 = nextDay(NOW, 3);
  s2.setHours(14, 0, 0, 0);
  const e2 = new Date(s2);
  e2.setMinutes(e2.getMinutes() + 45);
  return {
    "patient-1": [
      { id: "appt-1", start: toISO(s1), end: toISO(e1), status: "booked" },
      { id: "appt-2", start: toISO(s2), end: toISO(e2), status: "booked" },
    ],
    "patient-2": [
      { id: "appt-3", start: toISO(s2), end: toISO(e2), status: "booked" },
    ],
    "patient-3": [],
  };
}

export const MOCK_APPOINTMENTS_BY_PATIENT = buildMockAppointments();

/** Simula Bundle FHIR con entry[].resource */
export function mockBundle(resources) {
  return {
    resourceType: "Bundle",
    type: "searchset",
    entry: (Array.isArray(resources) ? resources : [resources]).map((r) => ({ resource: r })),
  };
}
