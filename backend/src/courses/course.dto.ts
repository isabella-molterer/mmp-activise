export class CourseDto {
  readonly name: string;
  readonly instructor?: string;
  readonly phoneNumber?: string;
  readonly email: string;
  readonly description: string;
  readonly price: number;
  readonly category: string;
  readonly difficulty?: string;
  readonly equipment?: string;
  readonly requirements?: string;
  readonly trialDay: boolean;
  readonly isPrivate: boolean;
  readonly isPublished: boolean;
  readonly provider: number;
  readonly members?: number[];
}
