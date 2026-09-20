# Military Portal frontend

Svelte frontend for the Military Portal Deployment project found in github.com/Sijma/military-portal-deployment.

The application expects to be served behind APISIX. API requests use the same-origin `/api` path,
auth/logout are handled by the gateway and Keycloak.

The Vite server can run the application shell standalone but the role-specific views require the full APISIX and Keycloak stack
as the app immediately requests the authenticated identity from `/api/me`.

The full application is meant to be run from the unified deployment repository with Docker Compose.


`npm run build` generates static files in `dist/`. The Docker image serves them  with nginx and falls back to
`index.html` for client-side routes.

Pushing a tagged commit triggers Jenkins to build and publish:
- A container image
- A `frontend-dist.tar.gz` release used by Ansible downstream.
