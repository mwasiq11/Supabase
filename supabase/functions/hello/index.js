// 1. Hello World 🌍
// Explanation:
// import { serve } → brings in a helper from Deno that listens for HTTP requests.
// serve((req) => {...}) → means: whenever someone calls this function URL, run this code.
// new Response("Hello...") → sends back a reply to the client (like a website response).
// headers: { "Content-Type": "text/plain" } → tells the browser: “This is just plain text, not JSON or HTML.”
// 👉 Think of it like a doorbell:
// When someone rings (makes an HTTP request), your function answers: “Hello from JavaScript Edge Function!”

import { serve } from "https://deno.land/std@0.168.0/http/server.js";
serve((req)=>{
  console.log("function invokeg hello",req.json())
  return new Response ("Hello from JavaScript Edge Function!",{
    headers:{
      "contentType":"plain/text"
    },
  })
})

// 2. Webhook Receiver 🔔 (Stripe Example)
// Explanation:
// A webhook is when another service (like Stripe) sends you a message when something happens.
// await req.json() → reads the incoming data (e.g., Stripe telling you a payment succeeded).
// if (body.type === "payment_intent.succeeded") → checks what event happened.
// return new Response(...) → reply back “ok” so Stripe knows you got the message.
// 👉 Think of it like a postman delivering a letter:
// Stripe (the postman) knocks on your function’s door with info about a payment.
// Your function opens the letter, checks the event, logs it, and says “✅ got it.”

import {serve} from "https://deno.land/std@0.168.0/http/server.js";
serve(async (req) => {
  try {
    const body = await req.json();
    console.log("Received webhook:", body);
    if (body === "payment_intent.succeeded") {
      console.log("payment recieved", body.data.object.id);
    }
    return new Response(JSON.stringify({ status: "200" }), {
      headers: {
        contentType: "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify(error.message), {
      status: "400",
      headers: { "Content-Type": "application/json" },
    });
  }
});

// 3. Storage Logic 📂 (Upload a File)
// Explanation:
// We create a Supabase client inside the function so it can talk to your project.
// Deno.env.get("SUPABASE_URL") and SUPABASE_SERVICE_ROLE_KEY → stored in secrets (not exposed).
// We read the JSON body: { filename, content }.
// supabase.storage.from("my-bucket").upload(...) → uploads the file into your Supabase Storage bucket.
// upsert: true → means “if file already exists, overwrite it.”
// Respond with success or error.
// 👉 Think of it like a file clerk:
// You hand over a file and its name → the clerk (your Edge Function) saves it neatly in the Supabase cabinet (Storage bucket).

import { serve } from "https://deno.land/std@0.168.0/http/server.js";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL");
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(url, serviceRole);

serve(async (req) => {
  const { filename, content } = await req.json();
  const { error } = await supabase.storage
    .from("my-bucket")
    .upload(filename, new TextEncoder().encode(content), {
      contentType: "text/plain",
      upsert: true,
    });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: "400",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return new Response(JSON.stringify({ message: "File uploaded" }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
});

// 4. Dynamic Image Generation 🖼️ (OG Image)
// Explanation:
// Function expects JSON body: { "text": "Hello OG!" }.
// It builds an SVG image (which is just XML describing graphics).
// It writes the text inside the SVG.
// Returns it with header "image/svg+xml".
// 👉 Think of it like a sign painter:
// You say: “Please paint a sign with the word Hello OG!.”
// The function paints it on a 600×200 black board and hands you the image.

import { serve } from "https://deno.land/std@0.168.0/http/server.js";
serve (async(req)=>{
  const {text }=await req.json()
   const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="200">
      <rect width="100%" height="100%" fill="black"/>
      <text x="50%" y="50%" dominant-baseline="middle"
        text-anchor="middle" font-size="40" fill="white">
        ${text}
      </text>
    </svg>
  `;
  return new Response(svg,{
    headers:{
     "Content-Type":"image/svg+xml"
    },
  })
})

// 🎯 Beginner Takeaway
// Hello World → reply with text
// Logic: request comes in → you return a message.
// Webhook Receiver → listen for outside events
// Logic: read incoming JSON → check event type → respond OK.
// Storage Logic → work with Supabase buckets
// Logic: client sends file info → function saves it to Storage.
// Image Generation → create custom responses
// Logic: input text → function generates image (SVG).