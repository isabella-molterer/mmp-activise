import { ValueTransformer } from 'typeorm';
import { utc } from 'moment';

export class DateTransformer implements ValueTransformer {
  from(value: string): string {
    return new Date(value).toISOString();
  }
  to(value: string): string {
    return utc(new Date(value)).format('YYYY-MM-DD HH:mm:ss');
  }
}
