<script>
  import { onMount } from 'svelte';
  import { api, describeApplication, statusBadgeClass } from './api.js';

  let filter = 'pending';
  let apps = [];
  let loading = true;
  let loadError = null;
  let notes = {};

  async function load() {
    loading = true;
    loadError = null;
    try {
      apps = await api(`/officer/applications${filter === 'all' ? '' : '?status=' + filter}`);
    } catch (e) {
      loadError = e.message;
    }
    loading = false;
  }

  onMount(load);

  async function review(amka, decision) {
    try {
      await api(`/officer/applications/${amka}/review`, {
        method: 'PUT',
        body: JSON.stringify({ decision, note: notes[amka] || null }),
      });
      await load();
    } catch (e) {
      alert(e.message);
    }
  }
</script>

<h2 class="mb-3">Review queue</h2>
<div class="col-md-5 col-lg-4 mb-4">
  <label class="form-label" for="officer-filter">Filter by status</label>
  <select class="form-select" id="officer-filter" bind:value={filter} on:change={load}>
    <option value="pending">pending</option>
    <option value="approved">approved</option>
    <option value="rejected">rejected</option>
    <option value="all">all</option>
  </select>
</div>

{#if loading}
  <div class="alert alert-info" role="status">Loading...</div>
{:else if loadError}
  <div class="alert alert-danger" role="alert">{loadError}</div>
{:else if apps.length === 0}
  <div class="alert alert-secondary" role="status">Nothing in the {filter} queue.</div>
{:else}
  {#each apps as app (app.applicant_amka)}
    <article class="card shadow-sm mb-3">
      <header class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <strong>AMKA {app.applicant_amka} - {app.applicant_email}</strong>
        <span class="badge text-uppercase {statusBadgeClass(app.status)}">{app.status}</span>
      </header>
      <div class="card-body">
        <p class="card-text">{describeApplication(app)}</p>
        {#if app.status === 'pending'}
          <textarea class="form-control mb-3" aria-label="Review note" rows="2" placeholder="Optional note to the applicant..." bind:value={notes[app.applicant_amka]}></textarea>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-success" type="button" on:click={() => review(app.applicant_amka, 'approved')}>Approve</button>
            <button class="btn btn-outline-danger" type="button" on:click={() => review(app.applicant_amka, 'rejected')}>Reject</button>
          </div>
        {:else if app.review_note}
          <div class="alert alert-info mb-0"><strong>Note:</strong> {app.review_note}</div>
        {/if}
      </div>
    </article>
  {/each}
{/if}
