import { ValueTransformer } from 'typeorm';

export class NumericTransformer implements ValueTransformer {
  from(data: string): number {
    return parseFloat(data);
  }
  to(data: number): number {
    return data;
  }
}
