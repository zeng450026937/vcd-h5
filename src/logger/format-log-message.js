import { formatError } from './format-error';

export function formatLogMessage(message, error) {
  return error ? formatError(error, message) : message;
}
