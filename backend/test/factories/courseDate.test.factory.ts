export const createCourseDate = (
    {
        id = 1,
        from = new Date(2020, 1, 1),
        to = new Date(2020, 1, 2),
        street = 'Test Straße 01',
        zip = '1010',
        city = 'Salzburg',
        country = 'Austria',
        course = 1
    }) => {
    return {
        id, from, to, street, zip, city, country, course
    }
}
