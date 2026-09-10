export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (res.status === 401) {
    window.location.href = '/';
    return new Promise(() => {});
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(text || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return res.status === 204 ? null : res.json();
}

export const STATUS_BADGE_CLASSES = Object.freeze({
  pending: 'text-bg-warning',
  approved: 'text-bg-success',
  rejected: 'text-bg-danger',
  withdrawn: 'text-bg-secondary',
});

export function statusBadgeClass(status) {
  return STATUS_BADGE_CLASSES[status];
}

export function describeApplication(app) {
  return app.application_type === 'deferment'
    ? `Deferment: ${app.deferment_reason}`
    : `Division: ${app.service_division}`;
}
