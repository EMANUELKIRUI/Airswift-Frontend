/**
 * ✅ FRONTEND SAFE STATE HANDLING BEST PRACTICES
 * 
 * This guide shows how to properly handle API responses to prevent crashes like:
 *   TypeError: eZ.map is not a function
 * 
 * The root cause: Backend returns data in various structures, but frontend assumes
 * it's always an array or specific format
 */

// 🔴 WRONG - Will crash if data is not an array
const BadExample = () => {
  const [items, setItems] = useState([])
  
  useEffect(() => {
    API.get('/items').then(res => {
      setItems(res.data) // ❌ Could be object, null, or wrapped in another key
    })
  }, [])
  
  return (
    <div>
      {items.map(item => <div key={item.id}>{item.name}</div>)} {/* 💥 CRASH if items isn't array */}
    </div>
  )
}

// ✅ CORRECT - Always safe
import { fetchData, ensureArray } from '@/utils/fetchData'

const GoodExample = () => {
  const [items, setItems] = useState<any[]>([])
  
  useEffect(() => {
    fetchData('/items')
      .then(data => setItems(ensureArray(data, [])))
      .catch(err => {
        console.error('Failed to fetch items:', err)
        setItems([]) // Safe default
      })
  }, [])
  
  return (
    <div>
      {/* ✅ Always safe - ensureArray guarantees array */}
      {ensureArray(items, []).map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 PATTERN #1: Centralized API Calls
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { fetchData, ensureArray, ensureObject, postData, putData } from '@/utils/fetchData'

// Before: Multiple places in code making API calls differently
// After: Single pattern everywhere

const AuditLogsExample = () => {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    (async () => {
      try {
        // 🔥 fetchData returns cleaned data only
        const data = await fetchData('/admin/audit-logs?limit=50')
        
        // 🔥 ensureArray handles various response structures
        const safeLogs = ensureArray(data?.logs || data, [])
        
        setLogs(safeLogs)
      } catch (error) {
        console.error('Failed to fetch logs:', error)
        setLogs([]) // ✅ Safe default
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <table>
      <tbody>
        {/* ✅ Double safety: ensureArray here too */}
        {ensureArray(logs, []).map(log => (
          <tr key={log._id}>
            <td>{log.action}</td>
            <td>{log.userId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 PATTERN #2: Multiple Concurrent API Calls
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DashboardExample = () => {
  const [documents, setDocuments] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  
  useEffect(() => {
    (async () => {
      try {
        // Fetch all at once - way better for performance
        const [docsRes, appsRes, interviewsRes, notifRes] = await Promise.all([
          API.get('/documents').catch(() => ({ data: [] })),
          API.get('/applications/my').catch(() => ({ data: [] })),
          API.get('/interviews/my').catch(() => ({ data: [] })),
          API.get('/notifications').catch(() => ({ data: [] })),
        ])
        
        // ✅ Normalize all responses using ensureArray
        setDocuments(ensureArray(docsRes.data, []))
        setApplications(ensureArray(appsRes.data, []))
        setInterviews(ensureArray(interviewsRes.data, []))
        setNotifications(ensureArray(notifRes.data, []))
      } catch (error) {
        console.error('Dashboard fetch failed:', error)
        // Set safe defaults
        setDocuments([])
        setApplications([])
        setInterviews([])
        setNotifications([])
      }
    })()
  }, [])
  
  return (
    <div>
      <h2>Documents: {ensureArray(documents, []).length}</h2>
      <h2>Applications: {ensureArray(applications, []).length}</h2>
      <h2>Interviews: {ensureArray(interviews, []).length}</h2>
      <h2>Notifications: {ensureArray(notifications, []).length}</h2>
      
      {/* Always safe rendering */}
      <ul>
        {ensureArray(notifications, []).slice(0, 5).map(notif => (
          <li key={notif.id}>{notif.message}</li>
        ))}
      </ul>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 PATTERN #3: Filtering and Transforming Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ApplicationsExample = () => {
  const [applications, setApplications] = useState<any[]>([])
  
  useEffect(() => {
    fetchData('/applications/my')
      .then(data => setApplications(ensureArray(data, [])))
      .catch(() => setApplications([]))
  }, [])
  
  // ✅ Always safe - ensureArray here, then filter/map
  const pending = ensureArray(applications, []).filter(app => app.status === 'pending')
  const shortlisted = ensureArray(applications, []).filter(app => app.status === 'shortlisted')
  
  return (
    <div>
      <section>
        <h3>Pending ({pending.length})</h3>
        {pending.map(app => <div key={app.id}>{app.jobTitle}</div>)}
      </section>
      
      <section>
        <h3>Shortlisted ({shortlisted.length})</h3>
        {shortlisted.map(app => <div key={app.id}>{app.jobTitle}</div>)}
      </section>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 PATTERN #4: Creating and Updating Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const JobFormExample = () => {
  const [jobs, setJobs] = useState<any[]>([])
  
  const handleCreateJob = async (formData: any) => {
    try {
      // Use postData for type-safe API calls
      const newJob = await postData('/admin/jobs', formData)
      
      // ✅ Add to list safely
      setJobs(prev => [...ensureArray(prev, []), newJob])
    } catch (error) {
      console.error('Failed to create job:', error)
    }
  }
  
  const handleUpdateJob = async (id: string, updates: any) => {
    try {
      const updated = await putData(`/admin/jobs/${id}`, updates)
      
      // ✅ Update list safely
      setJobs(prev =>
        ensureArray(prev, []).map(job =>
          job._id === id ? updated : job
        )
      )
    } catch (error) {
      console.error('Failed to update job:', error)
    }
  }
  
  return (
    <div>
      {/* Render safely */}
      {ensureArray(jobs, []).map(job => (
        <div key={job._id}>
          <h4>{job.title}</h4>
          <button onClick={() => handleUpdateJob(job._id, { status: 'closed' })}>
            Close Job
          </button>
        </div>
      ))}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 PATTERN #5: Handling Notifications and Alerts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const NotificationsExample = () => {
  const [notifications, setNotifications] = useState<any[]>([])
  
  useEffect(() => {
    fetchData('/notifications')
      .then(data => setNotifications(ensureArray(data, [])))
      .catch(() => setNotifications([]))
  }, [])
  
  // ✅ Always safe
  const unreadCount = ensureArray(notifications, []).filter(n => !n.read).length
  
  return (
    <div>
      <h3>Notifications ({unreadCount} unread)</h3>
      <ul>
        {/* ✅ Double safety: both .filter() and .map() are safe */}
        {ensureArray(notifications, [])
          .filter(n => !n.read)
          .map(n => (
            <li key={n.id}>{n.message}</li>
          ))}
      </ul>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 QUICK CHECKLIST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
✅ Do this:
1. Import { ensureArray, fetchData } from '@/utils/fetchData'
2. Use fetchData for all API calls
3. Wrap state in ensureArray before using .map()
4. Remember: ensureArray(data, []) - always returns array
5. Set safe defaults in catch blocks

❌ Don't do this:
1. Direct response.data.map() without checking it's an array
2. Assume API response structure - it varies
3. Forget to handle empty/null/missing data
4. Call .map() on potentially non-array values
5. Ignore error catching

🔥 Golden Rule:
Before every .map() call, ask: "Is this 100% guaranteed to be an array?"
If not 100% sure → Use ensureArray()
*/

export const SAFE_STATE_HANDLING_EXAMPLES = {
  // Good: Guaranteed array before .map()
  good: (data: any[]) => data?.map(item => item),
  
  // Better: Using ensureArray
  better: (data: any) => ensureArray(data, []).map(item => item),
}
