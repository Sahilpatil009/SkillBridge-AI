export interface StoredAssessmentSession {
  questions: unknown[]
  skill_id: number
  skillName: string
}

const key = (assessmentId: number | string) => `assessment:${assessmentId}`

export function saveAssessmentSession(
  assessmentId: number,
  data: StoredAssessmentSession,
): void {
  sessionStorage.setItem(key(assessmentId), JSON.stringify(data))
}

export function loadAssessmentSession(
  assessmentId: number | string,
): StoredAssessmentSession | null {
  try {
    const raw = sessionStorage.getItem(key(assessmentId))
    return raw ? (JSON.parse(raw) as StoredAssessmentSession) : null
  } catch {
    return null
  }
}
