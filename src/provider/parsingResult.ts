export default class ParsingResult {
    constructor(suggestions: string[]) {
        this.suggestions = suggestions;
    }

    public suggestions: string[];
}