import { newError } from './util-runtime';
import { GenericProvider } from './providers/GenericProvider';

export function isUrlProbablySupportMultiRangeRequests(url) {
  return !url.includes('s3.amazonaws.com');
}

export function createClient(data, updater, runtimeOptions) {
  if (typeof data === 'string') {
    throw newError('Please pass PublishConfiguration object', 'ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION');
  }

  const provider = data.provider;

  switch (provider) {
    case 'generic':
      return new GenericProvider(data, updater, {
        ...runtimeOptions,
        isUseMultipleRangeRequest : data.useMultipleRangeRequest !== false 
        && isUrlProbablySupportMultiRangeRequests(data.url),
      });
    case 'github':
    case 's3':
    case 'spaces':
    case 'bintray':
    default:
      throw newError(`Unsupported provider: ${provider}`, 'ERR_UPDATER_UNSUPPORTED_PROVIDER');
  }
}
