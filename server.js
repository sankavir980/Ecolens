require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());

app.use(
    express.json({
        limit: "20mb"
    })
);

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


/* HOME */

app.get("/", (req, res) => {
    res.json({
        message: "EcoLens backend is working! 🌱"
    });
});


/* AI WASTE ANALYSIS */

app.post("/analyze", async (req, res) => {

    try {

        console.log("📸 Image received");

        const { image, mimeType } = req.body;

        if (!image) {
            return res.status(400).json({
                error: "No image received"
            });
        }

        console.log("🤖 Sending image to Gemini...");

        const interaction = await ai.interactions.create({

            model: "gemini-3.6-flash",

            input: [

                {
                    type: "image",

                    mime_type:
                        mimeType || "image/jpeg",

                    data: image
                },

                {
                    type: "text",

                    text: `

You are EcoLens, an AI-powered waste identification assistant.

Carefully analyze the uploaded image and identify the visible waste item.

Do not invent an item when the image is unclear.

Return EXACTLY this format:

Waste item:
Category:
Confidence:
Recyclable:
Disposal advice:
India disposal guide:
Environmental tip:

Use ONLY one of these categories:

Plastic
Paper/Cardboard
Glass
Metal
Organic/Wet Waste
E-Waste
Hazardous Waste
Textile
General Waste
Other

Confidence must be:

High
Medium
Low

Recyclable must be:

Yes
No
Depends

Rules:

1. Identify only what is reasonably visible.
2. Keep answers short and easy to understand.
3. Give practical disposal advice.
4. Consider common waste-management practices in India.
5. Batteries and hazardous materials should NOT be recommended for normal household bins.
6. Electronics should be directed toward authorized e-waste collection/recycling channels.
7. Organic waste can generally go into wet/organic waste or composting where available.
8. Paper, cardboard, plastic, glass and metal should follow local dry-waste/recycling rules.
9. Do not claim that every item is recyclable because facilities differ by location.
10. Do not claim exact carbon savings or environmental statistics unless they can be reliably established from the image.

The environmental tip should be one simple useful action.

`

                }

            ]

        });


        console.log("✅ Gemini response received");

        res.json({
            result: interaction.output_text
        });


    } catch (error) {

        console.error("❌ Gemini error:");
        console.error(error);

        res.status(500).json({
            error:
                error.message ||
                "AI analysis failed"
        });

    }

});


/* START SERVER */

app.listen(3000, () => {

    console.log("");

    console.log(
        "🌱 EcoLens backend running on http://localhost:3000"
    );

    console.log("");

});