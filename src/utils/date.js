// utils/dateFormatter.js
import { format, parseISO } from 'date-fns';

const DEFAULT_FORMAT = 'MMM dd, yyyy';

const parseDate = (date) => {
  return typeof date === 'string' ? parseISO(date) : date;
};

export const formatDate = (dateString, formatString = DEFAULT_FORMAT) => {
  try {
    const date = parseDate(dateString);
    return format(date, formatString);
  } catch {
    return dateString;
  }
};


export const formatDateTime = (dateString) => 
  formatDate(dateString, 'MMM dd, yyyy • h:mm a');

export const formatTime = (dateString) => 
  formatDate(dateString, 'h:mm a');