import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const CACHE_FILE = path.join(process.cwd(), "daily-templates-cache.json");

// Dynamic Daily Themes based on the day of the week
const DAILY_THEMES = [
  {
    day: "Sunday",
    title: "Creative Artistic Poster Frames",
    category: "Posters",
    prompt: "10 high-contrast artistic showcase poster frames with gorgeous paint swirls, creative display frame overlays, and modern branding."
  },
  {
    day: "Monday",
    title: "Corporate Badges & ID Cards",
    category: "Badges",
    prompt: "10 minimalist corporate access badges, office pass cards, RFID identity layouts with executive deep blues, slate grays, and silver frames."
  },
  {
    day: "Tuesday",
    title: "Premium Contact Cards & vCards",
    category: "vCards",
    prompt: "10 luxury business vCards, elite consultant contacts, and premium networking cards with obsidian, gold, champagne, and velvet tones."
  },
  {
    day: "Wednesday",
    title: "Trendy Social Media Scanner Flyers",
    category: "Social Media",
    prompt: "10 bright, highly engaging social media grow cards, scan-to-follow badges, and viral influencer promo templates with modern pastels and neon accents."
  },
  {
    day: "Thursday",
    title: "Minimalist Restaurant Cafe Menus",
    category: "Posters",
    prompt: "10 clean, rustic, organic cafe menus, scan-to-order tableside codes, and boutique bistro drink rosters with sage green, beige, and warm wood hues."
  },
  {
    day: "Friday",
    title: "Cyberpunk Techno Festival & Event Tickets",
    category: "Events",
    prompt: "10 neon holographic electronic music pass tickets, rave wristbands, and underground techno party passes with hot pink, dark violet, and cyber grids."
  },
  {
    day: "Saturday",
    title: "Modern Abstract QR Frame Canvas Art",
    category: "Events",
    prompt: "10 exquisite abstract modern canvas frames, gallery exhibit guideboards, and curated museum catalog cards in high-concept black-and-white or high-contrast artistic style."
  }
];

const app = express();
app.use(express.json());

const PORT = 3000;

  // API Route for automatic daily template cache generation
  const SCHEDULE_FILE = path.join(process.cwd(), "daily-templates-schedule.json");

  // Default schedule config
  const defaultSchedule = {
    enabled: true,
    time: "09:00", // HH:MM 24-hour format
    dailyChallenge: "Futuristic Neon Synthwave",
    lastRunDate: "",
    history: [] as any[]
  };

  function getScheduleConfig() {
    if (fs.existsSync(SCHEDULE_FILE)) {
      try {
        const data = fs.readFileSync(SCHEDULE_FILE, "utf-8");
        return JSON.parse(data);
      } catch (e) {
        console.warn("Failed to read schedule file, returning defaults:", e);
      }
    }
    return defaultSchedule;
  }

  function saveScheduleConfig(config: any) {
    try {
      fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(config, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save schedule file:", e);
    }
  }

  async function generateContentWithFallback(ai: any, params: any) {
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite"
    ];
    
    let lastError: any = null;
    for (const model of modelsToTry) {
      let retries = 2;
      while (retries >= 0) {
        try {
          console.log(`[Gemini Request] Attempting call with model: ${model} (Retries left: ${retries})`);
          const response = await ai.models.generateContent({
            ...params,
            model: model
          });
          return response;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini Warning] Model ${model} failed (Retries left: ${retries}):`, err.message || err);
          
          const isTransient = err.message?.includes("503") || err.message?.includes("UNAVAILABLE") || err.message?.includes("429") || err.message?.includes("demand");
          if (isTransient && retries > 0) {
            const delay = (3 - retries) * 1000;
            console.log(`[Gemini Retry] Waiting ${delay}ms before retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          retries--;
        }
      }
    }
    throw lastError || new Error("All Gemini models and retries failed due to high service demand.");
  }

  async function generateTemplatesForTheme(themePrompt: string, themeTitle: string, categoryName: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is not configured on the server.");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await generateContentWithFallback(ai, {
      contents: `Generate exactly 10 premium, gorgeous, visually striking, and perfectly coordinated QR code templates for our DAILY curated gallery theme: "${themePrompt}".
Each of the 10 designs must have a highly professional layout, gorgeous coordinates, distinct titles, and premium matching color schemes. Categories must be distributed or fit the general theme.`,
      config: {
        systemInstruction: `You are an elite master graphic designer and branding strategist.
Your task is to generate exactly 10 high-end, completely unique QR Code templates in JSON format.
Each design fits a 400px wide by 600px high visual card.
The QR code container sits precisely at the center (X=100-300, Y=200-400), so place text elements either at the top (Y=40-160) or at the bottom (Y=440-540) to prevent overlap.
Adhere strictly to the response schema. Ensure that your output contains exactly 10 design templates. Return valid JSON only.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Today's date in YYYY-MM-DD format" },
            dayName: { type: Type.STRING, description: "Name of the day (e.g. 'Monday')" },
            themeTitle: { type: Type.STRING, description: "Daily curated theme title" },
            templates: {
              type: Type.ARRAY,
              description: "Array of exactly 10 unique, fully-configured premium templates.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique template code e.g. 'daily-t-1', 'daily-t-2', etc." },
                  title: { type: Type.STRING, description: "Premium design title" },
                  category: { type: Type.STRING, description: "Must be exactly one of: 'Posters', 'vCards', 'Social Media', 'Badges', 'Events'" },
                  type: { type: Type.STRING, description: "Must be exactly 'Pro' or 'Free'" },
                  description: { type: Type.STRING, description: "Sleek marketing description of this specific template" },
                  bgType: { type: Type.STRING, description: "Must be 'gradient' or 'image'" },
                  gradient: {
                    type: Type.OBJECT,
                    description: "Required if bgType is 'gradient'. Coordinated color stop styling.",
                    properties: {
                      from: { type: Type.STRING, description: "Hex start (e.g., #0B0E14)" },
                      to: { type: Type.STRING, description: "Hex end" },
                      via: { type: Type.STRING, description: "Optional middle hex color" },
                      angle: { type: Type.STRING, description: "CSS angle e.g. '135deg'" }
                    },
                    required: ["from", "to", "angle"]
                  },
                  imageSearchTerm: { type: Type.STRING, description: "Aesthetic high-res Unsplash search terms if bgType is 'image'" },
                  qrConfig: {
                    type: Type.OBJECT,
                    description: "Perfectly coordinated QR styles",
                    properties: {
                      fgColor: { type: Type.STRING, description: "High-contrast hex color for QR foreground" },
                      bgColor: { type: Type.STRING, description: "QR background box hex or transparent" },
                      dotsStyle: { type: Type.STRING, description: "Must be exactly one of: 'rounded', 'dots', 'classy', 'square'" },
                      cornersStyle: { type: Type.STRING, description: "Must be exactly one of: 'extra-rounded', 'dot', 'square'" }
                    },
                    required: ["fgColor", "bgColor", "dotsStyle", "cornersStyle"]
                  },
                  textElements: {
                    type: Type.ARRAY,
                    description: "List of 2 to 4 custom text elements. Must place at Y=40-160 or Y=440-540.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        content: { type: Type.STRING, description: "High-end content string (e.g. 'THE BLACK LAB', 'SCAN TO ORDER')" },
                        x: { type: Type.NUMBER, description: "X coordinate (20 to 250)" },
                        y: { type: Type.NUMBER, description: "Y coordinate (Y=40-160, or Y=440-540)" },
                        color: { type: Type.STRING, description: "Hex text color" },
                        fontSize: { type: Type.NUMBER, description: "Font size in px (14 to 32)" }
                      },
                      required: ["content", "x", "y", "color", "fontSize"]
                    }
                  }
                },
                required: ["id", "title", "category", "type", "description", "bgType", "qrConfig", "textElements"]
              }
            }
          },
          required: ["date", "dayName", "themeTitle", "templates"]
        }
      }
    });

    const dataStr = response.text;
    if (!dataStr) {
      throw new Error("No response text received from Gemini.");
    }

    const parsedData = JSON.parse(dataStr.trim());
    if (parsedData.templates && Array.isArray(parsedData.templates)) {
      parsedData.templates = parsedData.templates.slice(0, 10).map((t: any, idx: number) => {
        t.id = `daily-t-${idx + 1}`;
        return t;
      });
    }
    return parsedData;
  }

  // Automatic scheduler background check (Runs every minute)
  if (!process.env.VERCEL) {
    setInterval(async () => {
      try {
        const config = getScheduleConfig();
        if (!config.enabled) return;

        const now = new Date();
        const todayDate = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
        
        // Format current time as "HH:MM"
        const currentHHMM = now.toTimeString().split(' ')[0].substring(0, 5); // "09:00"

        if (config.time === currentHHMM && config.lastRunDate !== todayDate) {
          console.log(`[Scheduler Triggered] Scheduled time ${config.time} reached! Running automatic generation for ${todayDate}...`);
          
          const dayOfWeek = now.getDay();
          const themeObj = DAILY_THEMES[dayOfWeek];
          const customChallenge = config.dailyChallenge || themeObj.prompt;
          const themeTitle = config.dailyChallenge ? `Daily Challenge: ${config.dailyChallenge}` : themeObj.title;

          try {
            const parsedData = await generateTemplatesForTheme(customChallenge, themeTitle, themeObj.category);
            parsedData.date = todayDate;
            
            // Save to cache file
            fs.writeFileSync(CACHE_FILE, JSON.stringify(parsedData, null, 2), "utf-8");
            console.log(`[Scheduler Success] Saved daily templates for ${todayDate}`);

            // Update config last run
            config.lastRunDate = todayDate;
            if (!config.history) config.history = [];
            config.history.unshift({
              date: todayDate,
              time: currentHHMM,
              themeTitle,
              status: "success",
              timestamp: new Date().toISOString()
            });
            if (config.history.length > 10) {
              config.history = config.history.slice(0, 10);
            }
            saveScheduleConfig(config);
          } catch (genErr: any) {
            console.error(`[Scheduler Error] Failed auto generation:`, genErr);
            config.lastRunDate = todayDate; // Avoid spamming if it keeps failing
            if (!config.history) config.history = [];
            config.history.unshift({
              date: todayDate,
              time: currentHHMM,
              themeTitle,
              status: "error",
              error: genErr.message || "Unknown error",
              timestamp: new Date().toISOString()
            });
            if (config.history.length > 10) {
              config.history = config.history.slice(0, 10);
            }
            saveScheduleConfig(config);
          }
        }
      } catch (schedErr) {
        console.error("[Scheduler Error] General failure:", schedErr);
      }
    }, 60000);
  }

  app.get("/api/daily-templates", async (req: express.Request, res: express.Response) => {
    try {
      const todayDate = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      const dayOfWeek = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
      const themeObj = DAILY_THEMES[dayOfWeek];

      const config = getScheduleConfig();
      const customChallenge = config.dailyChallenge || themeObj.prompt;
      const themeTitle = config.dailyChallenge ? `Daily Challenge: ${config.dailyChallenge}` : themeObj.title;

      const forceRefresh = req.query.force === 'true';

      // Check if cache file exists for today
      if (fs.existsSync(CACHE_FILE) && !forceRefresh) {
        try {
          const rawCache = fs.readFileSync(CACHE_FILE, "utf-8");
          const cachedData = JSON.parse(rawCache);
          if (cachedData.date === todayDate && Array.isArray(cachedData.templates) && cachedData.templates.length === 10) {
            console.log(`[Cache Hit] Serving 10 daily templates for ${todayDate}`);
            return res.json(cachedData);
          }
        } catch (cacheErr) {
          console.warn("Failed reading or parsing daily-templates cache file, generating fresh:", cacheErr);
        }
      }

      console.log(`[Cache Miss] Instructing Gemini to generate 10 fresh dynamic templates for ${todayDate} with challenge: "${customChallenge}"`);
      const parsedData = await generateTemplatesForTheme(customChallenge, themeTitle, themeObj.category);
      parsedData.date = todayDate;

      // Save to cache file for robust persistence
      fs.writeFileSync(CACHE_FILE, JSON.stringify(parsedData, null, 2), "utf-8");
      console.log(`[Cache Saved] Successfully cached 10 templates for ${todayDate}`);

      return res.json(parsedData);
    } catch (err: any) {
      console.error("Daily Templates Batch Generation Error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate daily templates" });
    }
  });

  // GET schedule config
  app.get("/api/schedule", (req: express.Request, res: express.Response) => {
    try {
      const config = getScheduleConfig();
      res.json(config);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to load schedule" });
    }
  });

  // POST update schedule config
  app.post("/api/schedule", (req: express.Request, res: express.Response) => {
    try {
      const { enabled, time, dailyChallenge } = req.body;
      const config = getScheduleConfig();
      
      if (typeof enabled === 'boolean') config.enabled = enabled;
      if (time && typeof time === 'string') config.time = time;
      if (dailyChallenge !== undefined) config.dailyChallenge = dailyChallenge;

      saveScheduleConfig(config);
      res.json({ message: "Schedule updated successfully", config });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update schedule" });
    }
  });

  // API Route for individual template generation using Gemini
  app.post("/api/generate-template", async (req: express.Request, res: express.Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Call Gemini with robust fallback to generate a high-quality coordinated layout configuration
      const response = await generateContentWithFallback(ai, {
        contents: `Generate a gorgeous, visually striking, and perfectly coordinated QR Code poster or card template design based on this prompt: "${prompt}". 
Select premium, cohesive, and high-contrast color pairings, beautiful coordinate layouts, and matching QR code eye/dot pattern styles.
Ensure you specify a matching "layoutType" (preferably "dynamic_custom" if a custom artistic illustration overlay is required, otherwise "artistic_portrait", "kawaii_pastel", "mascot_bear", or "japan_travel").
If choosing "dynamic_custom", design a breath-taking "visualOverlay" with floating themed emojis, borders, and hand-drawn matching vector SVG outlines (svgPaths) to serve as a stunning layout visual mockup. Ensure everything matches the theme perfectly.`,
        config: {
          systemInstruction: `You are an elite graphic designer, brand strategist, and template creator. 
Your task is to generate a highly professional JSON template configuration for a 400px wide by 600px high (Aspect Ratio 3:4) visual QR canvas.
Choose matching colors, text fonts, coordinate placements, and dot patterns.
The canvas has dimensions Width=400, Height=600.
The QR code container sits at the center (X=100-300, Y=200-400, or specifically X=105 to 295, Y=215 to 405), so place text elements and emojis either at the top (Y=40-160) or at the bottom (Y=440-540) to prevent overlap.
For "dynamic_custom" layouts, design highly creative visual overlays. For example:
- A cyberpunk theme could have glowing circuit paths, corner brackets, and electric lightning bolt or gaming emojis.
- A floral/organic theme could have sweeping wave paths, leaf lines, and plant/flower emojis.
- A minimalist luxury theme could have thin diagonal golden framing lines, elegant diamond vectors, and sparkle emojis.
- All SVG paths in "svgPaths" must use clean, valid coordinate numbers (within X=0-400, Y=0-600) and match the palette perfectly. Keep the lines elegant and subtle so they don't cover the QR code.
Always choose high-contrast text and graphic colors relative to the background so that it is perfectly readable.
Adhere strictly to the provided response schema. Return valid JSON only.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Creative, high-end title (e.g. 'Midnight Cafe Board', 'Minimal Matcha RSVP', 'Retro arcade Pass')"
              },
              category: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Posters', 'vCards', 'Social Media', 'Badges', 'Events'"
              },
              description: {
                type: Type.STRING,
                description: "A highly descriptive and premium design overview sentence."
              },
              bgType: {
                type: Type.STRING,
                description: "Must be 'gradient' or 'image'"
              },
              gradient: {
                type: Type.OBJECT,
                description: "Beautiful CSS gradient colors. Required if bgType is 'gradient'.",
                properties: {
                  from: { type: Type.STRING, description: "Hex start color (e.g. #0D0B1C)" },
                  to: { type: Type.STRING, description: "Hex end color (e.g. #1E1233)" },
                  via: { type: Type.STRING, description: "Optional middle color hex code" },
                  angle: { type: Type.STRING, description: "CSS angle (e.g. '135deg', '45deg')" }
                },
                required: ["from", "to", "angle"]
              },
              imageSearchTerm: {
                type: Type.STRING,
                description: "Unsplash keywords to fetch a high-res aesthetic background. Required if bgType is 'image' (e.g. 'retro cyberpunk neon grid background')"
              },
              qrConfig: {
                type: Type.OBJECT,
                description: "Perfectly matching QR design options.",
                properties: {
                  fgColor: { type: Type.STRING, description: "High-contrast foreground color hex (e.g., #A89EFF or #FFFFFF)" },
                  bgColor: { type: Type.STRING, description: "Background color of QR code box (e.g., #FFFFFF, or transparent)" },
                  dotsStyle: { type: Type.STRING, description: "Must be exactly one of: 'rounded', 'dots', 'classy', 'square'" },
                  cornersStyle: { type: Type.STRING, description: "Must be exactly one of: 'extra-rounded', 'dot', 'square'" }
                },
                required: ["fgColor", "bgColor", "dotsStyle", "cornersStyle"]
              },
              layoutType: {
                type: Type.STRING,
                description: "Layout theme style. Must be exactly one of: 'kawaii_pastel', 'mascot_bear', 'artistic_portrait', 'japan_travel', 'dynamic_custom'"
              },
              visualOverlay: {
                type: Type.OBJECT,
                description: "Custom decorative elements for 'dynamic_custom' layoutType.",
                properties: {
                  themeType: {
                    type: Type.STRING,
                    description: "Aesthetic theme style: 'cyberpunk_glow', 'luxurious_elegant', 'organic_minimal', 'cute_kawaii', 'retro_arcade', 'neon_art'"
                  },
                  texture: {
                    type: Type.BOOLEAN,
                    description: "Whether to apply a textured paper/grain surface"
                  },
                  borderStyle: {
                    type: Type.STRING,
                    description: "Aesthetic border: 'none', 'dashed', 'thick_dark', 'cyber_brackets'"
                  },
                  emojis: {
                    type: Type.ARRAY,
                    description: "Floating theme-matching emojis (2 to 5 elements) with clean coordinates to avoid center QR block (x=105 to 295, y=215 to 405). Ensure text isn't covered.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        char: { type: Type.STRING, description: "Emoji character e.g. '🌸', '✨', '☕', '🎵', '⚡', '🌟'" },
                        x: { type: Type.NUMBER, description: "X coordinate (10 to 360)" },
                        y: { type: Type.NUMBER, description: "Y coordinate (Y=40-160 or Y=440-560)" },
                        size: { type: Type.NUMBER, description: "Font size of emoji in px (16 to 48)" }
                      },
                      required: ["char", "x", "y", "size"]
                    }
                  },
                  svgPaths: {
                    type: Type.ARRAY,
                    description: "Aesthetic hand-drawn visual path outlines (vector sketches, curves, neon wireframe lines, patterns). Max 6 paths to keep it clean.",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        d: { type: Type.STRING, description: "SVG path 'd' string (e.g. M10 10 C20 20, 40 40, 100 100)" },
                        stroke: { type: Type.STRING, description: "Hex color stroke code matching theme" },
                        strokeWidth: { type: Type.NUMBER, description: "Width of stroke (e.g. 1 to 4)" },
                        fill: { type: Type.STRING, description: "Hex fill color or 'none'" },
                        opacity: { type: Type.NUMBER, description: "Opacity from 0.1 to 1.0" }
                      },
                      required: ["d", "stroke", "strokeWidth", "fill", "opacity"]
                    }
                  }
                },
                required: ["themeType", "texture", "borderStyle"]
              },
              textElements: {
                type: Type.ARRAY,
                description: "List of 2 to 4 custom text elements on the canvas. Place them at Y=40-160 or Y=440-540.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    content: { type: Type.STRING, description: "Text string (e.g. 'SCAN TO ENTER', 'WELCOME DRINK INCLUDED')" },
                    x: { type: Type.NUMBER, description: "X offset (usually 20 to 250 px, center text around X=50-100)" },
                    y: { type: Type.NUMBER, description: "Y offset (40 to 160, or 440 to 540)" },
                    color: { type: Type.STRING, description: "High contrast hex color" },
                    fontSize: { type: Type.NUMBER, description: "Font size in px (e.g. 18 to 28)" }
                  },
                  required: ["content", "x", "y", "color", "fontSize"]
                }
              }
            },
            required: ["title", "category", "description", "bgType", "qrConfig", "textElements"]
          }
        }
      });

      const dataStr = response.text;
      if (!dataStr) {
        throw new Error("No response text received from Gemini.");
      }

      const parsedData = JSON.parse(dataStr.trim());
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Template Generation Error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate template" });
    }
  });

  // API Route to generate 10 unique visual variations tailored to any of our 100 tools
  app.post("/api/generate-tool-templates", async (req: express.Request, res: express.Response) => {
    try {
      const { toolId, toolName, toolDescription, toolCategory } = req.body;
      if (!toolId || !toolName) {
        return res.status(400).json({ error: "toolId and toolName are required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      console.log(`[Gemini Tool Generation] Designing 10 premium variations for tool: ${toolName} (${toolId})`);

      const response = await generateContentWithFallback(ai, {
        contents: `Generate exactly 10 premium, gorgeous, and highly distinct QR Code card/poster template variations for our specialized tool: "${toolName}".
Tool purpose & description: "${toolDescription || ''}".
Category classification: "${toolCategory || 'Posters'}".

Each of the 10 variations MUST represent a completely different aesthetic theme. Provide a diverse catalog:
1. Cyberpunk Neon Glow (dark cyber matrix, violet/cyan neon curves)
2. Warm Nature Organic (sage green/earthy sand, leaf silhouettes)
3. High-End Dark Luxury (obsidian, rich gold borders and diamond vectors)
4. Pastel Kawaii Cute (soft pink/baby blue, bubbles/clouds)
5. Retro Arcade Game (neon blue/crimson, 8-bit star patterns)
6. Midnight Cafe / Foodie (warm espresso, coffee/baking vectors)
7. Minimalist Bauhaus / Swiss (clean typography, structural primary lines)
8. Festive / Cultural (mandala elements, golden starry skies)
9. Electric Tech Matrix (glowing grids, cyber circuit lines)
10. Pop Art / Bold Brutalist (vibrant color contrast, heavy dark lines)

For each design, specify beautiful custom SVG path vectors (to serve as background sketches), matching text label elements, and beautiful QR code dots/corner designs. Return valid JSON only.`,
        config: {
          systemInstruction: `You are an elite master graphic designer and branding strategist.
Your task is to generate exactly 10 high-end, completely unique QR Code templates in JSON format tailored specifically for the selected tool.
Each design fits a 400px wide by 600px high visual card.
The QR code container sits precisely at the center (X=100-300, Y=200-400, or specifically X=105 to 295, Y=215 to 405), so place text elements and emojis either at the top (Y=40-160) or at the bottom (Y=440-540) to prevent overlap.
Always choose high-contrast text and graphic colors relative to the background so that it is perfectly readable.
Adhere strictly to the response schema. Ensure that your output contains exactly 10 design templates. Return valid JSON only.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              toolId: { type: Type.STRING },
              templates: {
                type: Type.ARRAY,
                description: "Array of exactly 10 unique, fully-configured premium templates.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Unique variation id e.g. 'var-1', 'var-2', etc." },
                    title: { type: Type.STRING, description: "Premium design variation title" },
                    category: { type: Type.STRING, description: "Must be exactly one of: 'Posters', 'vCards', 'Social Media', 'Badges', 'Events'" },
                    type: { type: Type.STRING, description: "Must be exactly 'Pro' or 'Free'" },
                    description: { type: Type.STRING, description: "Sleek marketing description of this specific variation" },
                    bgType: { type: Type.STRING, description: "Must be 'gradient' or 'image'" },
                    gradient: {
                      type: Type.OBJECT,
                      description: "Required if bgType is 'gradient'. Coordinated color stop styling.",
                      properties: {
                        from: { type: Type.STRING, description: "Hex start (e.g., #0B0E14)" },
                        to: { type: Type.STRING, description: "Hex end" },
                        via: { type: Type.STRING, description: "Optional middle hex color" },
                        angle: { type: Type.STRING, description: "CSS angle e.g. '135deg'" }
                      },
                      required: ["from", "to", "angle"]
                    },
                    imageSearchTerm: { type: Type.STRING, description: "Aesthetic high-res Unsplash search terms if bgType is 'image'" },
                    qrConfig: {
                      type: Type.OBJECT,
                      description: "Perfectly coordinated QR styles",
                      properties: {
                        fgColor: { type: Type.STRING, description: "High-contrast hex color for QR foreground" },
                        bgColor: { type: Type.STRING, description: "QR background box hex or transparent" },
                        dotsStyle: { type: Type.STRING, description: "Must be exactly one of: 'rounded', 'dots', 'classy', 'square'" },
                        cornersStyle: { type: Type.STRING, description: "Must be exactly one of: 'extra-rounded', 'dot', 'square'" }
                      },
                      required: ["fgColor", "bgColor", "dotsStyle", "cornersStyle"]
                    },
                    layoutType: { type: Type.STRING, description: "Must be exactly 'dynamic_custom'" },
                    visualOverlay: {
                      type: Type.OBJECT,
                      properties: {
                        themeType: { type: Type.STRING, description: "Must be one of: 'cyberpunk_glow', 'luxurious_elegant', 'organic_minimal', 'cute_kawaii', 'retro_arcade', 'neon_art'" },
                        texture: { type: Type.BOOLEAN },
                        borderStyle: { type: Type.STRING, description: "Must be one of: 'none', 'dashed', 'thick_dark', 'cyber_brackets'" },
                        emojis: {
                          type: Type.ARRAY,
                          description: "2 to 4 custom emojis placed at Y=40-160 or Y=440-540.",
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              char: { type: Type.STRING },
                              x: { type: Type.NUMBER },
                              y: { type: Type.NUMBER },
                              size: { type: Type.NUMBER }
                            },
                            required: ["char", "x", "y", "size"]
                          }
                        },
                        svgPaths: {
                          type: Type.ARRAY,
                          description: "2 to 5 decorative vector curves or lines.",
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              d: { type: Type.STRING },
                              stroke: { type: Type.STRING },
                              strokeWidth: { type: Type.NUMBER },
                              fill: { type: Type.STRING },
                              opacity: { type: Type.NUMBER }
                            },
                            required: ["d", "stroke", "strokeWidth", "fill", "opacity"]
                          }
                        }
                      },
                      required: ["themeType", "texture", "borderStyle"]
                    },
                    textElements: {
                      type: Type.ARRAY,
                      description: "List of 2 to 4 custom text elements. Must place at Y=40-160 or Y=440-540.",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          content: { type: Type.STRING },
                          x: { type: Type.NUMBER },
                          y: { type: Type.NUMBER },
                          color: { type: Type.STRING },
                          fontSize: { type: Type.NUMBER }
                        },
                        required: ["content", "x", "y", "color", "fontSize"]
                      }
                    }
                  },
                  required: ["id", "title", "category", "type", "description", "bgType", "qrConfig", "layoutType", "visualOverlay", "textElements"]
                }
              }
            },
            required: ["toolId", "templates"]
          }
        }
      });

      const dataStr = response.text;
      if (!dataStr) {
        throw new Error("No response text received from Gemini.");
      }

      const parsedData = JSON.parse(dataStr.trim());
      
      // Ensure all templates have valid structured fields and associate with the toolId
      if (parsedData.templates && Array.isArray(parsedData.templates)) {
        parsedData.templates = parsedData.templates.slice(0, 10).map((t: any, idx: number) => {
          t.id = `tool-t-${toolId}-${idx + 1}-${Date.now()}`;
          t.toolId = toolId;
          t.status = 'pending'; // Start as pending in curation database
          t.createdAt = new Date().toISOString();
          return t;
        });
      }

      console.log(`[Gemini Tool Generation] Successfully generated ${parsedData.templates?.length || 0} layouts for ${toolId}`);
      return res.json(parsedData);
    } catch (err: any) {
      console.error("Tool Templates Generation Error:", err);
      return res.status(500).json({ error: err.message || "Failed to generate tool templates" });
    }
  });

  // Serve static assets or use Vite dev server
  async function runDevOrProdServer() {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  if (!process.env.VERCEL) {
    runDevOrProdServer();
  }

export default app;
