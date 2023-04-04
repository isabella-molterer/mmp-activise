import {DateTransformer} from "../../src/config/date.transformer";
import {utc} from "moment";

describe('Date Transformer', () => {

    it('from function transforms string to ISOString', () => {
        const transformer = new DateTransformer();
        const date = '01 January 2020 20:20 UTC';
        expect(transformer.from(date)).toEqual(new Date(date).toISOString())
    });

    it('to function formats string', () => {
        const transformer = new DateTransformer();
        const date = '01 January 2020 20:20 UTC';
        expect(transformer.to(date)).toEqual(utc(new Date(date)).format('YYYY-MM-DD HH:mm:ss'));
    });
});
