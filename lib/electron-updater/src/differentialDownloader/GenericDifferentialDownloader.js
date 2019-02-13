import { DifferentialDownloader } from './DifferentialDownloader';

export class GenericDifferentialDownloader extends DifferentialDownloader {
  download(oldBlockMap, newBlockMap) {
    return this.doDownload(oldBlockMap, newBlockMap);
  }
}
