<script>
  import { onMount, tick } from "svelte";

  export let value = "";
  export let placeholder = "Tulis deskripsi dengan format Markdown...";
  export let height = "240px";
  export let textareaTestId = "markdown-editor-textarea";

  let editorContainer;
  let editorInstance;
  let editorReady = false;

  onMount(() => {
    let mounted = true;

    async function initializeEditor() {
      try {
        const [{ default: Editor }] = await Promise.all([
          import("@toast-ui/editor"),
          import("@toast-ui/editor/dist/toastui-editor.css"),
        ]);
        if (!mounted) return;

        editorReady = true;
        await tick();
        if (!mounted) return;

        editorInstance = new Editor({
          el: editorContainer,
          height: height,
          initialEditType: "markdown",
          previewStyle: "tab",
          initialValue: value || "",
          placeholder: placeholder,
          usageStatistics: false,
          hideModeSwitch: false,
          events: {
            change: () => {
              value = editorInstance.getMarkdown();
            },
          },
        });
      } catch (error) {
        editorReady = false;
        console.error("Failed to load the Markdown editor", error);
      }
    }

    initializeEditor();

    return () => {
      mounted = false;
      if (editorInstance) {
        editorInstance.destroy();
        editorInstance = null;
      }
    };
  });

  $: if (editorInstance && value !== editorInstance.getMarkdown()) {
    editorInstance.setMarkdown(value || "");
  }

  function onTextareaInput(e) {
    value = e.target.value;
    if (editorInstance) {
      editorInstance.setMarkdown(e.target.value);
    }
  }
</script>

<div class="toastui-editor-wrapper">
  <textarea
    data-testid={textareaTestId}
    {value}
    {placeholder}
    on:input={onTextareaInput}
    class:hidden={editorReady}
    class="w-full flex-1 min-h-[240px] resize-y rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
    aria-label="Deskripsi Markdown"
  ></textarea>
  <div
    bind:this={editorContainer}
    data-testid="markdown-editor-container"
    class:hidden={!editorReady}
  ></div>
</div>

<style>
  .toastui-editor-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }
  .toastui-editor-wrapper > div[data-testid="markdown-editor-container"] {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .toastui-editor-wrapper > textarea {
    height: 100%;
  }
  :global(.toastui-editor-wrapper .toastui-editor-defaultUI) {
    display: flex;
    flex-direction: column;
    height: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    overflow: hidden;
    font-family: inherit;
  }
  :global(.toastui-editor-wrapper .toastui-editor-main) {
    flex: 1;
    min-height: 0;
  }
  :global(.toastui-editor-wrapper .toastui-editor-toolbar) {
    background-color: #f8fafc;
    border-bottom: 1px solid #f1f5f9;
  }
  :global(.toastui-editor-wrapper .toastui-editor-contents) {
    font-family: inherit;
    font-size: 0.875rem;
  }
</style>
