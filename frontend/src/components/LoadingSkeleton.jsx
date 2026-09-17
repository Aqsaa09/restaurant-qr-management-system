import './LoadingSkeleton.css';

const LoadingSkeleton = () => {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-subtitle"></div>
      </div>
      <div className="skeleton-tabs">
        <div className="skeleton-tab"></div>
        <div className="skeleton-tab"></div>
      </div>
      <div className="skeleton-form">
        <div className="skeleton-input"></div>
        <div className="skeleton-input"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;