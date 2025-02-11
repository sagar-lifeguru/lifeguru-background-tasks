'use strict';

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   * Useful when you have multiple applications being monitored
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'My Node Application'],
  
  /**
   * Your New Relic license key.
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  /**
   * This setting controls distributed tracing.
   *
   * Distributed tracing lets you see the path that a request takes through your
   * distributed system. Enabling distributed tracing changes the behavior of some
   * New Relic features, so carefully consult the transition guide before you enable
   * this feature: https://docs.newrelic.com/docs/transition-guide-distributed-tracing
   */
  distributed_tracing: {
    enabled: true
  },

  /**
   * Logging Level:
   *   'trace' -> debugging + all logging levels
   *   'debug' -> display debugging info
   *   'info'  -> display informational messages
   *   'warn'  -> display warning messages
   *   'error' -> display error messages
   */
  logging: {
    level: 'info',
    enabled: true,
    // Include stack traces in errors logged to the agent
    signals_stacktrace_enabled: true
  },

  /**
   * Transaction tracer settings
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    explain_threshold: 500,
    stack_trace_threshold: 500
  },

  /**
   * Error collector settings
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [404, 401, 403],
    capture_events: true,
    max_event_samples_stored: 100
  },

  /**
   * Transaction Events
   */
  transaction_events: {
    enabled: true,
    max_samples_stored: 10000
  },

  /**
   * Browser monitoring settings
   */
  browser_monitoring: {
    enabled: true,
    auto_instrument: true
  },

  /**
   * Slow SQL tracking
   */
  slow_sql: {
    enabled: true,
    max_samples: 10
  },

  /**
   * Application Logging
   * Beta feature
   */
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000
    },
    metrics: {
      enabled: true
    },
    local_decorating: {
      enabled: true
    }
  },

  /**
   * Cross Application Tracing
   */
  cross_application_tracer: {
    enabled: true
  },

  /**
   * Serverless mode settings
   * Not needed for traditional Node.js apps
   */
  serverless_mode: {
    enabled: false
  },

  /**
   * Custom attributes
   */
  custom_attributes: {
    enabled: true
  },

  /**
   * Process host monitoring
   */
  process_host: {
    display_name: process.env.NEW_RELIC_PROCESS_HOST_DISPLAY_NAME,
    ipv_preference: '4'
  },

  /**
   * Rules for naming or ignoring transactions
   */
  rules: {
    name: [
      // Ignore health check endpoints
      { pattern: '^/health$', name: '/health' },
      // Group all /api/users/* routes
      { pattern: '^/api/users/.*', name: '/api/users/:id' }
    ],
    ignore: [
      '^/ping$',
      '^/metrics$',
      '^/favicon.ico$'
    ]
  },

  /**
   * Event harvest limits
   */
  event_harvest_config: {
    report_period_ms: 5000,
    harvest_limits: {
      error_event_data: 8,
      custom_event_data: 83,
      analytic_event_data: 833
    }
  },

  /**
   * Transaction trace configuration
   */
  transaction_trace: {
    enabled: true,
    record_sql: 'obfuscated',
    stack_trace_threshold: 500,
    explain_threshold: 500
  },

  /**
   * Cross Application Tracing
   */
  cross_application_tracer: {
    enabled: true
  },

  /**
   * MySQL/Sequelize specific settings
   */
  datastore_tracer: {
    database_name_reporting: {
      enabled: true
    },
    instance_reporting: {
      enabled: true
    }
  },

  /**
   * Allow tracing all N+1 queries
   */
  sequelize: {
    trace_n_plus_one: true
  },

  /**
   * Labels for your application
   */
  labels: {
    environment: process.env.NODE_ENV || 'development',
    region: process.env.AWS_REGION || 'local'
  },

  /**
   * High Security Mode
   */
  high_security: false,

  /**
   * Security Policies
   */
  security_policies: {
    stdout: {
      enabled: true
    }
  },

  /**
   * AI Monitoring
   */
  ai_monitoring: {
    enabled: true
  },

  /**
   * Infinite tracing
   */
  infinite_tracing: {
    trace_observer: {
      host: process.env.NEW_RELIC_TRACE_OBSERVER_HOST,
      port: process.env.NEW_RELIC_TRACE_OBSERVER_PORT
    }
  }
};
