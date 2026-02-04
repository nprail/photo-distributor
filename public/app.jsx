const { useState, useEffect, useCallback } = React

// Icons
const Icons = {
  Camera: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Server: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
      />
    </svg>
  ),
  Cloud: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  ),
  Upload: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  ),
  Check: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  X: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
  Refresh: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  ),
  Google: () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  ),
  Folder: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  Image: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  Settings: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Save: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  ),
}

// Status Badge Component
function StatusBadge({ status }) {
  const colors = {
    running: 'bg-green-500/20 text-green-400 border-green-500/30',
    connected: 'bg-green-500/20 text-green-400 border-green-500/30',
    authenticated: 'bg-green-500/20 text-green-400 border-green-500/30',
    enabled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    disabled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[status] || colors.disabled}`}
    >
      {status}
    </span>
  )
}

// Card Component
function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${className}`}
    >
      {children}
    </div>
  )
}

// Stats Card
function StatsCard({ title, value, icon: Icon, trend }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {trend && <p className="text-sm text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className="p-3 bg-primary/20 rounded-lg text-primary">
          <Icon />
        </div>
      </div>
    </Card>
  )
}

// Google Auth Card
function GoogleAuthCard({ service, status, onConnect }) {
  const serviceName = service === 'drive' ? 'Google Drive' : 'Google Photos'
  const isAuthenticated = status?.authenticated
  const hasCredentials = status?.hasCredentials

  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <Icons.Google />
        </div>
        <div>
          <h3 className="font-semibold">{serviceName}</h3>
          <p className="text-sm text-gray-400">
            {isAuthenticated
              ? 'Connected and ready'
              : hasCredentials
                ? 'Credentials found, needs authentication'
                : 'No credentials file found'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge
          status={
            isAuthenticated
              ? 'authenticated'
              : hasCredentials
                ? 'pending'
                : 'disabled'
          }
        />
        {hasCredentials && !isAuthenticated && (
          <button
            onClick={() => onConnect(service)}
            className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </Card>
  )
}

// Destination Card
function DestinationCard({
  name,
  enabled,
  type,
  onToggle,
  showToggle = false,
}) {
  const iconMap = {
    LocalDestination: Icons.Folder,
    GoogleDriveDestination: Icons.Cloud,
    GooglePhotosDestination: Icons.Image,
  }
  const Icon = iconMap[type] || Icons.Cloud

  return (
    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-700/50 rounded-lg text-gray-400">
          <Icon />
        </div>
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={enabled ? 'enabled' : 'disabled'} />
        {showToggle && onToggle && (
          <Toggle checked={enabled} onChange={onToggle} />
        )}
      </div>
    </div>
  )
}

// Toggle Component
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-primary' : 'bg-gray-600'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// Input Component
function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
    </div>
  )
}

// Log Entry Component
function LogEntry({ log }) {
  const filename = log.original?.split('/').pop() || 'Unknown'
  const date = new Date(log.timestamp)
  const timeAgo = getTimeAgo(date)

  return (
    <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
          <Icons.Check />
        </div>
        <div>
          <p className="font-medium">{filename}</p>
          <p className="text-sm text-gray-400">→ {log.destination}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-400">{timeAgo}</p>
        <p className="text-xs text-gray-500">{date.toLocaleString()}</p>
      </div>
    </div>
  )
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }
  return 'Just now'
}

// Tabs Component
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-gray-800/50 rounded-lg border border-gray-700/50 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('status')
  const [status, setStatus] = useState(null)
  const [logs, setLogs] = useState([])
  const [authStatus, setAuthStatus] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const fetchData = useCallback(async (includeSettings = false) => {
    try {
      setError(null)
      const fetches = [
        fetch('/api/status'),
        fetch('/api/logs?limit=50'),
        fetch('/api/auth/google/status'),
        fetch('/api/destinations'),
      ]
      if (includeSettings) {
        fetches.push(fetch('/api/settings'))
      }

      const [statusRes, logsRes, authRes, destRes, settingsRes] =
        await Promise.all(fetches)

      if (!statusRes.ok) throw new Error('Failed to fetch status')

      setStatus(await statusRes.json())
      setLogs(await logsRes.json())
      setAuthStatus(await authRes.json())
      setDestinations(await destRes.json())
      if (settingsRes) {
        setSettings(await settingsRes.json())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(true) // Include settings on initial load
    const interval = setInterval(() => fetchData(false), 5000) // Don't refresh settings on interval
    return () => clearInterval(interval)
  }, [fetchData])

  const handleGoogleConnect = async (service) => {
    try {
      const res = await fetch(`/api/auth/google/${service}/start`)
      const data = await res.json()
      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=600,height=700')
      } else {
        alert(data.error || 'Failed to start authentication')
      }
    } catch (err) {
      alert('Failed to start authentication: ' + err.message)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save settings')
      
      if (data.destinations) {
        setDestinations(data.destinations)
      }
      
      setSuccessMessage(data.message || 'Settings saved')
      setTimeout(() => setSuccessMessage(null), 3000)
      fetchData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (path, value) => {
    setSettings((prev) => {
      const newSettings = { ...prev }
      const keys = path.split('.')
      let current = newSettings
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      return newSettings
    })
  }

  const tabs = [
    { id: 'status', label: 'Status' },
    { id: 'logs', label: 'Upload Logs' },
    { id: 'settings', label: 'Settings' },
    { id: 'auth', label: 'Google Auth' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Icons.Camera />
              </div>
              <div>
                <h1 className="text-xl font-bold">Photos FTP Uploader</h1>
                <p className="text-sm text-gray-400">Dashboard</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
              title="Refresh"
            >
              <Icons.Refresh />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
            Error: {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        {activeTab === 'status' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Uploads"
                value={status?.stats?.totalUploads || logs.length || 0}
                icon={Icons.Upload}
              />
              <StatsCard
                title="Active Destinations"
                value={destinations.filter((d) => d.enabled).length}
                icon={Icons.Cloud}
              />
              <StatsCard
                title="FTP Port"
                value={status?.ftpServer?.port || '—'}
                icon={Icons.Server}
              />
            </div>

            {/* Server Status */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">FTP Server</h2>
                <StatusBadge
                  status={status?.ftpServer?.running ? 'running' : 'error'}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Host</p>
                  <p className="font-mono">{status?.ftpServer?.host || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Port</p>
                  <p className="font-mono">{status?.ftpServer?.port || '—'}</p>
                </div>
              </div>
            </Card>

            {/* Destinations */}
            <Card>
              <h2 className="text-lg font-semibold mb-4">
                Upload Destinations
              </h2>
              <div className="space-y-3">
                {destinations.length > 0 ? (
                  destinations.map((dest) => (
                    <DestinationCard key={dest.name} {...dest} />
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No destinations configured
                  </p>
                )}
              </div>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
              <div className="space-y-3">
                {logs.slice(0, 5).map((log, i) => (
                  <LogEntry key={i} log={log} />
                ))}
                {logs.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    No uploads yet
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'logs' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Upload Logs</h2>
              <span className="text-sm text-gray-400">
                {logs.length} entries
              </span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {logs.map((log, i) => (
                <LogEntry key={i} log={log} />
              ))}
              {logs.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No upload logs available
                </p>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'settings' && settings && (
          <div className="space-y-6">
            {/* Save Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Settings</h2>
                <p className="text-gray-400 text-sm">
                  Configure server settings.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Icons.Save />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>

            {/* FTP Credentials */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icons.Server /> FTP Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Username"
                  value={settings.ftp?.username || ''}
                  onChange={(v) => updateSetting('ftp.username', v)}
                  placeholder="anonymous"
                />
                <Input
                  label="Password"
                  type="password"
                  value={settings.ftp?.password || ''}
                  onChange={(v) => updateSetting('ftp.password', v)}
                  placeholder="••••••••"
                />
              </div>
              <p className="text-xs text-gray-500 mt-4">
                ✅ Credential changes take effect immediately for new
                connections.
              </p>
            </Card>

            {/* Directories */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icons.Folder /> Directories
              </h3>
              <div className="space-y-4">
                <Input
                  label="Photos Directory"
                  value={settings.directories?.photosDir || ''}
                  onChange={(v) => updateSetting('directories.photosDir', v)}
                  placeholder="/path/to/photos"
                />
                <p className="text-xs text-gray-500">
                  Where organized photos are stored locally.
                </p>
              </div>
            </Card>

            {/* Upload Behavior */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icons.Upload /> Upload Behavior
              </h3>
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-medium">Delete After Upload</p>
                  <p className="text-sm text-gray-400">
                    Delete source file after successful upload to all
                    destinations
                  </p>
                </div>
                <Toggle
                  checked={settings.deleteAfterUpload ?? true}
                  onChange={(v) => updateSetting('deleteAfterUpload', v)}
                />
              </div>
            </Card>

            {/* Destinations */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Icons.Cloud /> Upload Destinations
                </h3>
              </div>

              {/* Local Destination */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700/50 rounded-lg text-gray-400">
                        <Icons.Folder />
                      </div>
                      <div>
                        <p className="font-medium">Local Filesystem</p>
                        <p className="text-sm text-gray-400">
                          Save photos to local directory
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={settings.destinations?.local?.enabled ?? true}
                      onChange={(v) =>
                        updateSetting('destinations.local.enabled', v)
                      }
                    />
                  </div>
                  {settings.destinations?.local?.enabled && (
                    <Input
                      label="Photos Directory"
                      value={settings.destinations?.local?.photosDir || ''}
                      onChange={(v) =>
                        updateSetting('destinations.local.photosDir', v)
                      }
                      placeholder="/path/to/photos"
                    />
                  )}
                </div>

                {/* Google Drive Destination */}
                <div className="p-4 bg-gray-700/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700/50 rounded-lg text-gray-400">
                        <Icons.Cloud />
                      </div>
                      <div>
                        <p className="font-medium">Google Drive</p>
                        <p className="text-sm text-gray-400">
                          Upload to Google Drive
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={
                        settings.destinations?.googleDrive?.enabled ?? false
                      }
                      onChange={(v) =>
                        updateSetting('destinations.googleDrive.enabled', v)
                      }
                    />
                  </div>
                  {settings.destinations?.googleDrive?.enabled && (
                    <div className="space-y-3">
                      <Input
                        label="Root Folder ID (optional)"
                        value={
                          settings.destinations?.googleDrive?.rootFolderId || ''
                        }
                        onChange={(v) =>
                          updateSetting(
                            'destinations.googleDrive.rootFolderId',
                            v || null,
                          )
                        }
                        placeholder="Leave empty to create 'Photos' folder"
                      />
                      <p className="text-xs text-gray-500">
                        Go to Google Auth tab to connect your Google account.
                      </p>
                    </div>
                  )}
                </div>

                {/* Google Photos Destination */}
                <div className="p-4 bg-gray-700/30 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700/50 rounded-lg text-gray-400">
                        <Icons.Image />
                      </div>
                      <div>
                        <p className="font-medium">Google Photos</p>
                        <p className="text-sm text-gray-400">
                          Upload to Google Photos library
                        </p>
                      </div>
                    </div>
                    <Toggle
                      checked={
                        settings.destinations?.googlePhotos?.enabled ?? false
                      }
                      onChange={(v) =>
                        updateSetting('destinations.googlePhotos.enabled', v)
                      }
                    />
                  </div>
                  {settings.destinations?.googlePhotos?.enabled && (
                    <p className="text-xs text-gray-500">
                      Go to Google Auth tab to connect your Google account.
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                💡 After changing destination settings, click "Save Settings"
                to apply changes.
              </p>
            </Card>
          </div>
        )}

        {activeTab === 'auth' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-2">
                Google Authentication
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Connect your Google accounts to enable cloud photo uploads. Make
                sure you have the credentials JSON files in the config folder.
              </p>
            </Card>

            <GoogleAuthCard
              service="drive"
              status={authStatus?.drive}
              onConnect={handleGoogleConnect}
            />

            <GoogleAuthCard
              service="photos"
              status={authStatus?.photos}
              onConnect={handleGoogleConnect}
            />

            <Card className="bg-blue-500/10 border-blue-500/20">
              <h3 className="font-semibold mb-2">Setup Instructions</h3>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>
                  Create a project in{' '}
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Google Cloud Console
                  </a>
                </li>
                <li>Enable the Google Drive API and/or Photos Library API</li>
                <li>Create OAuth 2.0 credentials (Desktop app type)</li>
                <li>Download the credentials JSON file</li>
                <li>
                  Save as{' '}
                  <code className="bg-gray-800 px-1 rounded">
                    config/google-drive-credentials.json
                  </code>{' '}
                  or{' '}
                  <code className="bg-gray-800 px-1 rounded">
                    config/google-photos-credentials.json
                  </code>
                </li>
                <li>Click "Connect" above to authenticate</li>
              </ol>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          Photos FTP Uploader Dashboard
        </div>
      </footer>
    </div>
  )
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
