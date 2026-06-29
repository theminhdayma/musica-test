import { apiRequest } from '../../shared/api/http'

export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'

export type OnboardingData = {
  status: OnboardingStatus
  currentStep: string
  profileCompleted: boolean
  lastSeenAt: string | null
  startedAt: string | null
  completedAt: string | null
}

export async function getMyOnboarding(): Promise<{ data: OnboardingData }> {
  const res = await apiRequest<OnboardingData>({ path: '/me/onboarding', method: 'GET' })
  return { data: res.data }
}

export async function updateMyOnboarding(body: {
  status?: OnboardingStatus
  currentStep?: string
}): Promise<{ data: OnboardingData }> {
  const res = await apiRequest<OnboardingData>({ path: '/me/onboarding', method: 'PATCH', body })
  return { data: res.data }
}
