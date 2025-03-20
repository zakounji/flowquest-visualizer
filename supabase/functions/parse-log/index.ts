
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logText } = await req.json();

    if (!logText || typeof logText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid log text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing log:", logText.substring(0, 100) + "...");

    // Structured prompt for Gemini
    const prompt = `
      You are a specialized log parsing AI for SpaceX Starship development logs.
      
      Parse the following event log and extract all entities and relationships in JSON format.
      The log follows this format: DD MMM: entity action at location (optional source)
      
      For each entity, determine its type based on these categories:
      - VEHICLE (Starship vehicles like S20, B7)
      - FACILITY (Launch pads, production facilities)
      - COMPONENT (Engines, heat shield, etc.)
      - TEST (Static fires, cryo tests)
      - MILESTONE (Critical achievements)
      - ACTOR (People, teams)
      - EVENT (Launches, landings)
      - RESOURCE (Other resources)
      
      For each relationship between entities, determine its type:
      - FLOW (Sequential flow)
      - TRANSFER (Physical movement) 
      - INTEGRATION (Assembly)
      - TESTING (Test activities)
      - SUPPLY (Delivery)
      - COMMUNICATION (Information exchange)
      - DEPENDENCY (Requirements)

      Return the data in this JSON format:
      {
        "entities": [
          {
            "id": "entity_id",
            "name": "Entity Name",
            "type": "ENTITY_TYPE",
            "properties": {},
            "metrics": { "frequency": 1 }
          }
        ],
        "relationships": [
          {
            "id": "rel_id",
            "source": "source_entity_id",
            "target": "target_entity_id",
            "type": "RELATIONSHIP_TYPE",
            "properties": { "action": "action_text" },
            "metrics": { "frequency": 1, "timestamp": "2023-01-15T00:00:00Z" }
          }
        ],
        "metadata": {
          "startTime": "2023-01-15T00:00:00Z",
          "endTime": "2023-02-25T00:00:00Z",
          "totalEvents": 17
        }
      }

      Only return valid JSON with no explanations. The timestamps should be in ISO format.
      Log to parse: ${logText}
    `;

    // Make request to Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    const data = await response.json();
    console.log("Gemini API response received");

    // Extract the JSON from the text response
    let processedData;
    try {
      // Get the text from the Gemini response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error("No valid response from Gemini API");
      }

      // Extract the JSON object from the text (in case it's wrapped in code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        processedData = JSON.parse(jsonMatch[0]);
      } else {
        processedData = JSON.parse(text);
      }
      
      console.log("Successfully parsed log into structured data");
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
      console.log("Raw response:", JSON.stringify(data));
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse Gemini response', 
          details: error.message,
          rawResponse: data
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
