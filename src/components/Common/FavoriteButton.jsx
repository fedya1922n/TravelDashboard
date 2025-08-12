import { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './FavoriteButton.css';

const FavoriteButton = ({ 
  item, 
  onAdd, 
  onRemove, 
  isFavorite = false, 
  type = 'attraction',
  className = ''
}) => {
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = useState(isFavorite);

  const handleToggle = () => {
    if (isFavorited) {
      onRemove(item.id || item.name);
      setIsFavorited(false);
    } else {
      onAdd(item);
      setIsFavorited(true);
    }
  };

  return (
    <button
      className={`favorite-button ${isFavorited ? 'favorited' : ''} ${className}`}
      onClick={handleToggle}
      title={isFavorited ? t('profile.removeFromFavorites') : t('profile.addToFavorites')}
      aria-label={isFavorited ? t('profile.removeFromFavorites') : t('profile.addToFavorites')}
    >
      {isFavorited ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton; 