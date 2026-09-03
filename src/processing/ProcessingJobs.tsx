/**
 * Tracks in-flight video jobs for the whole app.
 *
 * Processing runs on criclab-video-service workers, not on the phone. This
 * provider only polls GET /jobs/active so the header ring stays live if the
 * user leaves the processing screen.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { listActiveJobs, type Job } from '../api/client'
import { useAuth } from '../auth/AuthProvider'

const POLL_MS = 2500

type Ctx = {
  jobs: Job[]
  trackJob: (job: Pick<Job, 'id' | 'kind'>) => void
  untrackJob: (jobId: string) => void
}

const ProcessingJobsContext = createContext<Ctx | null>(null)

export function ProcessingJobsProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])

  const refresh = useCallback(async () => {
    if (status !== 'authenticated') {
      setJobs([])
      return
    }
    try {
      const { items } = await listActiveJobs()
      setJobs(items.filter((j) => j.status !== 'cancelled'))
    } catch {
      /* a dropped poll must not blank the header */
    }
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') {
      setJobs([])
      return
    }
    void refresh()
    const id = setInterval(() => void refresh(), POLL_MS)
    return () => clearInterval(id)
  }, [status, refresh])

  const trackJob = useCallback((job: Pick<Job, 'id' | 'kind'>) => {
    setJobs((prev) => {
      if (prev.some((j) => j.id === job.id)) return prev
      return [
        {
          id: job.id,
          kind: job.kind,
          status: 'queued',
          progress: 0,
          stage: 'queued',
          message: 'Queued for analysis',
        },
        ...prev,
      ]
    })
  }, [])

  const untrackJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
  }, [])

  const value = useMemo(() => ({ jobs, trackJob, untrackJob }), [jobs, trackJob, untrackJob])
  return <ProcessingJobsContext.Provider value={value}>{children}</ProcessingJobsContext.Provider>
}

export function useProcessingJobs(): Ctx {
  const ctx = useContext(ProcessingJobsContext)
  if (!ctx) throw new Error('useProcessingJobs must be used within ProcessingJobsProvider')
  return ctx
}

export function jobHref(job: Job): string {
  if (job.kind === 'ballflight') {
    if (job.status === 'completed' && job.session_id) return `/balltrack/session/${job.session_id}`
    return `/balltrack/processing/${job.id}`
  }
  if (job.status === 'completed' && job.delivery_id) return `/results/${job.delivery_id}`
  return `/processing/${job.id}`
}
