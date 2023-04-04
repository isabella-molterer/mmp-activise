import { Link } from '../../links/link.entity';
import { define } from 'typeorm-seeding';
import { Faker } from 'faker';
import { getRepository } from 'typeorm';
import { Provider } from '../../providers/provider.entity';

// @ts-ignore
define(Link, async (faker: typeof Faker) => {
  const linkText = faker.internet.domainName();
  const url = faker.internet.url();

  const provider = await getRepository(Provider)
    .createQueryBuilder('provider')
    .orderBy('RAND()')
    .limit(1)
    .getOne();

  const link = new Link();
  link.linkText = linkText;
  link.url = url;
  link.provider = provider;
  return link;
});
