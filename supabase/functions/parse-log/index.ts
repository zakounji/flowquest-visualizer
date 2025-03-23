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

    // Structured prompt for Gemini with improved entity normalization and categorization
    const prompt = `
      You are a specialized log parsing AI for SpaceX Starship development logs.
      
      Parse the following event log and extract all entities and relationships in JSON format.
      The log follows this format: DD MMM: entity action at location (optional source)
      
      For each entity, determine its type based on these categories, and add a detailed "category" property to help with visualization:
      - VEHICLE: Starship vehicles like S20, B7
        * subcategories: "ship" (S-prefix), "booster" (B-prefix), "prototype"
      - FACILITY: Launch pads, production facilities
        * subcategories: "launch_pad", "production", "test_stand", "landing_zone"
      - COMPONENT: Engines, heat shield, etc.
        * subcategories: "engine", "raptor", "heat_shield", "tiles", "grid_fin", "structural", "electronic", "thermal"
      - TEST: Static fires, cryo tests
        * subcategories: "static_fire", "cryo", "pressure", "integration", "flight_test"
      - MILESTONE: Critical achievements
        * subcategories: "regulatory", "technical", "timeline", "approval"
      - ACTOR: People, teams
        * subcategories: "spacex", "executive", "engineer", "team", "regulatory_body"
      - EVENT: Launches, landings
        * subcategories: "launch", "landing", "integration", "transport"
      - RESOURCE: Other resources
        * subcategories: "fuel", "equipment", "data", "material"
      
      ESSENTIAL ENTITY NORMALIZATION RULES:
      - Merge "Heat shield tiles" and "Heat shield" -> "Heat shield"
      - Merge "S28" and "Starship S28" -> "S28" with category="ship" 
      - Merge "B9" and "Booster B9" -> "B9" with category="booster"
      - Merge "Raptor" and "Raptor engines" -> "Raptor engines"
      - Merge "Static fire" and "Static fire test" -> "Static fire test"
      - Maintain a comprehensive keyword dictionary for entity type detection
      
      For ships (S-prefix), add properties: "role": "ship", "category": "ship"
      For boosters (B-prefix), add properties: "role": "booster", "category": "booster"
      
      For each relationship between entities, determine its type and add a detailed category:
      - FLOW: Sequential flow
        * subcategories: "sequence", "precedes", "follows"
      - TRANSFER: Physical movement
        * subcategories: "transport", "lift", "lower", "move"
      - INTEGRATION: Assembly
        * subcategories: "install", "connect", "assemble", "mount"
      - TESTING: Test activities
        * subcategories: "test", "verify", "qualify", "validate"
      - SUPPLY: Delivery
        * subcategories: "deliver", "receive", "provide"
      - COMMUNICATION: Information exchange
        * subcategories: "report", "announce", "share", "inform"
      - DEPENDENCY: Requirements
        * subcategories: "require", "depends_on", "blocks", "enables"

      Return the data in this JSON format:
      {
        "entities": [
          {
            "id": "entity_id",
            "name": "Entity Name",
            "type": "ENTITY_TYPE",
            "properties": {
              "role": "ship" or "booster" (if applicable),
              "category": "subcategory_name"
            },
            "metrics": {
              "frequency": 1
            }
          }
        ],
        "relationships": [
          {
            "id": "rel_id",
            "source": "source_entity_id",
            "target": "target_entity_id",
            "type": "RELATIONSHIP_TYPE",
            "properties": { 
              "action": "action_text",
              "category": "subcategory_name",
              "timestamp": "2023-01-15T00:00:00Z",
              "duration": "estimated_time_in_hours" (when applicable)
            },
            "metrics": {
              "frequency": 1
            }
          }
        ],
        "metadata": {
          "startTime": "2023-01-15T00:00:00Z",
          "endTime": "2023-02-25T00:00:00Z",
          "totalEvents": 17
        }
      }

      Apply a deep normalization process to avoid duplicated entities:
      1. First normalize entity names (lowercase, trim, replace variants)
      2. For each normalized entity, check if it's a variant of an existing entity
      3. Create a mapping of original entity IDs to normalized entity IDs
      4. Update all relationship references to use the normalized entity IDs
      5. Add time duration estimates for activities when possible (in hours)

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
      
      // Perform additional post-processing to merge similar entities
      if (processedData.entities) {
        // Create maps for normalized entities
        const normalizedEntities = new Map();
        const entityNameMap = new Map();
        
        // First pass: normalize and deduplicate entities
        processedData.entities.forEach(entity => {
          // Ensure each entity has a metrics object with frequency
          if (!entity.metrics) {
            entity.metrics = { frequency: 1 };
          } else if (entity.metrics && typeof entity.metrics.frequency !== 'number') {
            entity.metrics.frequency = 1;
          }
          
          const normalizedName = normalizeEntityName(entity.name);
          entityNameMap.set(entity.id, normalizedName);
          
          if (normalizedEntities.has(normalizedName)) {
            // Merge with existing entity
            const existingEntity = normalizedEntities.get(normalizedName);
            
            // Update frequency
            if (!existingEntity.properties) existingEntity.properties = {};
            if (!entity.properties) entity.properties = {};
            
            // Ensure metrics objects exist with default values if needed
            if (!existingEntity.metrics) existingEntity.metrics = { frequency: 1 };
            if (!entity.metrics) entity.metrics = { frequency: 1 };
            
            existingEntity.metrics.frequency = (existingEntity.metrics.frequency || 1) + 
                                               (entity.metrics.frequency || 1);
            
            // Merge properties (keep more specific categorizations)
            if (entity.properties.category && !existingEntity.properties.category) {
              existingEntity.properties.category = entity.properties.category;
            }
            
            if (entity.properties.role && !existingEntity.properties.role) {
              existingEntity.properties.role = entity.properties.role;
            }
            
          } else {
            // Set vehicle roles if not already set
            if (entity.type === 'VEHICLE' && !entity.properties?.role) {
              if (!entity.properties) entity.properties = {};
              
              // Identify ships vs boosters
              if (/^s\d+/i.test(normalizedName) || normalizedName.includes('starship')) {
                entity.properties.role = 'ship';
                entity.properties.category = 'ship';
              } else if (/^b\d+/i.test(normalizedName) || normalizedName.includes('booster')) {
                entity.properties.role = 'booster';
                entity.properties.category = 'booster';
              }
            }
            
            // Add component subcategories if not set
            if (entity.type === 'COMPONENT' && !entity.properties?.category) {
              if (!entity.properties) entity.properties = {};
              
              const name = normalizedName.toLowerCase();
              if (name.includes('raptor') || name.includes('engine')) {
                entity.properties.category = 'engine';
              } else if (name.includes('shield') || name.includes('tile')) {
                entity.properties.category = 'heat_shield';
              } else if (name.includes('fin') || name.includes('flap')) {
                entity.properties.category = 'grid_fin';
              } else {
                entity.properties.category = 'structural';
              }
            }
            
            // Ensure metrics exists with frequency
            if (!entity.metrics) entity.metrics = { frequency: 1 };
            if (typeof entity.metrics.frequency !== 'number') {
              entity.metrics.frequency = 1;
            }
            
            normalizedEntities.set(normalizedName, entity);
          }
        });
        
        // Update entities array with deduplicated entities
        processedData.entities = Array.from(normalizedEntities.values());
        
        // Create a map of original entity IDs to the new deduplicated entity IDs
        const idMapping = new Map();
        processedData.entities.forEach(entity => {
          const normalizedName = normalizeEntityName(entity.name);
          // Find all original IDs that map to this normalized name
          entityNameMap.forEach((name, originalId) => {
            if (name === normalizedName) {
              idMapping.set(originalId, entity.id);
            }
          });
        });
        
        // Second pass: update relationship references to use deduplicated entity IDs
        if (processedData.relationships) {
          processedData.relationships.forEach(rel => {
            // Ensure each relationship has a metrics object with frequency
            if (!rel.metrics) {
              rel.metrics = { frequency: 1 };
            } else if (rel.metrics && typeof rel.metrics.frequency !== 'number') {
              rel.metrics.frequency = 1;
            }
            
            // Map source and target to deduplicated entity IDs
            if (idMapping.has(rel.source)) {
              rel.source = idMapping.get(rel.source);
            }
            
            if (idMapping.has(rel.target)) {
              rel.target = idMapping.get(rel.target);
            }
            
            // Add missing properties
            if (!rel.properties) rel.properties = {};
            
            // Add relationship categories if not set
            if (!rel.properties.category) {
              const action = (rel.properties.action || '').toLowerCase();
              
              if (action.includes('move') || action.includes('transport') || action.includes('roll') || action.includes('lift')) {
                rel.properties.category = 'transport';
              } else if (action.includes('install') || action.includes('connect') || action.includes('attach')) {
                rel.properties.category = 'install';
              } else if (action.includes('test') || action.includes('fire') || action.includes('check')) {
                rel.properties.category = 'test';
              } else {
                rel.properties.category = 'sequence';
              }
            }
            
            // Add duration estimates if not set
            if (!rel.properties.duration) {
              const action = (rel.properties.action || '').toLowerCase();
              const category = (rel.properties.category || '').toLowerCase();
              
              // Estimate durations based on activity type
              if (category === 'transport' || action.includes('move') || action.includes('roll')) {
                rel.properties.duration = '4'; // 4 hours for transport
              } else if (category === 'install' || action.includes('install') || action.includes('attach')) {
                rel.properties.duration = '24'; // 24 hours for installation
              } else if (category === 'test' || action.includes('test') || action.includes('fire')) {
                rel.properties.duration = '12'; // 12 hours for testing
              } else {
                rel.properties.duration = '8'; // default 8 hours
              }
            }
          });
          
          // Filter out invalid relationships where source or target doesn't exist
          processedData.relationships = processedData.relationships.filter(rel => {
            const sourceExists = processedData.entities.some(e => e.id === rel.source);
            const targetExists = processedData.entities.some(e => e.id === rel.target);
            return sourceExists && targetExists;
          });
        }
        
        // Ensure all required fields exist in the data structure
        if (!processedData.metadata) {
          processedData.metadata = {
            totalEvents: processedData.relationships.length,
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString()
          };
        }
        
        if (!processedData.metadata.totalEvents) {
          processedData.metadata.totalEvents = processedData.relationships.length;
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

// Enhanced entity name normalization function with more comprehensive rules
function normalizeEntityName(name: string): string {
  if (!name) return '';
  
  // Convert to lowercase and remove extra spaces
  let normalized = name.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Handle common vehicle naming patterns
  if (/starship\s+s\d+/.test(normalized) || /ship\s+s\d+/.test(normalized)) {
    const match = normalized.match(/s(\d+)/i);
    if (match) return `s${match[1]}`;
  }
  
  if (/booster\s+b\d+/.test(normalized) || /superheavy\s+b\d+/.test(normalized) || /super\s+heavy\s+b\d+/.test(normalized)) {
    const match = normalized.match(/b(\d+)/i);
    if (match) return `b${match[1]}`;
  }
  
  // Direct vehicle identifiers (S28, B9, etc)
  if (/^s\d+$/.test(normalized) || /^b\d+$/.test(normalized)) {
    return normalized;
  }

  // Handle old naming schemes
  if (/^sn\d+$/.test(normalized)) {
    const match = normalized.match(/sn(\d+)/i);
    if (match) return `sn${match[1]}`;
  }
  
  if (/^bn\d+$/.test(normalized)) {
    const match = normalized.match(/bn(\d+)/i);
    if (match) return `bn${match[1]}`;
  }
  
  // Handle component variations
  if (normalized.includes('heat shield') || normalized.includes('thermal shield') || normalized.includes('tiles')) {
    return 'heat shield';
  }
  
  if (normalized.includes('raptor') || normalized.includes('engine')) {
    if (normalized.includes('raptor 2')) {
      return 'raptor 2 engines';
    }
    return 'raptor engines';
  }
  
  if (normalized.includes('grid fin') || normalized.includes('gridfin')) {
    return 'grid fins';
  }
  
  // Handle test activities
  if (normalized.includes('static fire') || normalized.includes('staticfire')) {
    return 'static fire test';
  }
  
  if (normalized.includes('cryo test') || normalized.includes('cryogenic')) {
    return 'cryo test';
  }
  
  // Handle facilities
  if (normalized.includes('launch pad') || normalized.includes('launchpad')) {
    if (normalized.includes('pad a')) {
      return 'launch pad a';
    } else if (normalized.includes('pad b')) {
      return 'launch pad b';
    }
    return 'launch pad';
  }
  
  if (normalized.includes('orbital launch')) {
    if (normalized.includes('mount')) {
      return 'orbital launch mount';
    } else if (normalized.includes('tower')) {
      return 'orbital launch tower';
    } else if (normalized.includes('table')) {
      return 'orbital launch table';
    }
    return 'orbital launch pad';
  }
  
  // Remove common prefixes
  normalized = normalized.replace(/^(the|a|an) /, '');
  
  return normalized;
}
