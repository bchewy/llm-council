import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ModelIcon } from '@lobehub/icons';
import { formatDuration } from '../utils/formatDuration';
import './Stage1.css';

export default function Stage1({ responses, loading, total }) {
  const [activeTab, setActiveTab] = useState(0);

  if ((!responses || responses.length === 0) && !loading) {
    return null;
  }

  const count = responses ? responses.length : 0;
  const progressText = loading && total > 0 ? ` (${count}/${total} models)` : '';

  return (
    <div className="stage stage1">
      <h3 className="stage-title">
        <span className="stage-badge">1</span>
        Individual Responses{progressText}
      </h3>

      {count > 0 && (
        <>
          <div className="tabs">
            {responses.map((resp, index) => {
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

          <div className="tab-content">
            <div className="model-name">
              <ModelIcon
                model={responses[activeTab].model.split('/')[1] || responses[activeTab].model}
                size={20}
                type="avatar"
              />
              {responses[activeTab].model}
              {responses[activeTab].duration_ms != null && (
                <span className="model-duration">{formatDuration(responses[activeTab].duration_ms)}</span>
              )}
            </div>
            <div className="response-text markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{responses[activeTab].response}</ReactMarkdown>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
