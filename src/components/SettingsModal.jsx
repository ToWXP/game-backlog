import { useRef, useState } from 'react';
import Modal from './Modal';

export default function SettingsModal({ apiKey, games, onSaveKey, onImport, onClose, notify }) {
  const [draft, setDraft] = useState(apiKey);
  const fileRef = useRef(null);

  function exportLibrary() {
    const blob = new Blob([JSON.stringify(games, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backlog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) throw new Error('not a list');
      onImport(data);
    } catch {
      notify("That file doesn't look like a backlog export.", 'error');
    }
  }

  function save(e) {
    e.preventDefault();
    onSaveKey(draft.trim());
    notify(draft.trim() ? 'API key saved' : 'API key cleared');
    onClose();
  }

  return (
    <Modal onClose={onClose} className="modal-sm">
      <form className="settings" onSubmit={save}>
        <h2>Settings</h2>

        <div className="field">
          <label htmlFor="rawg-key" className="field-label">
            RAWG API key
          </label>
          <input
            id="rawg-key"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste your key here"
            autoComplete="off"
            spellCheck={false}
          />
          <p className="hint">
            Covers, Metacritic scores and screenshots come from RAWG. Get a free key at{' '}
            <a href="https://rawg.io/apidocs" target="_blank" rel="noreferrer">
              rawg.io/apidocs
            </a>
            . It's stored only in this browser.
          </p>
          <div className="row">
            <button type="submit" className="btn btn-primary">
              Save key
            </button>
          </div>
        </div>

        <div className="field">
          <span className="field-label">Your library</span>
          <p className="hint">
            Your shelf is saved in this browser. Export a backup, or import one to move your shelf to another
            browser.
          </p>
          <div className="row">
            <button type="button" className="btn" onClick={exportLibrary} disabled={!games.length}>
              Export JSON
            </button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
              Import JSON
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importFile} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
