import { useEffect, useMemo, useState } from 'react'
import './App.css'

type BuilderMode = 'frontend' | 'backend'
type Page = 'builder' | 'settings' | 'build'
type ProviderMode = 'cloud' | 'local' | 'external'
type TaskStatus = 'pending' | 'active' | 'done' | 'blocked' | 'failed'

type CatalogItem = {
  id: string
  kind: BuilderMode
  category: string
  name: string
  description: string
  tags: string[]
  accent: string
  preview: string
}

type BuildTask = {
  id: string
  label: string
  detail: string
  status: TaskStatus
}

type BuildEvent = {
  id: number
  type: string
  severity: 'info' | 'warn' | 'error'
  text: string
  time: string
}

const frontendCatalog: CatalogItem[] = [
  {
    id: 'dashboard-shell',
    kind: 'frontend',
    category: 'UI Components',
    name: 'Dashboard Shell',
    description: 'A polished admin layout with navigation, metrics, and workspace summary panels.',
    tags: ['layout', 'dashboard', 'admin'],
    accent: '#7c3aed',
    preview: 'KPI cards, activity feed, chart rail, action bar',
  },
  {
    id: 'signup-form',
    kind: 'frontend',
    category: 'Forms',
    name: 'Signup Form',
    description: 'A guided registration flow with inline validation, password strength, and consent checks.',
    tags: ['form', 'auth', 'wizard'],
    accent: '#2563eb',
    preview: 'Multi-step signup, validation, step tracker',
  },
  {
    id: 'command-palette',
    kind: 'frontend',
    category: 'Navigation',
    name: 'Command Palette',
    description: 'Search files, commands, and app features through a keyboard-first modal overlay.',
    tags: ['navigation', 'search', 'keyboard'],
    accent: '#14b8a6',
    preview: 'Quick actions, command list, keyboard hints',
  },
  {
    id: 'toast-stack',
    kind: 'frontend',
    category: 'Feedback',
    name: 'Toast Stack',
    description: 'Non-blocking success, warning, and error messages with action affordances.',
    tags: ['toast', 'notification', 'alert'],
    accent: '#f97316',
    preview: 'Queued notifications, dismiss actions, click-through',
  },
  {
    id: 'fade-in',
    kind: 'frontend',
    category: 'Animations',
    name: 'Fade In Motion',
    description: 'Accessible enter and exit transitions with reduced-motion awareness.',
    tags: ['motion', 'fade', 'transition'],
    accent: '#ec4899',
    preview: 'Animated panels and staggered cards',
  },
  {
    id: 'saas-template',
    kind: 'frontend',
    category: 'Templates',
    name: 'SaaS Dashboard',
    description: 'A marketing and product dashboard for SaaS operations and revenue reporting.',
    tags: ['dashboard', 'saas', 'analytics'],
    accent: '#22c55e',
    preview: 'Hero, pricing cards, analytics widgets',
  },
]

const backendCatalog: CatalogItem[] = [
  {
    id: 'rest-api',
    kind: 'backend',
    category: 'API Components',
    name: 'REST API Gateway',
    description: 'Versioned endpoints for list, create, update, delete, and query flows.',
    tags: ['rest', 'crud', 'versioning'],
    accent: '#06b6d4',
    preview: 'GET /api/projects, POST /api/projects, filters',
  },
  {
    id: 'auth-service',
    kind: 'backend',
    category: 'Authentication',
    name: 'JWT Auth Service',
    description: 'Role-aware authentication with token refresh, RBAC checks, and secure session flows.',
    tags: ['jwt', 'rbac', 'auth'],
    accent: '#8b5cf6',
    preview: 'login, refresh, authorization middleware',
  },
  {
    id: 'structured-logging',
    kind: 'backend',
    category: 'Infrastructure',
    name: 'Structured Logging',
    description: 'Request IDs, correlation IDs, structured metadata, and sanitized error output.',
    tags: ['logging', 'observability', 'debug'],
    accent: '#0ea5e9',
    preview: 'JSON log entries with request metadata',
  },
  {
    id: 'message-bus',
    kind: 'backend',
    category: 'Infrastructure',
    name: 'Async Message Queue',
    description: 'Background jobs, retries, dead-letter queues, and event-driven processing.',
    tags: ['queue', 'jobs', 'async'],
    accent: '#f59e0b',
    preview: 'queue workers, retries, job status hooks',
  },
  {
    id: 'fastapi',
    kind: 'backend',
    category: 'Frameworks',
    name: 'FastAPI Service',
    description: 'Modern Python API stack with dependency injection, Pydantic validation, and Swagger docs.',
    tags: ['fastapi', 'python', 'api'],
    accent: '#10b981',
    preview: 'OpenAPI, typed schemas, async endpoints',
  },
  {
    id: 'postgres',
    kind: 'backend',
    category: 'Infrastructure',
    name: 'Postgres + Prisma',
    description: 'Relational data layer with migrations, models, and typed database access.',
    tags: ['database', 'orm', 'migrations'],
    accent: '#ef4444',
    preview: 'schema, migrations, typed queries',
  },
]

const basePlan: BuildTask[] = [
  { id: 'plan', label: 'Analyze requirements', detail: 'Review the selected stack, workflows, and constraints.', status: 'pending' },
  { id: 'init', label: 'Initialize project structure', detail: 'Create the app scaffold and shared configuration.', status: 'pending' },
  { id: 'ui', label: 'Implement reusable UI system', detail: 'Build the selected frontend components and templates.', status: 'pending' },
  { id: 'api', label: 'Implement backend contracts', detail: 'Add API routes, validation, and database adapters.', status: 'pending' },
  { id: 'test', label: 'Run validation and QA', detail: 'Execute lint, tests, and build checks for the app.', status: 'pending' },
  { id: 'ship', label: 'Package and summarize delivery', detail: 'Generate README, run instructions, and build report.', status: 'pending' },
]

const buildStages = [
  { phase: 'planning', label: 'Analyze requirements' },
  { phase: 'building', label: 'Initialize project structure' },
  { phase: 'building', label: 'Implement reusable UI system' },
  { phase: 'building', label: 'Implement backend contracts' },
  { phase: 'testing', label: 'Run validation and QA' },
  { phase: 'completed', label: 'Package and summarize delivery' },
] as const

function App() {
  const [page, setPage] = useState<Page>('builder')
  const [builderMode, setBuilderMode] = useState<BuilderMode>('frontend')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(frontendCatalog[0].id)
  const [selection, setSelection] = useState<CatalogItem[]>([frontendCatalog[0], backendCatalog[0]])
  const [appName, setAppName] = useState('Orbit Workbench')
  const [requirements, setRequirements] = useState(
    'Create a collaborative product workspace with a polished dashboard, authentication, analytics, and secure backend APIs for team workflows.',
  )
  const [providerMode, setProviderMode] = useState<ProviderMode>('cloud')
  const [providerName, setProviderName] = useState('OpenAI')
  const [apiKey, setApiKey] = useState('sk-live-demo-••••••••••••')
  const [connectionState, setConnectionState] = useState('Connected and ready')
  const [planGenerated, setPlanGenerated] = useState(false)
  const [tasks, setTasks] = useState<BuildTask[]>(basePlan)
  const [activeStep, setActiveStep] = useState(0)
  const [buildStatus, setBuildStatus] = useState<'idle' | 'planning' | 'building' | 'testing' | 'completed' | 'failed' | 'paused'>('idle')
  const [events, setEvents] = useState<BuildEvent[]>([
    { id: 1, type: 'planning', severity: 'info', text: 'Build ready. Waiting for approval.', time: '09:14:12' },
    { id: 2, type: 'system', severity: 'info', text: 'Provider connection validated for OpenAI.', time: '09:14:18' },
  ])
  const [logs, setLogs] = useState<string[]>([
    '$ npm install',
    '✔ dependencies resolved',
    '✔ vite build configuration created',
  ])

  const catalog = useMemo(
    () => (builderMode === 'frontend' ? frontendCatalog : backendCatalog),
    [builderMode],
  )

  const categories = ['all', ...new Set(catalog.map((item) => item.category))]

  const visibleItems = selectedCategory === 'all' ? catalog : catalog.filter((item) => item.category === selectedCategory)

  const selectedDetail =
    catalog.find((item) => item.id === selectedDetailId) ??
    selection[0] ??
    catalog[0]

  useEffect(() => {
    if (buildStatus === 'idle' || buildStatus === 'completed' || buildStatus === 'failed' || buildStatus === 'paused') {
      return
    }

    const currentStage = buildStages[activeStep]
    const timeout = window.setTimeout(() => {
      setTasks((current) =>
        current.map((task, index) => {
          if (index < activeStep) {
            return { ...task, status: 'done' }
          }
          if (index === activeStep) {
            return { ...task, status: 'done' }
          }
          if (index === activeStep + 1) {
            return { ...task, status: 'active' }
          }
          return task
        }),
      )

      setLogs((current) => [`$ ${currentStage.label.toLowerCase()}`, ...current].slice(0, 8))
      const event: BuildEvent = {
        id: Date.now(),
        type: currentStage.phase,
        severity: 'info',
        text: `${currentStage.label} completed successfully.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }
      setEvents((current) => [event, ...current].slice(0, 8))

      if (activeStep >= buildStages.length - 1) {
        setBuildStatus('completed')
        setActiveStep(buildStages.length)
        return
      }

      setActiveStep((step) => step + 1)
    }, 1400)

    return () => window.clearTimeout(timeout)
  }, [activeStep, buildStatus])

  const progress = useMemo(() => {
    const doneCount = tasks.filter((task) => task.status === 'done').length
    return Math.round((doneCount / tasks.length) * 100)
  }, [tasks])

  const toggleSelection = (item: CatalogItem) => {
    setSelection((current) => {
      const exists = current.some((selectedItem) => selectedItem.id === item.id)
      if (exists) {
        return current.filter((selectedItem) => selectedItem.id !== item.id)
      }
      return [...current, item]
    })
  }

  const resetPlan = () => {
    setTasks(basePlan)
    setPlanGenerated(false)
    setBuildStatus('idle')
    setActiveStep(0)
    setEvents([
      { id: 1, type: 'planning', severity: 'info', text: 'Build ready. Waiting for approval.', time: '09:14:12' },
      { id: 2, type: 'system', severity: 'info', text: 'Provider connection validated for OpenAI.', time: '09:14:18' },
    ])
  }

  const generatePlan = () => {
    const generatedTasks: BuildTask[] = [
      { id: 'plan', label: 'Analyze requirements', detail: `Scope ${appName} and confirm stack decisions.`, status: 'done' },
      { id: 'init', label: 'Initialize project structure', detail: 'Set up the app shell, configs, and toolchain.', status: 'active' },
      { id: 'ui', label: 'Implement reusable UI system', detail: 'Add the chosen components and layout patterns.', status: 'pending' },
      { id: 'api', label: 'Implement backend contracts', detail: 'Wire up API endpoints and auth layers.', status: 'pending' },
      { id: 'test', label: 'Run validation and QA', detail: 'Run build verification and targeted tests.', status: 'pending' },
      { id: 'ship', label: 'Package and summarize delivery', detail: 'Generate release notes and project handoff.', status: 'pending' },
    ]

    setTasks(generatedTasks)
    setBuildStatus('planning')
    setActiveStep(0)
    setPlanGenerated(true)
    const event: BuildEvent = {
      id: Date.now(),
      type: 'planning',
      severity: 'info',
      text: `Implementation plan generated for ${appName}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
    setEvents((current) => [event, ...current].slice(0, 8))
  }

  const startBuild = () => {
    setBuildStatus('planning')
    setActiveStep(0)
    setTasks(basePlan)
    const event: BuildEvent = {
      id: Date.now(),
      type: 'agent',
      severity: 'info',
      text: `Starting build for ${appName}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
    setEvents((current) => [event, ...current].slice(0, 8))
    setLogs([
      `$ npm run build`,
      '✔ environment prepared',
      '✔ dependencies validated',
    ])
  }

  const handleConnectionTest = () => {
    setConnectionState(providerMode === 'local' ? 'Local endpoint reachable' : 'Connection verified')
    const event: BuildEvent = {
      id: Date.now(),
      type: 'provider',
      severity: 'info',
      text: `${providerName} connection check passed.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
    setEvents((current) => [event, ...current].slice(0, 8))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">B</div>
          <div>
            <div className="eyebrow">AI build lab</div>
            <h1>BuildPilot</h1>
          </div>
        </div>

        <nav className="main-nav" aria-label="Primary sections">
          <button type="button" className={page === 'builder' ? 'nav-button active' : 'nav-button'} onClick={() => setPage('builder')}>
            Builder
          </button>
          <button type="button" className={page === 'settings' ? 'nav-button active' : 'nav-button'} onClick={() => setPage('settings')}>
            Providers
          </button>
          <button type="button" className={page === 'build' ? 'nav-button active' : 'nav-button'} onClick={() => setPage('build')}>
            Build
          </button>
        </nav>

        <div className="cart-pill">
          <span>Selection</span>
          <strong>{selection.length}</strong>
        </div>
      </header>

      <main className="app-grid">
        <aside className="left-panel">
          <div className="panel-header">
            <h2>Selection cart</h2>
            <span>{selection.length} items</span>
          </div>

          <div className="selection-list">
            {selection.length === 0 ? (
              <div className="empty-cart">No artifacts selected yet.</div>
            ) : (
              selection.map((item) => (
                <div key={item.id} className="selection-item">
                  <div className="swatch" style={{ background: item.accent }} />
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.category}</small>
                  </div>
                  <button type="button" className="mini-button" onClick={() => toggleSelection(item)}>
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="quick-metrics">
            <div>
              <span>Stack</span>
              <strong>React + TypeScript</strong>
            </div>
            <div>
              <span>Runtime</span>
              <strong>{providerMode === 'cloud' ? 'Cloud LLM' : providerMode === 'local' ? 'Local model' : 'External agent'}</strong>
            </div>
          </div>
        </aside>

        <section className="main-panel">
          {page === 'builder' && (
            <>
              <div className="builder-header">
                <div>
                  <span className="eyebrow">Experience catalog</span>
                  <h2>{builderMode === 'frontend' ? 'Frontend Builder' : 'Backend Builder'}</h2>
                </div>
                <div className="toggle-row">
                  <button type="button" className={builderMode === 'frontend' ? 'mode-button active' : 'mode-button'} onClick={() => setBuilderMode('frontend')}>
                    Frontend
                  </button>
                  <button type="button" className={builderMode === 'backend' ? 'mode-button active' : 'mode-button'} onClick={() => setBuilderMode('backend')}>
                    Backend
                  </button>
                </div>
              </div>

              <div className="category-strip">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={selectedCategory === category ? 'category-pill active' : 'category-pill'}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="builder-content">
                <div className="catalog-grid">
                  {visibleItems.map((item) => {
                    const active = selection.some((selectedItem) => selectedItem.id === item.id)
                    return (
                      <article key={item.id} className={active ? 'catalog-card selected' : 'catalog-card'} onClick={() => setSelectedDetailId(item.id)}>
                        <div className="card-accent" style={{ background: item.accent }} />
                        <div className="card-head">
                          <h3>{item.name}</h3>
                          <span>{item.category}</span>
                        </div>
                        <p>{item.description}</p>
                        <div className="tag-row">
                          {item.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                        <div className="card-actions">
                          <small>{item.preview}</small>
                          <button type="button" onClick={(event) => {
                            event.stopPropagation()
                            toggleSelection(item)
                          }}>
                            {active ? 'Remove' : 'Add to cart'}
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <aside className="detail-panel">
                  <span className="eyebrow">Selected detail</span>
                  <h3>{selectedDetail.name}</h3>
                  <p>{selectedDetail.description}</p>

                  <div className="inline-metrics">
                    <div>
                      <strong>Type</strong>
                      <span>{selectedDetail.kind}</span>
                    </div>
                    <div>
                      <strong>Category</strong>
                      <span>{selectedDetail.category}</span>
                    </div>
                  </div>

                  <ul className="detail-list">
                    <li>Live preview and configuration controls</li>
                    <li>Accessibility and reduced-motion support</li>
                    <li>Composable patterns for production builds</li>
                  </ul>

                  <div className="config-box">
                    <label>
                      <input type="checkbox" defaultChecked />
                      Enable responsive behavior
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked />
                      Add validation and error states
                    </label>
                    <label>
                      <input type="checkbox" defaultChecked />
                      Include accessibility hooks
                    </label>
                  </div>

                  <button type="button" className="primary-button" onClick={() => toggleSelection(selectedDetail)}>
                    {selection.some((item) => item.id === selectedDetail.id) ? 'Remove from selection' : 'Add to selection'}
                  </button>
                </aside>
              </div>
            </>
          )}

          {page === 'settings' && (
            <div className="settings-page">
              <div className="panel-header">
                <h2>AI Provider Settings</h2>
                <span>{connectionState}</span>
              </div>

              <div className="provider-grid">
                <div className="provider-column">
                  <div className="provider-modes">
                    {(['cloud', 'local', 'external'] as ProviderMode[]).map((mode) => (
                      <button key={mode} type="button" className={providerMode === mode ? 'mode-button active' : 'mode-button'} onClick={() => setProviderMode(mode)}>
                        {mode === 'cloud' ? 'Cloud LLM' : mode === 'local' ? 'Local LLM' : 'External agent'}
                      </button>
                    ))}
                  </div>

                  <label>
                    Provider
                    <select value={providerName} onChange={(event) => setProviderName(event.target.value)}>
                      <option value="OpenAI">OpenAI</option>
                      <option value="Anthropic">Anthropic</option>
                      <option value="Gemini">Google Gemini</option>
                      <option value="Codex">OpenAI Codex</option>
                    </select>
                  </label>

                  <label>
                    API key
                    <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} />
                  </label>

                  <label>
                    Model
                    <select defaultValue="gpt-4.1">
                      <option value="gpt-4.1">gpt-4.1</option>
                      <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
                      <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    </select>
                  </label>

                  <div className="actions-row">
                    <button type="button" className="primary-button" onClick={handleConnectionTest}>Test connection</button>
                    <button type="button" className="secondary-button">Save session</button>
                  </div>
                </div>

                <div className="provider-column">
                  <h3>Execution architecture</h3>
                  <ul className="detail-list">
                    <li>Dedicated coding-agent runtime with file-edit permissions</li>
                    <li>Actual command execution and validation through isolated containers</li>
                    <li>Live progress, logs, and task history tracked by build ID</li>
                    <li>Explicit auth separation between model access and runtime permissions</li>
                  </ul>

                  <div className="status-card">
                    <strong>Connection status</strong>
                    <p>{connectionState}</p>
                    <small>Context window: 128k • Token budget: 80k</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {page === 'build' && (
            <div className="build-page">
              <div className="build-topbar">
                <div>
                  <span className="eyebrow">Build application</span>
                  <h2>Implementation workspace</h2>
                </div>
                <div className="build-status-badge">{buildStatus === 'idle' ? 'Ready' : buildStatus}</div>
              </div>

              <div className="project-spec">
                <label>
                  Application name
                  <input type="text" value={appName} onChange={(event) => setAppName(event.target.value)} />
                </label>
                <label>
                  Requirements
                  <textarea rows={4} value={requirements} onChange={(event) => setRequirements(event.target.value)} />
                </label>
              </div>

              <div className="execution-mode">
                <span>Execution mode</span>
                <div className="toggle-row">
                  {(['cloud', 'local', 'external'] as ProviderMode[]).map((mode) => (
                    <button key={mode} type="button" className={providerMode === mode ? 'mode-button active' : 'mode-button'} onClick={() => setProviderMode(mode)}>
                      {mode === 'cloud' ? 'Cloud LLM' : mode === 'local' ? 'Local LLM' : 'External agent'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="plan-actions">
                <button type="button" className="primary-button" onClick={generatePlan}>Generate plan</button>
                <button type="button" className="secondary-button" onClick={startBuild}>Launch build</button>
                <button type="button" className="secondary-button" onClick={resetPlan}>Reset</button>
                <span className="status-pill">{planGenerated ? 'Plan approved' : 'Plan pending'}</span>
              </div>

              <div className="build-panel">
                <div className="stat-row">
                  <div>
                    <span>Progress</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div>
                    <span>Current phase</span>
                    <strong>{buildStages[Math.min(activeStep, buildStages.length - 1)]?.phase ?? 'idle'}</strong>
                  </div>
                  <div>
                    <span>Current task</span>
                    <strong>{buildStages[Math.min(activeStep, buildStages.length - 1)]?.label ?? 'Awaiting input'}</strong>
                  </div>
                </div>

                <div className="progress-bar">
                  <span style={{ width: `${progress}%` }} />
                </div>

                <div className="task-grid">
                  <div className="task-list">
                    {tasks.map((task) => (
                      <div key={task.id} className={`task-row ${task.status}`}>
                        <div className="task-dot" />
                        <div>
                          <strong>{task.label}</strong>
                          <small>{task.detail}</small>
                        </div>
                        <span>{task.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="log-panel">
                    <h3>Live activity</h3>
                    <div className="event-feed">
                      {events.map((event) => (
                        <div key={event.id} className={`event ${event.severity}`}>
                          <span>{event.type}</span>
                          <p>{event.text}</p>
                          <small>{event.time}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="terminal-box">
                  <h3>Terminal output</h3>
                  <pre>
                    {logs.map((line, index) => (
                      <div key={`${line}-${index}`}>{line}</div>
                    ))}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
