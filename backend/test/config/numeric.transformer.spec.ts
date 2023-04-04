import {NumericTransformer} from "../../src/config/numeric.transformer";

describe('Numeric Transformer', () => {

    it('from function transforms string to float', () => {
        const transformer = new NumericTransformer();
        const number = '0.01';
        expect(transformer.from(number)).toEqual(parseFloat(number));
    });

    it('to function returns value', () => {
        const transformer = new NumericTransformer();
        const number = 10;
        expect(transformer.to(number)).toEqual(number);
    });
});
