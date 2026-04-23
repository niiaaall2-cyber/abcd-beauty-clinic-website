import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: WhatsApp Notification Proxy
  app.post("/api/notify-whatsapp", async (req, res) => {
    const { name, service, phone } = req.body;
    
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const recipientPhone = process.env.WHATSAPP_RECIPIENT_PHONE;

    if (!accessToken || !phoneId || !recipientPhone) {
      console.error("WhatsApp configuration missing in env");
      return res.status(500).json({ error: "Config missing" });
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipientPhone,
          type: "template",
          template: {
            name: "hello_world", // You should replace this with your approved Meta template name
            language: { code: "en_US" }
          }
          // Note: For custom details, you need to approve a template with variables like:
          // name: "new_booking_alert", components: [{ type: "body", parameters: [...] }]
        }),
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("WhatsApp API Error:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
