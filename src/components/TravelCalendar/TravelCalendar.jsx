import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../contexts/ProfileContext';
import { useNotifications } from '../../contexts/NotificationContext';
import './TravelCalendar.css';

const TravelCalendar = () => {
  const { t } = useTranslation();
  const { profile, updateProfile } = useProfile();
  const { showError } = useNotifications();
  const [trips, setTrips] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newTrip, setNewTrip] = useState({
    destination: '',
    startDate: getCurrentDate(),
    endDate: '',
    notes: '',
    type: 'leisure'
  });

  useEffect(() => {
    const savedTrips = profile.trips || [];
    setTrips(savedTrips);
  }, [profile.trips]);
  const saveTrips = useCallback((updatedTrips) => {
    updateProfile({ trips: updatedTrips });
  }, [updateProfile]);

  const validateDates = () => {
    const currentDate = getCurrentDate();
    const startDate = newTrip.startDate;
    const endDate = newTrip.endDate;


    if (startDate && startDate < currentDate) {
      return { isValid: false, message: t('dateValidation.startDatePast') };
    }
    if (startDate && endDate && endDate < startDate) {
      return { isValid: false, message: t('dateValidation.endBeforeStart') };
    }

    return { isValid: true };
  };

  const addTrip = useCallback(() => {
    if (!newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
      return;
    }

    const validation = validateDates();
    if (!validation.isValid) {
      showError(validation.message);
      return;
    }

    const trip = {
      id: Date.now().toString(),
      ...newTrip,
      createdAt: new Date().toISOString(),
      status: 'planned' 
    };

    const updatedTrips = [...trips, trip];
    setTrips(updatedTrips);
    saveTrips(updatedTrips);
    
    setNewTrip({
      destination: '',
      startDate: getCurrentDate(),
      endDate: '',
      notes: '',
      type: 'leisure'
    });
    setShowAddForm(false);
  }, [newTrip, trips, saveTrips, t, showError]);

  const deleteTrip = useCallback((tripId) => {
    const updatedTrips = trips.filter(trip => trip.id !== tripId);
    setTrips(updatedTrips);
    saveTrips(updatedTrips);
  }, [trips, saveTrips]);

  const updateTripStatus = useCallback((tripId, status) => {
    const updatedTrips = trips.map(trip => 
      trip.id === tripId ? { ...trip, status } : trip
    );
    setTrips(updatedTrips);
    saveTrips(updatedTrips);
  }, [trips, saveTrips]);

  const getTripTypeLabel = (type) => {
    const types = {
      leisure: t('tripTypeLeisure'),
      business: t('tripTypeBusiness'),
      family: t('tripTypeFamily'),
      adventure: t('tripTypeAdventure')
    };
    return types[type] || type;
  };

  const getTripStatusLabel = (status) => {
    const statuses = {
      planned: t('tripStatusPlanned'),
      ongoing: t('tripStatusOngoing'),
      completed: t('tripStatusCompleted'),
      cancelled: t('tripStatusCancelled')
    };
    return statuses[status] || status;
  };


  const getStatusColor = (status) => {
    const colors = {
      planned: 'var(--accent-color)',
      ongoing: 'var(--success-color)',
      completed: 'var(--text-muted)',
      cancelled: 'var(--error-color)'
    };
    return colors[status] || 'var(--text-muted)';
  };

  const getTripTypeIcon = (type) => {
    const icons = {
      leisure: '🏖️',
      business: '💼',
      family: '👨‍👩‍👧‍👦',
      adventure: '🏔️'
    };
    return icons[type] || '✈️';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };


  const getDaysCount = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTripsByStatus = (status) => {
    return trips.filter(trip => trip.status === status);
  };

  const plannedTrips = getTripsByStatus('planned');
  const ongoingTrips = getTripsByStatus('ongoing');
  const completedTrips = getTripsByStatus('completed');

  return (
    <div className="travel-calendar">
      <div className="calendar-header">
        <h3>{t('travelCalendar')}</h3>
        <p className="calendar-subtitle">{t('calendarSubtitle')}</p>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-trip-btn"
        >
          {showAddForm ? t('cancel') : t('addTrip')}
        </button>
      </div>

      {showAddForm && (
        <div className="add-trip-form">
          <h4>{t('newTrip')}</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>{t('destination')}</label>
              <input
                type="text"
                value={newTrip.destination}
                onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                placeholder={t('enterDestination')}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{t('tripType')}</label>
              <select
                value={newTrip.type}
                onChange={(e) => setNewTrip({...newTrip, type: e.target.value})}
                className="form-select"
              >
                <option value="leisure">{t('tripTypeLeisure')}</option>
                <option value="business">{t('tripTypeBusiness')}</option>
                <option value="family">{t('tripTypeFamily')}</option>
                <option value="adventure">{t('tripTypeAdventure')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('startDate')}</label>
              <input
                type="date"
                value={newTrip.startDate}
                onChange={(e) => {
                  const startDate = e.target.value;
                  setNewTrip({
                    ...newTrip, 
                    startDate: startDate,
                    endDate: newTrip.endDate && newTrip.endDate < startDate ? '' : newTrip.endDate
                  });
                }}
                min={getCurrentDate()}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{t('endDate')}</label>
              <input
                type="date"
                value={newTrip.endDate}
                onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                min={newTrip.startDate || getCurrentDate()}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('notes')}</label>
            <textarea
              value={newTrip.notes}
              onChange={(e) => setNewTrip({...newTrip, notes: e.target.value})}
              placeholder={t('addNotes')}
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button onClick={addTrip} className="save-btn">
              {t('saveTrip')}
            </button>
            <button onClick={() => setShowAddForm(false)} className="cancel-btn">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="calendar-stats">
        <div className="stat-item">
          <span className="stat-number">{plannedTrips.length}</span>
          <span className="stat-label">{t('plannedTrips')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{ongoingTrips.length}</span>
          <span className="stat-label">{t('ongoingTrips')}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{completedTrips.length}</span>
          <span className="stat-label">{t('completedTrips')}</span>
        </div>
      </div>

      <div className="trips-container">
        {trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h4>{t('noTrips')}</h4>
            <p>{t('noTripsDescription')}</p>
            <button onClick={() => setShowAddForm(true)} className="add-first-trip-btn">
              {t('addFirstTrip')}
            </button>
          </div>
        ) : (
          <div className="trips-list">
            {trips.map(trip => (
              <div key={trip.id} className="trip-card">
                <div className="trip-header">
                  <div className="trip-type">
                    <span className="trip-icon">{getTripTypeIcon(trip.type)}</span>
                    <span className="trip-type-label">{getTripTypeLabel(trip.type)}</span>
                  </div>
                  <div className="trip-status" style={{ color: getStatusColor(trip.status) }}>
                    {getTripStatusLabel(trip.status)}
                  </div>
                </div>

                <div className="trip-content">
                  <h4 className="trip-destination">{trip.destination}</h4>
                  <div className="trip-dates">
                    <span>{formatDate(trip.startDate)}</span>
                    <span className="date-separator">→</span>
                    <span>{formatDate(trip.endDate)}</span>
                    <span className="trip-duration">
                      ({getDaysCount(trip.startDate, trip.endDate)} {t('days')})
                    </span>
                  </div>
                  {trip.notes && (
                    <p className="trip-notes">{trip.notes}</p>
                  )}
                </div>

                <div className="trip-actions">
                  <select
                    value={trip.status}
                    onChange={(e) => updateTripStatus(trip.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="planned">{t('tripStatusPlanned')}</option>
                    <option value="ongoing">{t('tripStatusOngoing')}</option>
                    <option value="completed">{t('tripStatusCompleted')}</option>
                    <option value="cancelled">{t('tripStatusCancelled')}</option>
                  </select>
                  <button 
                    onClick={() => deleteTrip(trip.id)}
                    className="delete-trip-btn"
                    title={t('deleteTrip')}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelCalendar; 