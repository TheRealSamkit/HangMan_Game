const apiKey = 'MsdGU/2fCdNC+r6rIExaHQ==NLsJaoXtMqa2dmXm';
const wordNikapikey = 'api_key=69wp35r1f05w1jj3qrefvfip1a1as4ctvkx6i2njeb93mfs5z';
const base_url = `https://api.wordnik.com/v4/word.json/`;
const parameters = `relatedWords?relationshipTypes=synonym&limitPerRelationshipType=2`;

const fetchRandomWord = async () => {
    try {
        const response = await fetch('https://api.api-ninjas.com/v1/randomword', {
            headers: { 'X-Api-Key': apiKey }
        });
        const { word: [randomWord] } = await response.json();
        return randomWord;
    } catch (error) {
        throw error;
    }
};

const fetchWikipediaHint = async (word) => {
    try {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`);
        const data = await response.json();
        return data.extract || `No hint found on Wikipedia for: ${word}`;
    } catch (error) {
        return `No hint found for: ${word}`;
    }
};

const fetchWordnikHint = async (word) => {
    try {
        const definitionResponse = await fetch(`${base_url}${encodeURIComponent(word)}/definitions?limit=2&${wordNikapikey}`);
        const definitionData = await definitionResponse.json();
        const definition = definitionData.length > 0
            ? definitionData.map(def => def.text).join(' ')
            : '';

        const finalSynonyms = await fetchSynonyms(word);
        let finalDefinition = (definition === '' || definition === undefined || definition.length < 5) ? await fetchWikipediaHint(word) : definition;

        if (finalDefinition.includes(":")) {
            finalDefinition = finalDefinition.replace(":", ";");
        }
        return { definition: finalDefinition, synonyms: finalSynonyms };

    } catch (error) {
        const fallbackDefinition = await fetchWikipediaHint(word);
        return { definition: fallbackDefinition, synonyms: "No synonyms found." };
    }
};
const fetchSynonyms = async (word) => {
    try {
        const url = `${base_url}${encodeURIComponent(word)}/${parameters}&${wordNikapikey}`;
        
        const synonymResponse = await fetch(url, { method: 'GET' }).catch(() => null); // Prevent console error

        if (!synonymResponse) {
            return 'No synonyms found.';
        }

        if (synonymResponse.status === 404 || !synonymResponse.ok) {
            return 'No synonyms found.';
        }

        const synonymData = await synonymResponse.json();
        const synonyms = (synonymData.length > 0 && synonymData[0].words)
            ? synonymData[0].words.join(', ')
            : 'No synonyms found.';

        return synonyms;
    } catch (error) {
        return 'No synonyms found.';
    }
};


const fetchRandomWordAndHint = async () => {
    try {
        const randomWord = await fetchRandomWord();

        const { definition, synonyms } = await fetchWordnikHint(randomWord);
        return { randomWord, definition, synonyms };
    } catch (error) {
        return null;
    }
};

export { fetchRandomWord, fetchWikipediaHint, fetchRandomWordAndHint };
