import { Member } from '../../members/member.entity';
import { define } from 'typeorm-seeding';
import { Faker } from 'faker';
import { getRepository } from 'typeorm';
import { Provider } from '../../providers/provider.entity';
import { Course } from '../../courses/course.entity';

// @ts-ignore
define(Member, async (faker: typeof Faker) => {
  const gender = faker.random.number(1);
  const firstName = faker.name.firstName(gender);
  const lastName = faker.name.lastName(gender);
  const email = faker.internet.email(firstName, lastName);
  const password = faker.internet.password();

  const provider = await getRepository(Provider)
    .createQueryBuilder('provider')
    .orderBy('RAND()')
    .limit(2)
    .getMany();

  const course = await getRepository(Course)
    .createQueryBuilder('course')
    .orderBy('RAND()')
    .limit(2)
    .getMany();

  const member = new Member();
  member.firstName = firstName;
  member.lastName = lastName;
  member.email = email;
  member.password = password;
  member.providers = provider;
  member.courses = course;
  member.birthday = null;

  return member;
});
