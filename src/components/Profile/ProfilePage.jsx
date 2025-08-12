import { useState } from 'react';
import { useProfile } from '../../contexts/ProfileContext';
import { useAchievements } from '../../contexts/AchievementContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHeart, FaMapMarkerAlt, FaStar, FaTrophy, FaChartBar, FaCog, FaTrash, FaArrowLeft, FaCalendar, FaMoneyBillWave } from 'react-icons/fa';
import TravelCalendar from '../TravelCalendar/TravelCalendar';
import CurrencyConverter from '../CurrencyConverter/CurrencyConverter';
import './ProfilePage.css';

const ProfilePage = () => {
  const { profile, getProfileStats, resetProfile, changeUsername, removeFavoriteCity, removeFavoriteAttraction } = useProfile();
  const { getAchievementProgress, totalPoints, achievements, ACHIEVEMENTS } = useAchievements();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(profile.username);



  const stats = getProfileStats();
  const achievementProgress = getAchievementProgress();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const handleResetProfile = () => {
    if (window.confirm(t('profile.resetConfirm'))) {
      resetProfile();
    }
  };

  const handleChangeUsername = () => {
    if (newUsername.trim() && newUsername.trim() !== profile.username) {
      changeUsername(newUsername.trim());
      setIsChangingUsername(false);
    }
  };

  const renderOverview = () => (
    <div className="profile-overview">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser />
        </div>
        <div className="profile-info">
          {isChangingUsername ? (
            <div className="username-edit">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChangeUsername()}
                className="username-input"
                autoFocus
              />
              <button onClick={handleChangeUsername} className="username-save-btn">
                ✓
              </button>
              <button onClick={() => {
                setIsChangingUsername(false);
                setNewUsername(profile.username);
              }} className="username-cancel-btn">
                ✕
              </button>
            </div>
          ) : (
            <div className="username-display">
              <h2>{profile.username}</h2>
              <button 
                onClick={() => setIsChangingUsername(true)}
                className="username-edit-btn"
                title={t('profile.changeUsername')}
              >
                ✏️
              </button>
            </div>
          )}
          <p>{t('profile.memberSince')}: {formatDate(profile.createdAt)}</p>
          <p>{t('profile.lastActive')}: {formatTime(profile.lastActive)}</p>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card">
          <FaMapMarkerAlt className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.totalVisitedCities}</h3>
            <p>{t('profile.citiesVisited')}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaHeart className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.totalFavoriteCities}</h3>
            <p>{t('profile.favoriteCities')}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaStar className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.totalFavoriteAttractions}</h3>
            <p>{t('profile.favoriteAttractions')}</p>
          </div>
        </div>

        <div className="stat-card">
          <FaTrophy className="stat-icon" />
          <div className="stat-content">
            <h3>{totalPoints}</h3>
            <p>{t('profile.totalPoints')}</p>
          </div>
        </div>
      </div>

      <div className="profile-achievements">
        <h3>{t('profile.achievements')}</h3>
        <div className="achievement-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${achievementProgress}%` }}
            ></div>
          </div>
          <p>{achievementProgress}% {t('profile.completed')}</p>
        </div>
        <div className="achievements-list">
          {ACHIEVEMENTS ? Object.values(ACHIEVEMENTS).map(achievement => {
            const isUnlocked = achievements[achievement.id]?.unlocked;
            return (
              <div key={achievement.id} className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <span className="achievement-icon">{achievement.icon}</span>
                <div className="achievement-info">
                  <h4>{t(achievement.title)}</h4>
                  <p>{t(achievement.description)}</p>
                  <span className="achievement-points">
                    {isUnlocked ? `+${achievement.points} ${t('points')}` : `${achievement.points} ${t('points')}`}
                  </span>
                  {isUnlocked && (
                    <small className="achievement-date">
                      {t('profile.completed')}: {formatDate(achievements[achievement.id].unlockedAt)}
                    </small>
                  )}
                </div>
              </div>
            );
          }) : (
            <p>Загрузка достижений...</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="profile-favorites">
      <div className="favorites-section">
        <h3>{t('profile.favoriteCities')}</h3>
        {profile.favoriteCities.length > 0 ? (
          <div className="favorites-grid">
            {profile.favoriteCities.map(city => (
              <div key={city.name} className="favorite-item">
                <div className="favorite-info">
                  <h4>{city.name}</h4>
                  <p>{city.country}</p>
                  <small>{t('profile.added')}: {formatDate(city.addedAt)}</small>
                </div>
                <div className="favorite-actions">
                  <button 
                    onClick={() => navigate('/', { state: { selectedCity: city.name } })}
                    className="visit-city-btn"
                    title={t('profile.visitCity')}
                  >
                    🗺️ {t('profile.visitCity')}
                  </button>
                  <button 
                    onClick={() => removeFavoriteCity(city.name)}
                    className="remove-favorite-btn"
                    title={t('profile.removeFromFavorites')}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">{t('profile.noFavoriteCities')}</p>
        )}
      </div>

      <div className="favorites-section">
        <h3>{t('profile.favoriteAttractions')}</h3>
        {profile.favoriteAttractions.length > 0 ? (
          <div className="favorites-grid">
            {profile.favoriteAttractions.map(attraction => (
              <div key={attraction.id} className="favorite-item">
                <div className="favorite-info">
                  <h4>{attraction.name}</h4>
                  <p>{attraction.city}</p>
                  <small>{t('profile.added')}: {formatDate(attraction.addedAt)}</small>
                </div>
                <div className="favorite-actions">
                  <button 
                    onClick={() => navigate('/', { state: { selectedCity: attraction.city } })}
                    className="visit-city-btn"
                    title={t('profile.visitCity')}
                  >
                    🗺️ {t('profile.visitCity')}
                  </button>
                  <button 
                    onClick={() => removeFavoriteAttraction(attraction.id)}
                    className="remove-favorite-btn"
                    title={t('profile.removeFromFavorites')}
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">{t('profile.noFavoriteAttractions')}</p>
        )}
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="profile-statistics">
      <div className="stats-section">
        <h3>{t('profile.usageStatistics')}</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">{t('profile.citiesVisited')}</span>
            <span className="stat-value">{profile.statistics.citiesVisited}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('profile.attractionsViewed')}</span>
            <span className="stat-value">{profile.statistics.attractionsViewed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('profile.recommendationsViewed')}</span>
            <span className="stat-value">{profile.statistics.recommendationsViewed}</span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>{t('profile.visitedCities')}</h3>
        {profile.visitedCities.length > 0 ? (
          <div className="visited-cities">
            {profile.visitedCities.map(city => (
              <div key={city.name} className="visited-city">
                <div className="city-info">
                  <h4>{city.name}</h4>
                  <p>{city.country}</p>
                </div>
                <div className="city-stats">
                  <span className="visit-count">{city.visitCount} {t('profile.visits')}</span>
                  <small>{t('profile.lastVisited')}: {formatDate(city.lastVisited)}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">{t('profile.noVisitedCities')}</p>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="profile-settings">
      <div className="settings-section">
        <h3>{t('profile.accountSettings')}</h3>
        <div className="setting-item">
          <label>{t('profile.username')}</label>
          <input 
            type="text" 
            value={profile.username} 
            onChange={(e) => profile.updateProfile({ username: e.target.value })}
            placeholder={t('profile.enterUsername')}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>{t('profile.dangerZone')}</h3>
        <div className="danger-zone">
          <p>{t('profile.resetWarning')}</p>
          <button 
            className="reset-button" 
            onClick={handleResetProfile}
          >
            <FaTrash />
            {t('profile.resetProfile')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="profile-calendar">
      <TravelCalendar />
    </div>
  );

  const renderCurrencyConverter = () => (
    <div className="profile-currency-converter">
      <div className="converter-header">
        <h3>💰 {t('currencyConverter')}</h3>
        <p>{t('currencySubtitle')}</p>
      </div>
      <CurrencyConverter />
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-header-nav">
        <button 
          className="back-button" 
          onClick={() => navigate('/')}
          title={t('back')}
        >
          <FaArrowLeft />
          <span>{t('back')}</span>
        </button>
      </div>
      
      <div className="profile-container">
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaUser />
            {t('profile.overview')}
          </button>
          <button 
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <FaHeart />
            {t('profile.favorites')}
          </button>
          <button 
            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <FaCalendar />
            {t('travelCalendar')}
          </button>
          <button 
            className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <FaChartBar />
            {t('profile.statistics')}
          </button>
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog />
            {t('profile.settings')}
          </button>
          <button 
            className={`tab-button ${activeTab === 'currency' ? 'active' : ''}`}
            onClick={() => setActiveTab('currency')}
          >
            <FaMoneyBillWave />
            {t('currencyConverter')}
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'favorites' && renderFavorites()}
          {activeTab === 'calendar' && renderCalendar()}
          {activeTab === 'statistics' && renderStatistics()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'currency' && renderCurrencyConverter()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 