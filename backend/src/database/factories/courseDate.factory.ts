import { define } from 'typeorm-seeding';
import { Faker } from 'faker';
import { CourseDate } from '../../course-dates/course-date.entity';

// @ts-ignore
define(CourseDate, async (faker: typeof Faker) => {
  const from = faker.date.between('2020-01-01', '2020-06-06');
  const to = faker.date.between('2020-01-01', '2020-06-06');
  const street = faker.address.streetName();
  const zip = faker.address.zipCode();
  const city = faker.address.city();
  const country = faker.address.county();

  to.setMonth(from.getMonth());
  to.setDate(from.getDate());
  to.setHours(from.getHours() + 2);

  const date = new CourseDate(from.toISOString(), to.toISOString());
  date.street = street;
  date.zip = zip;
  date.city = city;
  date.country = country;

  return date;
});
