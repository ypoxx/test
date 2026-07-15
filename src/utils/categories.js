/**
 * Single source of truth for vocab categories
 * (used by the training filter and the category statistics).
 */
export const CATEGORIES = [
  { value: 'sport', label: 'Sport', emoji: '⚽' },
  { value: 'school', label: 'Schule', emoji: '📚' },
  { value: 'family', label: 'Familie', emoji: '👨‍👩‍👦' },
  { value: 'everyday', label: 'Alltag', emoji: '🏠' },
  { value: 'nature', label: 'Natur', emoji: '🌳' },
  { value: 'verbs', label: 'Unregelmäßige Verben', emoji: '🔤' },
  { value: 'body', label: 'Körper & Gesundheit', emoji: '🩺' },
  { value: 'media', label: 'Medien & Technik', emoji: '💻' }
]

export const getCategoryLabel = (value) =>
  CATEGORIES.find(c => c.value === value)?.label || value

export const getCategoryEmoji = (value) =>
  CATEGORIES.find(c => c.value === value)?.emoji || '📚'
