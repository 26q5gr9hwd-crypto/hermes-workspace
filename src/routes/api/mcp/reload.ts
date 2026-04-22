import { createFileRoute } from '@tanstack/react-router'
import { isAuthenticated } from '../../../server/auth-middleware'
import {
  BEARER_TOKEN,
  HERMES_API,
  dashboardFetch,
  ensureGatewayProbed,
  getCapabilities,
} from '../../../server/gateway-capabilities'

type AuthResult = Response | true

function authHeaders(): Record<string, string> {
  return BEARER_TOKEN ? { Authorization: `Bearer ${BEARER_TOKEN}` } : {}
}

const RELOAD_PATHS = ['/api/reload-mcp', '/api/mcp/reload']

export const Route = createFileRoute('/api/mcp/reload')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authResult = isAuthenticated(request) as AuthResult
        if (authResult !== true) return authResult

        await ensureGatewayProbed()
        const dashboardAvailable = getCapabilities().dashboard.available

        // Zero-fork path: try the dashboard first. Vanilla hermes-agent 0.9.x
        // does not yet expose an MCP reload endpoint — these probes are
        // forward-compatible for future dashboard versions.
        if (dashboardAvailable) {
          for (const path of RELOAD_PATHS) {
            try {
              const response = await dashboardFetch(path, { method: 'POST' })
              if (response.ok) {
                return Response.json({
                  ok: true,
                  message: 'MCP server reload requested.',
                })
              }
            } catch {
              // Try the next candidate endpoint.
            }
          }
        }

        // Enhanced-fork fallback: older Hermes builds exposed these on the
        // gateway HTTP API.
        for (const path of RELOAD_PATHS) {
          try {
            const response = await fetch(`${HERMES_API}${path}`, {
              method: 'POST',
              headers: authHeaders(),
            })

            if (response.ok) {
              return Response.json({
                ok: true,
                message: 'MCP server reload requested.',
              })
            }
          } catch {
            // Try the next candidate endpoint.
          }
        }

        return Response.json({
          ok: false,
          message: 'Use /reload-mcp in chat to reload MCP servers.',
        })
      },
    },
  },
})
