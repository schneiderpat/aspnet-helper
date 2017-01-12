import ParsingResult from './parsingResult';

interface IParser {

    getParsingResult(string): ParsingResult;
    getSuggestions(string): string[];

}

export default IParser;