import { Link } from 'src/links/link.entity';
import { Address } from 'src/addresses/address.entity';

export class ProviderDto {
  readonly name: string;
  readonly email: string;
  readonly password?: string;
  readonly description: string;
  readonly contactPerson: string;
  readonly phoneNumber?: string;
  readonly price: number;
  readonly category: string;
  readonly type: string;
  readonly links?: Link[];
  readonly address: Address;
}
