<script>
  import { onMount } from 'svelte';
  import { api } from './lib/api.js';
  import Citizen from './lib/Citizen.svelte';
  import Officer from './lib/Officer.svelte';
  import Admin from './lib/Admin.svelte';

  let me = null;
  let error = null;

  onMount(async () => {

    try {
      me = await api('/me');
    } catch (e) {
      error = e?.message || 'Not signed in.';
    }
  });
</script>

<header class="container d-flex flex-wrap justify-content-between align-items-center gap-3 py-4 mb-4 border-bottom">
  <h1 class="h2 mb-0">Military Portal - Applications Office</h1>
  {#if me}
    <a href="/logout" class="btn btn-danger">Sign out</a>
  {/if}
</header>

<main class="container pb-5">
  {#if error}
    <div class="alert alert-danger" role="alert">
      Couldn't verify your session. <a class="alert-link" href="/">Try again</a>.
    </div>
  {:else if me}
    {#if me.role === 'citizen'}
      <Citizen />
    {:else if me.role === 'officer'}
      <Officer />
    {:else if me.role === 'admin'}
      <Admin />
    {:else}
      <div class="alert alert-warning" role="alert">
        Your account has no recognized role assigned. Contact an administrator.
      </div>
    {/if}
  {/if}
</main>
