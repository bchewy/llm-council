import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ModelIcon } from '@lobehub/icons';
import { formatDuration } from '../utils/formatDuration';
import './Stage2.css';

function deAnonymizeText(text, labelToModel) {
  if (!labelToModel) return text;

  let result = text;
  Object.entries(labelToModel).forEach(([label, model]) => {
    const modelShortName = model.split('/')[1] || model;
    result = result.replace(new RegExp(label, 'g'), `**${modelShortName}**`);
  });
  return result;
}

export default function Stage2({ rankings, labelToModel, aggregateRankings }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!rankings || rankings.length === 0) {
    return null;
  }

  return (
    <div className="stage stage2">
      <h3 className="stage-title">
        <span className="stage-badge">2</span>
        Peer Rankings
      </h3>

      <h4>Raw Evaluations</h4>
      <p className="stage-description">
        Each model evaluated all responses anonymously (Response A, B, C, etc.) and provided rankings.
        Model names in <strong>bold</strong> are de-anonymized for readability.
      </p>

      <div className="tabs">
        {rankings.map((rank, index) => {
          const shortName = rank.model.split('/')[1] || rank.model;
          return (
            <button
              key={index}
              className={`tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              <ModelIcon model={shortName} size={16} />
              {shortName}
              {rank.duration_ms != null && (
                <span className="tab-duration">{formatDuration(rank.duration_ms)}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        <div className="ranking-model">
          <ModelIcon
            model={rankings[activeTab].model.split('/')[1] || rankings[activeTab].model}
            size={20}
            type="avatar"
          />
          {rankings[activeTab].model}
          {rankings[activeTab].duration_ms != null && (
            <span className="model-duration">{formatDuration(rankings[activeTab].duration_ms)}</span>
          )}
        </div>
        <div className="ranking-content markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {deAnonymizeText(rankings[activeTab].ranking, labelToModel)}
          </ReactMarkdown>
        </div>

        {rankings[activeTab].parsed_ranking &&
         rankings[activeTab].parsed_ranking.length > 0 && (
          <div className="parsed-ranking">
            <strong>Extracted Ranking</strong>
            <ol>
              {rankings[activeTab].parsed_ranking.map((label, i) => (
                <li key={i}>
                  {labelToModel && labelToModel[label]
                    ? labelToModel[label].split('/')[1] || labelToModel[label]
                    : label}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {aggregateRankings && aggregateRankings.length > 0 && (
        <div className="aggregate-rankings">
          <h4>Aggregate Rankings</h4>
          <p className="stage-description">
            Combined peer evaluation scores — lower average is better.
          </p>
          <div className="aggregate-list">
            {aggregateRankings.map((agg, index) => {
              const shortName = agg.model.split('/')[1] || agg.model;
              return (
                <div key={index} className="aggregate-item">
                  <span className="rank-position">#{index + 1}</span>
                  <span className="rank-model">
                    <ModelIcon model={shortName} size={18} type="avatar" />
                    {shortName}
                  </span>
                  <span className="rank-score">
                    Avg: {agg.average_rank.toFixed(2)}
                  </span>
                  <span className="rank-count">
                    {agg.rankings_count} votes
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
