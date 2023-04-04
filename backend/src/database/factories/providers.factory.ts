import { Provider } from '../../providers/provider.entity';
import { define } from 'typeorm-seeding';
import { Faker } from 'faker';

define(Provider, (faker: typeof Faker) => {
  const number = faker.random.number(1);
  const name = faker.company.companyName(number);
  const contactPerson = faker.name.firstName(number);
  const email = faker.internet.email(name, contactPerson);
  const password = faker.internet.password();
  const description = faker.company.catchPhraseDescriptor();
  const options = { min: 0, max: 10, precision: 0.01 };
  const price = faker.random.number(options);
  const phone = faker.phone.phoneNumber('1234 #######');
  const category = faker.company.catchPhraseNoun();
  const needsApproval = faker.random.boolean();
  const isPublished = faker.random.boolean();

  const provider = new Provider({
    name: name,
    contactPerson: contactPerson,
    email: email,
    password: password,
    description: description,
    price: price,
    phoneNumber: phone,
    category: category,
    needsApproval: needsApproval,
    isPublished: isPublished,
  });
  return provider;
});
