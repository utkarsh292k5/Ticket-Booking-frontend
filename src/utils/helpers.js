export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const generateIdempotencyKey = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getSeatLabel = (rowLabel, seatNumber) => {
  return `${rowLabel}${seatNumber}`;
};

export const groupSeatsByRow = (seats) => {
  const grouped = {};
  seats.forEach(seat => {
    if (!grouped[seat.rowLabel]) {
      grouped[seat.rowLabel] = [];
    }
    grouped[seat.rowLabel].push(seat);
  });

  // Sort seats within each row
  Object.keys(grouped).forEach(row => {
    grouped[row].sort((a, b) => a.seatNumber - b.seatNumber);
  });

  return grouped;
};