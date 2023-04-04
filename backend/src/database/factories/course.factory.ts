import { Course } from '../../courses/course.entity';
import { define } from 'typeorm-seeding';
import { Faker } from 'faker';
import { getRepository } from 'typeorm';
import { Provider } from '../../providers/provider.entity';

// @ts-ignore
define(Course, async (faker: typeof Faker) => {
  const number = faker.random.number(1);
  const name = faker.commerce.productName();
  const instructor = faker.name.firstName(number);
  const email = faker.internet.email(name, instructor);
  const description = faker.company.catchPhraseDescriptor();
  const options = { min: 0, max: 10, precision: 0.01 };
  const price = faker.random.number(options);
  const phone = faker.phone.phoneNumber('0123 #######');
  const category = faker.company.catchPhraseNoun();
  const difficulty = faker.company.catchPhraseAdjective();
  const equipment = faker.company.catchPhraseNoun();
  const requirements = faker.company.catchPhraseAdjective();
  const trial = faker.random.boolean();
  const isPrivate = faker.random.boolean();
  const isPublished = faker.random.boolean();

  const provider = await getRepository(Provider)
    .createQueryBuilder('provider')
    .orderBy('RAND()')
    .limit(1)
    .getOne();

  const course = new Course();
  course.name = name;
  course.instructor = instructor;
  course.email = email;
  course.phoneNumber = phone;
  course.description = description;
  course.price = price;
  course.category = category;
  course.difficulty = difficulty;
  course.equipment = equipment;
  course.requirements = requirements;
  course.trialDay = trial;
  course.isPrivate = isPrivate;
  course.isPublished = isPublished;
  course.provider = provider;
  return course;
});
