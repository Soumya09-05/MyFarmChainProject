// Contains functions to handle file conversion and call the Gemini API.

const API_KEY = process.env.REACT_APP_API_KEY; // Canvas provides this at runtime
const IMAGE_ANALYSIS_MODEL = "gemini-2.5-flash-preview-05-20";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_ANALYSIS_MODEL}:generateContent?key=${API_KEY}`;

/**
 * Converts a File object to a Base64 string for API submission.
 * @param {File} file - The image file selected by the user.
 * @returns {Promise<string>} Base64 data string (without the MIME prefix).
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Extract only the Base64 data part (remove "data:image/jpeg;base64,")
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Helper to retry the API call with exponential backoff.
 */
async function fetchWithRetry(url, options, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status !== 429) { 
                return response;
            }
            // If 429 (Rate Limit), wait and retry
            const delayTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delayTime));
        } catch (error) {
            const delayTime = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delayTime));
        }
    }
    throw new Error('API call failed after maximum retries.');
}

/**
 * Calls the Gemini API for image analysis, requesting structured JSON output.
 * @param {string} product - The name of the crop (e.g., "wheat").
 * @param {string} base64Data - The Base64 encoded image data.
 * @returns {Promise<Object>} The structured JSON analysis result.
 */
export const analyzeImageWithGemini = async (product, base64Data) => {
    const prompt = `Analyze the provided image of a ${product} for its quality. Determine its freshness (e.g., Fresh, Stale, Ripe), assign a quality grade (e.g., A, B, C, or D), and provide a brief justification. Give an estimated confidence score between 0.5 and 1.0. Respond ONLY with a JSON object following this schema.`;
    const mimeType = "image/jpeg"; 

    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    productName: { "type": "STRING" },
                    freshnessStatus: { "type": "STRING" },
                    overallQuality: { "type": "STRING" },
                    confidence: { "type": "NUMBER", "format": "float" },
                    justification: { "type": "STRING" },
                },
                propertyOrdering: ["productName", "freshnessStatus", "overallQuality", "confidence", "justification"]
            }
        }
    };

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };

    const response = await fetchWithRetry(API_URL, options);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Request Failed: ${response.status} - ${errorText.substring(0, 100)}...`);
    }
    
    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
         throw new Error("Model response was empty or malformed.");
    }
    
    // Attempt to parse the JSON text received from the model
    return JSON.parse(jsonText);
};
