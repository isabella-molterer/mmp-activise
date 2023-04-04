import { Factory, Seeder, times } from 'typeorm-seeding';
import { Connection, getRepository } from 'typeorm';
import { Link } from '../../links/link.entity';
import { Provider } from '../../providers/provider.entity';
import { Address } from '../../addresses/address.entity';
import { Course } from '../../courses/course.entity';
import { CourseDate } from '../../course-dates/course-date.entity';
import { Member } from '../../members/member.entity';

export default class CreateEntities implements Seeder {
  public async run(factory: Factory, connection: Connection) {
    const em = connection.createEntityManager();

    await times(10, async () => {
      const provider = em.create(Provider, await factory(Provider)().make());
      await em.save(provider);

      const address = em.create(Address, await factory(Address)().make());
      address.provider = provider;
      await em.save(address);

      const course = em.create(Course, await factory(Course)().make());
      course.provider = provider;
      await em.save(course);

      await times(5, async () => {
        const date = em.create(CourseDate, await factory(CourseDate)().make());
        date.course = course;
        await em.save(date);
      });

      await times(2, async () => {
        const link = em.create(Link, await factory(Link)().make());
        link.provider = provider;
        await em.save(link);
      });
    });

    await times(10, async () => {
      em.save(em.create(Member, await factory(Member)().make()));
      em.save(em.create(Link, await factory(Link)().make()));
    });

    const providers = await getRepository(Provider)
      .createQueryBuilder('provider')
      .orderBy('RAND()')
      .limit(3)
      .getMany();

    const courses = await getRepository(Course)
      .createQueryBuilder('course')
      .orderBy('RAND()')
      .limit(3)
      .getMany();

    const testProvider = em.create(Provider, await factory(Provider)().make());
    testProvider.email = 'provider@testing.com';
    testProvider.password = 'geheim!';
    await em.save(testProvider);

    const address = em.create(Address, await factory(Address)().make());
    address.provider = testProvider;
    await em.save(address);

    const course = em.create(Course, await factory(Course)().make());
    course.provider = testProvider;
    await em.save(course);

    await times(5, async () => {
      const date = em.create(CourseDate, await factory(CourseDate)().make());
      date.course = course;
      await em.save(date);
    });

    await times(2, async () => {
      const link = em.create(Link, await factory(Link)().make());
      link.provider = testProvider;
      await em.save(link);
    });

    providers.push(testProvider);
    courses.push(course);

    const testMember = em.create(Member, await factory(Member)().make());
    testMember.email = 'member@testing.com';
    testMember.password = 'geheim!';
    testMember.firstName = 'Max';
    testMember.lastName = 'Mustermann';
    testMember.providers = providers;
    testMember.courses = courses;
    testMember.birthday = null;
    await em.save(testMember);
  }
}
