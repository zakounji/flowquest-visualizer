
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
    console.log("Edge function invoked with method:", req.method);
    
    const requestData = await req.json();
    const { logText } = requestData;

    if (!logText || typeof logText !== 'string') {
      console.error("Invalid log text provided:", logText);
      return new Response(
        JSON.stringify({ error: 'Invalid log text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing log:", logText.substring(0, 100) + "...");
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Structured prompt for Gemini with improved entity normalization
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
      
      IMPORTANT: Normalize entity names to avoid duplication. For example:
      - Treat "Heat shield tiles" and "Heat shield" as the same entity "Heat shield"
      - Treat "S28" and "Starship S28" as the same entity "S28"
      - Treat "B9" and "Booster B9" as the same entity "B9"
      - Identify if an entity is a ship (prefixed with S) or a booster (prefixed with B)
      
      For ships (like S28), add a property "role": "ship" and for boosters (like B9), add a property "role": "booster"
      
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
            "properties": {
              "role": "ship" or "booster" (if applicable)
            },
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

    console.log("Sending request to Gemini API...");

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
    console.log("Gemini API response received:", data.candidates ? "Success" : "Failed");

    // Extract the JSON from the text response
    let processedData;
    try {
      // Get the text from the Gemini response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.error("No valid response text from Gemini API");
        throw new Error("No valid response from Gemini API");
      }

      // Extract the JSON object from the text (in case it's wrapped in code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        processedData = JSON.parse(jsonMatch[0]);
      } else {
        processedData = JSON.parse(text);
      }
      
      console.log("Successfully parsed log into structured data with entities:", processedData.entities?.length || 0);
      
      // Additional post-processing to merge similar entities if needed
      if (processedData.entities) {
        // Create a normalized name map
        const normalizedEntities = new Map();
        
        // First pass: normalize entity names and identify duplicates
        processedData.entities.forEach(entity => {
          const normalizedName = normalizeEntityName(entity.name);
          
          if (normalizedEntities.has(normalizedName)) {
            // Merge entities
            const existingEntity = normalizedEntities.get(normalizedName);
            existingEntity.metrics.frequency += entity.metrics.frequency || 1;
            
            // Merge properties
            if (entity.properties) {
              existingEntity.properties = { ...existingEntity.properties, ...entity.properties };
            }
          } else {
            // Set ship or booster role if not already set
            if (entity.type === 'VEHICLE' && !entity.properties?.role) {
              if (!entity.properties) entity.properties = {};
              
              if (/^S\d+/i.test(entity.name) || /starship/i.test(entity.name)) {
                entity.properties.role = 'ship';
              } else if (/^B\d+/i.test(entity.name) || /booster/i.test(entity.name)) {
                entity.properties.role = 'booster';
              }
            }
            
            normalizedEntities.set(normalizedName, entity);
          }
        });
        
        // Create id to normalized name mapping for relationship updates
        const idToNormalizedName = new Map();
        processedData.entities.forEach(entity => {
          idToNormalizedName.set(entity.id, normalizeEntityName(entity.name));
        });
        
        // Update entity list with normalized entities
        processedData.entities = Array.from(normalizedEntities.values());
        
        // Update relationships to point to normalized entity ids
        if (processedData.relationships) {
          processedData.relationships.forEach(rel => {
            const sourceNormalized = idToNormalizedName.get(rel.source);
            const targetNormalized = idToNormalizedName.get(rel.target);
            
            if (sourceNormalized) {
              const newSourceEntity = processedData.entities.find(e => normalizeEntityName(e.name) === sourceNormalized);
              if (newSourceEntity) rel.source = newSourceEntity.id;
            }
            
            if (targetNormalized) {
              const newTargetEntity = processedData.entities.find(e => normalizeEntityName(e.name) === targetNormalized);
              if (newTargetEntity) rel.target = newTargetEntity.id;
            }
          });
        }
        
        console.log("Post-processed entities after normalization:", processedData.entities.length);
      }
      
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
      console.log("Raw response:", JSON.stringify(data).substring(0, 500) + "...");
      
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

// Helper function to normalize entity names for deduplication
function normalizeEntityName(name: string): string {
  if (!name) return '';
  
  // Convert to lowercase and remove extra spaces
  let normalized = name.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Handle common variations of the same entity
  if (normalized.includes('heat shield')) {
    return 'heat shield';
  }
  
  if (/^s\d+/.test(normalized) || /starship s\d+/.test(normalized)) {
    // Extract S number: S28, Starship S28, etc.
    const match = normalized.match(/s(\d+)/i);
    if (match) return `s${match[1]}`;
  }
  
  if (/^b\d+/.test(normalized) || /booster b\d+/.test(normalized)) {
    // Extract B number: B9, Booster B9, etc.
    const match = normalized.match(/b(\d+)/i);
    if (match) return `b${match[1]}`;
  }
  
  // Strip common prefixes
  normalized = normalized.replace(/^(the|a|an) /, '');
  
  return normalized;
}
