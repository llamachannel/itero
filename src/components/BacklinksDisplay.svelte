<script lang="ts">
  export let backlinks: BacklinksInfo;

  import RenderedEntry from "./RenderedEntry.svelte";
  import type { BacklinksInfo } from "../backlinks";

  $: existsBacklinks = Object.keys(backlinks).length;
</script>

<style>
  #doc-references {
    margin-top: 1em;
  }

  .backlinks-page-display {
    background-color: #f9f9f9;
  }

  h2 {
    font-size: 1em;
  }

  h3 {
    font-size: 1em;
    font-weight: normal;
  }
</style>

<div id="doc-references">
{#if existsBacklinks}
  <h2>References</h2>
  {#each Object.values(backlinks) as doc}
    <div class="backlinks-page-display">
      <h3><a href={`#/doc/${doc.id}`}>{doc.name}</a></h3>
      <ul>
      {#each Object.values(doc.entries) as entry}
        <li>
        <RenderedEntry
          entryId={entry.id}
          entryText={entry.text}
          entryHeadingSize={entry.headingSize}
          handleUpdateEntryLinks={() => { return }}
          />
        </li>
      {/each}
      </ul>
    </div>
  {/each}
{/if}
</div>