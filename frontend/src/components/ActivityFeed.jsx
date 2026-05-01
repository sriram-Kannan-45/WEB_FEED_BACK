/**
 * Activity Feed Component
 * Displays real-time activity feed with time grouping and filters
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useActivityFeed } from '../hooks/useRealTime';
import '../styles/ActivityFeed.css';

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (action) => {
    const icons = {
      TRAINING_CREATED: '🎓',
      TRAINING_UPDATED: '✏️',
      TRAINING_DELETED: '🗑️',
      NOTE_UPLOADED: '📄',
      USER_APPROVED: '✅',
      USER_REJECTED: '❌',
      ENROLLMENT_DONE: '📚',
      ENROLLMENT_CANCELLED: '⛔',
      FEEDBACK_SUBMITTED: '⭐',
      FEEDBACK_REPLIED: '💬',
      COMPLETION_MARKED: '🏆',
      ASSIGNMENT_SUBMITTED: '📤',
    };
    return icons[action] || '📌';
  };

  const getActivityColor = (action) => {
    if (action.includes('CREATED') || action.includes('APPROVED')) return 'success';
    if (action.includes('DELETED') || action.includes('REJECTED') || action.includes('CANCELLED'))
      return 'danger';
    if (action.includes('SUBMITTED') || action.includes('REPLIED')) return 'info';
    return 'primary';
  };

  return (
    <div className={`activity-item activity-${getActivityColor(activity.action).toLowerCase()}`}>
      <div className="activity-icon">{getActivityIcon(activity.action)}</div>
      <div className="activity-details">
        <p className="activity-message">{activity.message}</p>
        <div className="activity-meta">
          <span className="activity-user">
            <strong>{activity.userName}</strong>
          </span>
          <span className="activity-role">({activity.role})</span>
          <span className="activity-action">{activity.action}</span>
        </div>
      </div>
      <div className="activity-time">
        {new Date(activity.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
};

// Activity Feed Container
const ActivityFeed = () => {
  const {
    activities,
    groupedActivities,
    loading,
    error,
    hasMore,
    fetchActivityFeed,
    fetchGroupedActivityFeed,
  } = useActivityFeed();

  const [filters, setFilters] = useState({
    type: 'all', // all, my-activity, training
    limit: 20,
    offset: 0,
  });

  const [useGrouped, setUseGrouped] = useState(true);
  const feedEndRef = useRef(null);

  // Fetch activities with current filters
  const handleFilterChange = useCallback(
    (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters, offset: 0 };
      setFilters(updatedFilters);

      if (useGrouped) {
        const filterParams = {};
        if (newFilters.type && newFilters.type !== 'all') {
          filterParams.type = newFilters.type;
        }
        fetchGroupedActivityFeed(filterParams);
      } else {
        fetchActivityFeed(updatedFilters.limit, 0, newFilters);
      }
    },
    [filters, useGrouped, fetchActivityFeed, fetchGroupedActivityFeed]
  );

  // Load more activities (infinite scroll)
  const handleLoadMore = useCallback(() => {
    const newOffset = filters.offset + filters.limit;
    setFilters((prev) => ({ ...prev, offset: newOffset }));
    fetchActivityFeed(filters.limit, newOffset, filters);
  }, [filters, fetchActivityFeed]);

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (feedEndRef.current) {
      observer.observe(feedEndRef.current);
    }

    return () => {
      if (feedEndRef.current) {
        observer.unobserve(feedEndRef.current);
      }
    };
  }, [hasMore, loading, handleLoadMore]);

  // Initial fetch
  useEffect(() => {
    if (useGrouped) {
      fetchGroupedActivityFeed();
    } else {
      fetchActivityFeed(filters.limit, 0);
    }
  }, [useGrouped]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderGrouped = () => {
    return (
      <div className="activity-grouped">
        {groupedActivities.today && groupedActivities.today.length > 0 && (
          <div className="activity-group">
            <h3 className="group-title">Today</h3>
            {groupedActivities.today.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {groupedActivities.yesterday && groupedActivities.yesterday.length > 0 && (
          <div className="activity-group">
            <h3 className="group-title">Yesterday</h3>
            {groupedActivities.yesterday.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {groupedActivities.thisWeek && groupedActivities.thisWeek.length > 0 && (
          <div className="activity-group">
            <h3 className="group-title">This Week</h3>
            {groupedActivities.thisWeek.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}

        {groupedActivities.older && groupedActivities.older.length > 0 && (
          <div className="activity-group">
            <h3 className="group-title">Older</h3>
            {groupedActivities.older.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="activity-feed-container">
      <div className="activity-header">
        <h2>Activity Feed</h2>
        <div className="activity-controls">
          <button
            className={`view-toggle ${useGrouped ? 'active' : ''}`}
            onClick={() => setUseGrouped(true)}
            title="Grouped view"
          >
            📅
          </button>
          <button
            className={`view-toggle ${!useGrouped ? 'active' : ''}`}
            onClick={() => setUseGrouped(false)}
            title="Timeline view"
          >
            📋
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="activity-filters">
        <button
          className={`filter-btn ${filters.type === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange({ type: 'all' })}
        >
          All Activities
        </button>
        <button
          className={`filter-btn ${filters.type === 'my-activity' ? 'active' : ''}`}
          onClick={() => handleFilterChange({ type: 'my-activity' })}
        >
          My Activity
        </button>
        <button
          className={`filter-btn ${filters.type === 'training' ? 'active' : ''}`}
          onClick={() => handleFilterChange({ type: 'training' })}
        >
          Training
        </button>
      </div>

      {/* Error State */}
      {error && <div className="activity-error">⚠️ {error}</div>}

      {/* Empty State */}
      {activities.length === 0 && !loading && (
        <div className="activity-empty">
          <p>No activities yet</p>
        </div>
      )}

      {/* Feed Content */}
      <div className="activity-content">
        {useGrouped ? renderGrouped() : activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Loading State */}
      {loading && <div className="activity-loading">Loading activities...</div>}

      {/* Infinite Scroll Sentinel */}
      <div ref={feedEndRef} className="activity-sentinel">
        {hasMore && !loading && <p>Scroll for more...</p>}
      </div>
    </div>
  );
};

export default ActivityFeed;
