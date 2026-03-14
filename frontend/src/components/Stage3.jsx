import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ModelIcon } from '@lobehub/icons';
import { formatDuration } from '../utils/formatDuration';
import './Stage3.css';

export default function Stage3({ responses, loading, total }) {
  const [activeTab, setActiveTab] = useState(0);

  // Normalize: handle both old format (single dict) and new format (array)
  const items = Array.isArray(responses) ? responses : (responses ? [responses] : []);

  if (items.length === 0 && !loading) {
    return null;
  }

  const count = items.length;
  const progressText = loading && total > 0 ? ` (${count}/${total} chairmen)` : '';

  return (
    <div className="stage stage3">
      <h3 className="stage-title">
        <span className="stage-badge">3</span>
        Final Council Answer{progressText}
      </h3>

      {count > 0 && (
        <>
          {count > 1 && (
            <div className="tabs stage3-tabs">
              {items.map((resp, index) => {
                const shortName = resp.model.split('/')[1] || resp.model;
                return (
                  <button
                    key={resp.model}
                    className={`tab ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    <ModelIcon model={shortName} size={16} />
                    {shortName}
                    {resp.duration_ms != null && (
                      <span className="tab-duration">{formatDuration(resp.duration_ms)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="final-response">
            <div className="chairman-label">
              <ModelIcon
                model={items[activeTab].model.split('/')[1] || items[activeTab].model}
                size={20}
                type="avatar"
              />
              Chairman: {items[activeTab].model.split('/')[1] || items[activeTab].model}
              {items[activeTab].duration_ms != null && (
                <span className="chairman-duration">{formatDuration(items[activeTab].duration_ms)}</span>
              )}
            </div>
            <div className="final-text markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{items[activeTab].response}</ReactMarkdown>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
