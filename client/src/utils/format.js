  // Format date 
  const formatDate = (dateString) => {
    if (!dateString) return { date: 'Unknown Date', time: '' };
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return { date: 'Unknown Date', time: '' };

      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      let dateLabel = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      if (isToday) dateLabel = 'Today';
      else if (isYesterday) dateLabel = 'Yesterday';

      const timeLabel = d.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return { date: dateLabel, time: timeLabel, fullDate: d.toLocaleDateString() };
    } catch {
      return { date: 'Unknown Date', time: '' };
    }
  };

  export { formatDate };