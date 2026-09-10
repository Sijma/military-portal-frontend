<script>
  import { onMount } from 'svelte';
  import { api, describeApplication, statusBadgeClass } from './api.js';

  const STATUSES = ['pending', 'approved', 'rejected', 'withdrawn'];

  let allApps = [];
  let loading = true;
  let loadError = null;
  let typeFilter = 'all';
  let statusFilter = 'all';
  let pendingStatus = {};
  let saveMessage = {};

  async function load() {
    loading = true;
    loadError = null;
    try {
      allApps = await api('/admin/applications');
      pendingStatus = Object.fromEntries(allApps.map((a) => [a.applicant_amka, a.status]));
    } catch (e) {
      loadError = e.message;
    }
    loading = false;
  }

  onMount(load);

  $: visibleApps = allApps.filter((app) =>
    (typeFilter === 'all' || app.application_type === typeFilter) &&
    (statusFilter === 'all' || app.status === statusFilter)
  );

  async function apply(amka) {
    saveMessage = { ...saveMessage, [amka]: '' }; // clear save message (so it doesn't save across applications)
    try {
      await api(`/admin/applications/${amka}`, { method: 'PUT', body: JSON.stringify({ status: pendingStatus[amka] }) });
      saveMessage = { ...saveMessage, [amka]: 'Saved.' };
      const app = allApps.find((a) => a.applicant_amka === amka);
      if (app) app.status = pendingStatus[amka];
      allApps = allApps; // This causes things like the badge to update
    } catch (e) {
      saveMessage = { ...saveMessage, [amka]: e.message };
    }
  }

  async function del(amka) {
    if (!confirm(`Delete the application for AMKA ${amka}?`)) return;
    try {
      await api(`/admin/applications/${amka}`, { method: 'DELETE' });
      allApps = allApps.filter((a) => a.applicant_amka !== amka);
    } catch (e) {
      alert(e.message);
    }
  }

</script>

<h2 class="mb-3">All applications</h2>
<div class="row g-3 mb-4">
  <div class="col-md-6">
    <label class="form-label" for="admin-type-filter">Filter by type</label>
    <select class="form-select" id="admin-type-filter" bind:value={typeFilter}>
      <option value="all">all</option>
      <option value="deferment">deferment</option>
      <option value="service">service</option>
    </select>
  </div>
  <div class="col-md-6">
    <label class="form-label" for="admin-status-filter">Filter by status</label>
    <select class="form-select" id="admin-status-filter" bind:value={statusFilter}>
      <option value="all">all</option>
      {#each STATUSES as s}<option value={s}>{s}</option>{/each}
    </select>
  </div>
</div>

{#if loading}
  <div class="alert alert-info" role="status">Loading...</div>
{:else if loadError}
  <div class="alert alert-danger" role="alert">{loadError}</div>
{:else if visibleApps.length === 0}
  <div class="alert alert-secondary" role="status">No applications match this filter.</div>
{:else}
  {#each visibleApps as app (app.applicant_amka)}
    <article class="card shadow-sm mb-3">
      <header class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <strong>AMKA {app.applicant_amka} - {app.applicant_email}</strong>
        <span class="badge text-uppercase {statusBadgeClass(app.status)}">{app.status}</span>
      </header>
      <div class="card-body">
        <p class="card-text">{describeApplication(app)}</p>
        <label class="form-label" for="admin-status-{app.applicant_amka}">Status</label>
        <select class="form-select mb-3" id="admin-status-{app.applicant_amka}" bind:value={pendingStatus[app.applicant_amka]}>
          {#each STATUSES as s}<option value={s}>{s}</option>{/each}
        </select>
        <div class="d-flex flex-wrap align-items-center gap-2">
          <button class="btn btn-primary" type="button" on:click={() => apply(app.applicant_amka)}>Apply</button>
          <button class="btn btn-outline-danger" type="button" on:click={() => del(app.applicant_amka)}>Delete</button>
          {#if saveMessage[app.applicant_amka]}
            <span class="small text-body-secondary" role="status">{saveMessage[app.applicant_amka]}</span>
          {/if}
        </div>
      </div>
    </article>
  {/each}
{/if}
