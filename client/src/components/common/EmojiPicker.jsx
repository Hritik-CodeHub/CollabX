import { useMemo, useState } from 'react';
import { emojiCategories } from '../../constants/emoji.constant';

function EmojiPicker({ visible = true, onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Faces');

  const categoryEntries = useMemo(() => Object.entries(emojiCategories), []);

  if (!visible) return null;

  const selectedCategory =
    categoryEntries.find(([categoryName]) => categoryName === activeCategory) ?? categoryEntries[0];

  const emojis = selectedCategory?.[1] ?? [];

  return (
    <div className="mb-2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80 shadow-lg">
      <div className="flex flex-wrap gap-1 border-b border-slate-700 bg-slate-950/60 p-2">
        {categoryEntries.map(([categoryName]) => (
          <button
            key={categoryName}
            type="button"
            onClick={() => setActiveCategory(categoryName)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
              activeCategory === categoryName
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            aria-label={`View ${categoryName} emojis`}
          >
            {categoryName}
          </button>
        ))}
      </div>

      <div className="max-h-56 overflow-y-auto p-2">
        <div className="flex flex-wrap gap-2">
          {emojis.map((emoji) => (
            <button
              key={`${emoji}-${selectedCategory?.[0]}`}
              type="button"
              onClick={() => {
                onSelect?.(emoji);
                onClose?.();
              }}
              className="grid size-9 place-items-center rounded-xl bg-slate-800 text-lg transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Insert emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmojiPicker;