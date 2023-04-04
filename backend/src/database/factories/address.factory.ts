import { Address } from '../../addresses/address.entity';
import { define } from 'typeorm-seeding';
import { Faker } from 'faker';

// @ts-ignore
define(Address, async (faker: typeof Faker) => {
  const street = faker.address.streetName();
  const zip = faker.address.zipCode();
  const city = faker.address.city();
  const country = faker.address.county();

  const address = new Address();
  address.street = street;
  address.zip = zip;
  address.city = city;
  address.country = country;

  return address;
});
