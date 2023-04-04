import { AuthModule } from '../auth/auth.module';
import { AppModule } from '../app.module';
import { Routes } from 'nest-router';
import { MembersModule } from '../members/members.module';
import { CourseDatesModule } from '../course-dates/course-dates.module';
import { CoursesModule } from '../courses/courses.module';
import { LinksModule } from '../links/links.module';
import { ProvidersModule } from '../providers/providers.module';
import { AddressesModule } from '../addresses/addresses.module';

export const routes: Routes = [
  {
    path: '/auth',
    module: AuthModule,
  },
  {
    path: '/api',
    module: AppModule,
    children: [
      { path: '/addresses', module: AddressesModule },
      { path: '/course-dates', module: CourseDatesModule },
      { path: '/courses', module: CoursesModule },
      { path: '/links', module: LinksModule },
      { path: '/members', module: MembersModule },
      { path: '/providers', module: ProvidersModule },
    ],
  },
];
