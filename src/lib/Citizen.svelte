<script>
  import { onMount } from 'svelte';
  import { api, describeApplication, statusBadgeClass } from './api.js';

  let application = null;
  let showForm = false;
  let loadError = null;

  let type = 'deferment';
  let reason = '';
  let division = '';
  let formError = '';

  async function load() {
    try {
      application = await api('/citizen/application');
      showForm = false;
    } catch (e) {
      if (e.status === 404) {
        showForm = true;
      } else {
        loadError = e.message;
      }
    }
  }

  onMount(load);

  async function submit() {
    formError = '';
    let payload;
    if (type === 'deferment') {
      if (!reason.trim()) { formError = 'A reason is required.'; return; }
      payload = { application_type: 'deferment', reason: reason.trim() };
    } else {
      if (!division) { formError = 'Please select a division.'; return; }
      payload = { application_type: 'service', division };
    }

    try {
      await api('/citizen/application', { method: 'POST', body: JSON.stringify(payload) });
      await load();
    } catch (e) {
      formError = e.message;
    }
  }
</script>

{#if loadError}
  <div class="alert alert-danger" role="alert">{loadError}</div>
{:else if application}
  <article class="card shadow-sm">
    <header class="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
      <strong>AMKA {application.applicant_amka}</strong>
      <span class="badge text-uppercase {statusBadgeClass(application.status)}">{application.status}</span>
    </header>
    <div class="card-body">
      <p class="card-text">{describeApplication(application)}</p>
      {#if application.review_note}
        <div class="alert alert-info"><strong>Officer's note:</strong> {application.review_note}</div>
      {/if}
      <p class="card-text mb-0 text-body-secondary">
        <small>Filed {new Date(application.created_at).toLocaleDateString()}. You will be notified via email once it has been reviewed.</small>
      </p>
    </div>
  </article>
{:else if showForm}
  <form class="card shadow-sm" on:submit|preventDefault={submit}>
    <div class="card-body">
      <h2 class="card-title">Submit your application</h2>
      <p class="card-text text-body-secondary">You cannot submit another application while one already exists.</p>
      <fieldset class="mb-3">
        <legend class="col-form-label pt-0">Application type</legend>
        <div class="form-check">
          <input class="form-check-input" id="application-service" type="radio" bind:group={type} value="service" />
          <label class="form-check-label" for="application-service">Willing to serve</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" id="application-deferment" type="radio" bind:group={type} value="deferment" />
          <label class="form-check-label" for="application-deferment">Request deferment</label>
        </div>
      </fieldset>
      {#if type === 'deferment'}
        <div class="mb-3">
          <label class="form-label" for="reason">Reason for deferment</label>
          <textarea class="form-control" id="reason" rows="4" bind:value={reason}></textarea>
        </div>
      {:else}
        <div class="mb-3">
          <label class="form-label" for="division">Division</label>
          <select class="form-select" id="division" bind:value={division}>
            <option value="">Select...</option>
            <option value="land">Land</option>
            <option value="navy">Navy</option>
            <option value="airforce">Air Force</option>
          </select>
        </div>
      {/if}
      <button class="btn btn-primary" type="submit">Submit application</button>
      {#if formError}<div class="alert alert-danger mt-3 mb-0" role="alert">{formError}</div>{/if}
    </div>
  </form>
{/if}
