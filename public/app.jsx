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
  ExternalLink: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  ),
  AlertTriangle: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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
  showToggle = false,
}) {
  const [showPassword, setShowPassword] = React.useState(false)
  const inputType = showToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-400 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 ${showToggle ? 'pr-10' : ''}`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// FileUploadButton Component
function FileUploadButton({
  label,
  onUpload,
  accept = '.json',
  className = '',
}) {
  const fileInputRef = React.useRef(null)
  const [dragActive, setDragActive] = React.useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className={`w-full px-4 py-3 rounded-lg border-2 border-dashed transition-all ${
          dragActive
            ? 'border-primary bg-primary/10 scale-105'
            : 'border-gray-600 hover:border-primary/50 hover:bg-gray-700/30'
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <Icons.Upload />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-gray-500">
            Click to browse or drag and drop
          </span>
        </div>
      </button>
    </div>
  )
}

// Received File Entry Component (new)
function ReceivedFileEntry({ file, expanded, onToggle, onRetry }) {
  const [showErrors, setShowErrors] = useState({})
  const [retrying, setRetrying] = useState({})
  const date = new Date(file.timestamp)
  const timeAgo = getTimeAgo(date)
  const destinations = file.destinations || []
  const successCount = destinations.filter((d) => d.success).length
  const failCount = destinations.filter((d) => !d.success).length
  const hasDestinations = destinations.length > 0

  // Compute unique failed destinations (that haven't since succeeded)
  const succeededDests = new Set(
    destinations.filter((d) => d.success).map((d) => d.destination),
  )
  const hasRetryableFailures = destinations.some(
    (d) => !d.success && !succeededDests.has(d.destination),
  )

  const formatSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleRetry = async (e, destination) => {
    e.stopPropagation()
    setRetrying((prev) => ({ ...prev, [destination]: true }))
    try {
      await onRetry(file.id, destination)
    } finally {
      setRetrying((prev) => ({ ...prev, [destination]: false }))
    }
  }

  const toggleError = (e, index) => {
    e.stopPropagation()
    setShowErrors((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <Icons.Image />
          </div>
          <div>
            <p className="font-medium">{file.filename}</p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {file.size && <span>{formatSize(file.size)}</span>}
              {hasDestinations && (
                <>
                  <span>•</span>
                  <span className="text-green-400">{successCount} sent</span>
                  {failCount > 0 && (
                    <span className="text-red-400">{failCount} failed</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-400">{timeAgo}</p>
            <p className="text-xs text-gray-500">{date.toLocaleString()}</p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {expanded && hasDestinations && (
        <div className="border-t border-gray-600/50 p-4 bg-gray-800/30 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Destinations
          </p>
          {destinations.map((dest, i) => {
            // Get the destination link/path based on the destination type
            const getDestinationInfo = () => {
              if (!dest.success || !dest.result) return null

              if (
                dest.destination === 'google-photos' &&
                dest.result.productUrl
              ) {
                return {
                  url: dest.result.productUrl,
                  label: 'View in Google Photos',
                }
              } else if (
                dest.destination === 'google-drive' &&
                dest.result.webViewLink
              ) {
                return {
                  url: dest.result.webViewLink,
                  label: 'View in Google Drive',
                }
              } else if (
                dest.destination === 'local' &&
                dest.result.destinationPath
              ) {
                return { path: dest.result.destinationPath }
              }
              return null
            }

            const destinationInfo = getDestinationInfo()
            const isFailed = !dest.success
            const hasSucceededSince = succeededDests.has(dest.destination)

            return (
              <div
                key={i}
                className="flex items-center justify-between p-2 bg-gray-700/30 rounded"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`p-1 rounded ${dest.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    {dest.success ? <Icons.Check /> : <Icons.X />}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm">{dest.destination}</span>
                    {destinationInfo?.url && (
                      <a
                        href={destinationInfo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{destinationInfo.label}</span>
                        <Icons.ExternalLink />
                      </a>
                    )}
                    {destinationInfo?.path && (
                      <span className="text-xs text-gray-400 font-mono truncate">
                        {destinationInfo.path}
                      </span>
                    )}
                    {isFailed && dest.error && showErrors[i] && (
                      <span className="text-xs text-red-400 mt-1 break-all">
                        {dest.error}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 whitespace-nowrap">
                  {dest.duration && (
                    <span className="text-xs text-gray-500">
                      {dest.duration}ms
                    </span>
                  )}
                  {isFailed && dest.error && (
                    <button
                      onClick={(e) => toggleError(e, i)}
                      className="p-1 rounded text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                      title={showErrors[i] ? 'Hide error' : 'Show error'}
                    >
                      <Icons.AlertTriangle />
                    </button>
                  )}
                  {isFailed && !hasSucceededSince && onRetry && (
                    <button
                      onClick={(e) => handleRetry(e, dest.destination)}
                      disabled={retrying[dest.destination]}
                      className="px-2 py-1 text-xs bg-primary/20 text-primary hover:bg-primary/30 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                      title="Retry upload"
                    >
                      {retrying[dest.destination] ? (
                        <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
                      ) : (
                        <Icons.Refresh />
                      )}
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Active Upload Indicator
function ActiveUploadIndicator({ uploads }) {
  const allUploads = Object.entries(uploads).flatMap(([dest, files]) =>
    files.map((f) => ({ ...f, destination: dest })),
  )

  if (allUploads.length === 0) return null

  return (
    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
        <span className="text-sm text-blue-400 font-medium">
          {allUploads.length} upload{allUploads.length !== 1 ? 's' : ''} in
          progress
        </span>
      </div>
      <div className="space-y-1">
        {allUploads.map((upload) => (
          <div
            key={upload.id}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-300">{upload.filename}</span>
            <span className="text-gray-500">→ {upload.destination}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Active Receive Indicator (files being received via FTP)
function ActiveReceiveIndicator({ receives }) {
  if (!receives || receives.length === 0) return null

  return (
    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className="animate-pulse h-4 w-4 bg-green-400 rounded-full"></div>
        <span className="text-sm text-green-400 font-medium">
          {receives.length} file{receives.length !== 1 ? 's' : ''} receiving
        </span>
      </div>
      <div className="space-y-1">
        {receives.map((receive) => (
          <div
            key={receive.id}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-300">{receive.filename}</span>
            <span className="text-gray-500">← FTP</span>
          </div>
        ))}
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
  // Get initial tab from URL hash or default to 'status'
  const getInitialTab = () => {
    const hash = window.location.hash.slice(1) // Remove '#'
    const validTabs = ['status', 'logs', 'destinations', 'settings']
    return validTabs.includes(hash) ? hash : 'status'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [status, setStatus] = useState(null)
  const [receivedFiles, setReceivedFiles] = useState([])
  const [authStatus, setAuthStatus] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [settings, setSettings] = useState(null)
  const [isDocker, setIsDocker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [expandedFiles, setExpandedFiles] = useState(new Set())
  const [wsConnected, setWsConnected] = useState(false)

  const toggleFileExpanded = (id) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Fetch initial data (auth status, settings) - only called once
  const fetchInitialData = useCallback(async () => {
    try {
      setError(null)
      // Single API call for all initial data
      const res = await fetch('/api/init')
      const data = await res.json()

      setAuthStatus(data.authStatus)
      setDestinations(data.destinations)
      setSettings(data.settings)
      setIsDocker(data.isDocker || false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // WebSocket connection for real-time updates
  useEffect(() => {
    fetchInitialData()

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/ws`
    let ws = null
    let reconnectTimeout = null

    const connect = () => {
      ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket connected')
        setWsConnected(true)
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'status') {
            // Full status update
            const data = message.data
            setStatus({
              ftpServer: data.ftpServer,
              destinations: data.destinations,
              activeReceives: data.activeReceives,
              activeUploads: data.activeUploads,
              stats: data.stats,
            })
            if (data.receivedFiles) {
              setReceivedFiles(data.receivedFiles)
            }
          } else if (
            message.type === 'transfer:start' ||
            message.type === 'transfer:complete'
          ) {
            // Incremental transfer updates - request fresh status
            // The server will broadcast full status on these events
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...')
        setWsConnected(false)
        // Attempt to reconnect after 2 seconds
        reconnectTimeout = setTimeout(connect, 2000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        ws.close()
      }
    }

    connect()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (ws) {
        ws.close()
      }
    }
  }, [fetchInitialData])

  // Handle URL hash changes (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      const validTabs = ['status', 'logs', 'destinations', 'settings']
      if (validTabs.includes(hash)) {
        setActiveTab(hash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Update URL hash when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    window.location.hash = tabId
  }

  const handleGoogleConnect = async (service) => {
    try {
      const res = await fetch(`/api/auth/google/${service}/start`)
      const data = await res.json()
      if (data.authUrl) {
        const popup = window.open(
          data.authUrl,
          '_blank',
          'width=600,height=700',
        )

        // Poll for popup close and refetch settings/auth status
        if (popup) {
          const pollInterval = setInterval(() => {
            if (popup.closed) {
              clearInterval(pollInterval)
              // Refetch settings and auth status after OAuth completes
              fetchInitialData()
            }
          }, 500)
        }
      } else {
        alert(data.error || 'Failed to start authentication')
      }
    } catch (err) {
      alert('Failed to start authentication: ' + err.message)
    }
  }

  const handleCredentialsUpload = async (service, file) => {
    try {
      // Validate it's a JSON file
      if (!file.name.endsWith('.json')) {
        alert('Please upload a JSON file')
        return
      }

      const formData = new FormData()
      formData.append('credentials', file)

      const res = await fetch(`/api/auth/google/${service}/credentials`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload credentials')
      }

      // Refetch auth status to show the new state
      await fetchInitialData()

      // Show success message briefly
      setSuccessMessage(data.message)
      setTimeout(() => setSuccessMessage(null), 3000)

      // Auto-trigger connect flow after successful upload
      setTimeout(() => handleGoogleConnect(service), 500)
    } catch (err) {
      alert('Failed to upload credentials: ' + err.message)
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
      fetchInitialData()
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

  const handleRetryUpload = async (receivedId, destination) => {
    try {
      const res = await fetch('/api/retry-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receivedId, destination }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Retry failed')
    } catch (err) {
      setError(`Retry failed: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  const [retryingAll, setRetryingAll] = useState(false)

  const handleRetryAllFailed = async () => {
    try {
      setRetryingAll(true)
      const res = await fetch('/api/retry-all-failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Retry all failed')
      const succeeded = data.results?.filter((r) => r.success).length || 0
      const failed = data.results?.filter((r) => !r.success).length || 0
      if (succeeded > 0 || failed > 0) {
        setSuccessMessage(
          `Retried ${data.retried} upload(s): ${succeeded} succeeded, ${failed} failed`,
        )
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (err) {
      setError(`Retry all failed: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setRetryingAll(false)
    }
  }

  // Check if any files have retryable failed uploads
  const hasAnyFailedUploads = receivedFiles.some((file) => {
    const dests = file.destinations || []
    const succeededDests = new Set(
      dests.filter((d) => d.success).map((d) => d.destination),
    )
    return dests.some((d) => !d.success && !succeededDests.has(d.destination))
  })

  const tabs = [
    { id: 'status', label: 'Status' },
    { id: 'logs', label: 'Files' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'settings', label: 'Settings' },
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
                <h1 className="text-xl font-bold">Photo Distributor</h1>
                <p className="text-sm text-gray-400">Dashboard</p>
              </div>
            </div>
            <button
              onClick={fetchInitialData}
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
          <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        </div>

        {/* Tab Content */}
        {activeTab === 'status' && (
          <div className="space-y-8">
            {/* Active Receives */}
            {status?.activeReceives && status.activeReceives.length > 0 && (
              <ActiveReceiveIndicator receives={status.activeReceives} />
            )}

            {/* Active Uploads */}
            {status?.activeUploads &&
              Object.keys(status.activeUploads).length > 0 && (
                <ActiveUploadIndicator uploads={status.activeUploads} />
              )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Files Received"
                value={status?.stats?.totalReceivedFiles || 0}
                icon={Icons.Image}
              />
              <StatsCard
                title="Total Uploads"
                value={status?.stats?.totalUploads || 0}
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
                <div>
                  <p className="text-gray-400">Username</p>
                  <p className="font-mono">
                    {status?.ftpServer?.username || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Password</p>
                  <p className="font-mono">
                    {status?.ftpServer?.password || '—'}
                  </p>
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

            {/* Recent Received Files */}
            <Card>
              <h2 className="text-lg font-semibold mb-4">
                Recently Received Files
              </h2>
              <div className="space-y-3">
                {receivedFiles.slice(0, 5).map((file) => (
                  <ReceivedFileEntry
                    key={file.id}
                    file={file}
                    expanded={expandedFiles.has(file.id)}
                    onToggle={() => toggleFileExpanded(file.id)}
                    onRetry={handleRetryUpload}
                  />
                ))}
                {receivedFiles.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    No files received yet
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'logs' && (
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Received Files</h2>
              <div className="flex items-center gap-3">
                {hasAnyFailedUploads && (
                  <button
                    onClick={handleRetryAllFailed}
                    disabled={retryingAll}
                    className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {retryingAll ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-400 border-t-transparent rounded-full"></div>
                    ) : (
                      <Icons.Refresh />
                    )}
                    <span>Retry All Failed</span>
                  </button>
                )}
                <span className="text-sm text-gray-400">
                  {status?.stats?.totalReceivedFiles || 0} files received
                </span>
              </div>
            </div>

            {/* Active Receives */}
            {status?.activeReceives && status.activeReceives.length > 0 && (
              <ActiveReceiveIndicator receives={status.activeReceives} />
            )}

            {/* Active Uploads */}
            {status?.activeUploads &&
              Object.keys(status.activeUploads).length > 0 && (
                <ActiveUploadIndicator uploads={status.activeUploads} />
              )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {receivedFiles.map((file) => (
                <ReceivedFileEntry
                  key={file.id}
                  file={file}
                  expanded={expandedFiles.has(file.id)}
                  onToggle={() => toggleFileExpanded(file.id)}
                  onRetry={handleRetryUpload}
                />
              ))}
              {receivedFiles.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No files received yet
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
                  placeholder="pd"
                />
                <Input
                  label="Password"
                  type="password"
                  showToggle={true}
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

            {/* Upload Behavior */}
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icons.Upload /> Upload Behavior
              </h3>
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-medium">Delete After Upload</p>
                  <p className="text-sm text-gray-400">
                    Delete source file from temporary folder after successful
                    upload to all destinations
                  </p>
                </div>
                <Toggle
                  checked={settings.deleteAfterUpload ?? true}
                  onChange={(v) => updateSetting('deleteAfterUpload', v)}
                />
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'destinations' && settings && (
          <div className="space-y-6">
            {/* Save Button */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Upload Destinations</h2>
                <p className="text-gray-400 text-sm">
                  Configure where your photos are uploaded.
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

            {/* Local Destination */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-700/50 rounded-lg text-gray-400">
                    <Icons.Folder />
                  </div>
                  <div>
                    <h3 className="font-semibold">Local Filesystem</h3>
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
                <div className="pt-4 border-t border-gray-700/50">
                  <Input
                    label="Photos Directory"
                    value={settings.destinations?.local?.photosDir || ''}
                    onChange={(v) =>
                      updateSetting('destinations.local.photosDir', v)
                    }
                    placeholder="/path/to/photos"
                    disabled={isDocker}
                  />
                  {isDocker && (
                    <p className="text-xs text-gray-400 mt-1">
                      Locked to /data/photos in Docker. Use a volume mount to map this to your host directory.
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* Google Drive Destination */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <Icons.Google />
                  </div>
                  <div>
                    <h3 className="font-semibold">Google Drive</h3>
                    <p className="text-sm text-gray-400">
                      {authStatus?.drive?.authenticated
                        ? 'Connected and ready'
                        : authStatus?.drive?.hasCredentials
                          ? 'Credentials found, needs authentication'
                          : 'Upload to Google Drive'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {authStatus?.drive?.authenticated && (
                    <StatusBadge status="authenticated" />
                  )}
                  {!authStatus?.drive?.authenticated &&
                    authStatus?.drive?.hasCredentials && (
                      <button
                        onClick={() => handleGoogleConnect('drive')}
                        className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  {authStatus?.drive?.authenticated && (
                    <Toggle
                      checked={
                        settings.destinations?.googleDrive?.enabled ?? false
                      }
                      onChange={(v) =>
                        updateSetting('destinations.googleDrive.enabled', v)
                      }
                    />
                  )}
                </div>
              </div>
              {!authStatus?.drive?.hasCredentials && (
                <div className="pt-4 border-t border-gray-700/50">
                  <FileUploadButton
                    label="Upload Google Drive Credentials"
                    onUpload={(file) => handleCredentialsUpload('drive', file)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload your OAuth 2.0 credentials JSON file to get started
                  </p>
                </div>
              )}
              {settings.destinations?.googleDrive?.enabled && (
                <div className="pt-4 border-t border-gray-700/50 space-y-4">
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
                </div>
              )}
            </Card>

            {/* Google Photos Destination */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <Icons.Google />
                  </div>
                  <div>
                    <h3 className="font-semibold">Google Photos</h3>
                    <p className="text-sm text-gray-400">
                      {authStatus?.photos?.authenticated
                        ? 'Connected and ready'
                        : authStatus?.photos?.hasCredentials
                          ? 'Credentials found, needs authentication'
                          : 'Upload to Google Photos library'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {authStatus?.photos?.authenticated && (
                    <StatusBadge status="authenticated" />
                  )}
                  {!authStatus?.photos?.authenticated &&
                    authStatus?.photos?.hasCredentials && (
                      <button
                        onClick={() => handleGoogleConnect('photos')}
                        className="px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-medium transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  {authStatus?.photos?.authenticated && (
                    <Toggle
                      checked={
                        settings.destinations?.googlePhotos?.enabled ?? false
                      }
                      onChange={(v) =>
                        updateSetting('destinations.googlePhotos.enabled', v)
                      }
                    />
                  )}
                </div>
              </div>
              {!authStatus?.photos?.hasCredentials && (
                <div className="pt-4 border-t border-gray-700/50">
                  <FileUploadButton
                    label="Upload Google Photos Credentials"
                    onUpload={(file) => handleCredentialsUpload('photos', file)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Upload your OAuth 2.0 credentials JSON file to get started
                  </p>
                </div>
              )}
            </Card>

            {/* Setup Instructions */}
            <Card className="bg-blue-500/10 border-blue-500/20">
              <h3 className="font-semibold mb-2">
                Google API Setup Instructions
              </h3>
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
                  Click "Upload Credentials" above and select your JSON file
                </li>
                <li>
                  Click "Connect" to authenticate with your Google account
                </li>
              </ol>
            </Card>

            <p className="text-xs text-gray-500">
              💡 After changing destination settings, click "Save Settings" to
              apply changes.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          Photo Distributor
        </div>
      </footer>
    </div>
  )
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
