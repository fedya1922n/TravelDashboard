import React from "react";
import './PlacesFilter.css';

const PLACE_TYPES = [
  { value: 'park', label: 'Парк' },
  { value: 'museum', label: 'Музей' },
  { value: 'theatre', label: 'Театр' },
  { value: 'gallery', label: 'Галерея' },
  { value: 'cafe', label: 'Кафе' },
  { value: 'restaurant', label: 'Ресторан' },
  { value: 'cinema', label: 'Кинотеатр' },
  { value: 'shopping', label: 'ТЦ' },
  { value: 'monument', label: 'Памятник' },
  { value: 'other', label: 'Другое' },
];

const SORT_OPTIONS = [
  { value: 'distance', label: 'По расстоянию' },
  { value: 'alphabet', label: 'По алфавиту' },
];

export default function PlacesFilter({
  selectedTypes = [],
  onChangeTypes,
  sortBy = 'distance',
  onChangeSort,
}) {
  return (
    <div className="places-filter">
      <div className="places-filter__types">
        {PLACE_TYPES.map(type => (
          <label key={type.value} className="places-filter__checkbox-label">
            <input
              type="checkbox"
              value={type.value}
              checked={selectedTypes.includes(type.value)}
              onChange={e => {
                if (e.target.checked) {
                  onChangeTypes([...selectedTypes, type.value]);
                } else {
                  onChangeTypes(selectedTypes.filter(t => t !== type.value));
                }
              }}
            />
            <span>{type.label}</span>
          </label>
        ))}
      </div>
      <div className="places-filter__sort">
        <label>
          Сортировка:
          <select
            value={sortBy}
            onChange={e => onChangeSort(e.target.value)}
            className="places-filter__select"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
} 