
export const APP_TEMPLATES = {
  registration: {
    name: "Smart Registration Helper",
    description: "Collect participant data & get AI summaries. No payments/QR needed.",
    theme: {
      primary_color: "#6366F1",
      secondary_color: "#EC4899",
      background_color: "#0F172A",
      surface_color: "#1E293B",
      text_color: "#F8FAFC",
      font_family: "Inter",
    },
    screens: [
      {
        id: "home",
        name: "Event Info",
        components: [
          { type: "hero", props: { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80", height: 250 } },
          { type: "text", props: { text: "TechFest 2026", fontSize: 28, fontWeight: "bold" } },
          { type: "text", props: { text: "March 15th • Main Auditorium", fontSize: 16, color: "#94A3B8" } },
          { type: "text", props: { text: "The biggest student hackathon of the year. Join us for 24 hours of code, food, and fun.", fontSize: 14 } },
          { type: "button", props: { text: "Register Now", action: "navigate:register", fullWidth: true } },
        ],
      },
      {
        id: "register",
        name: "Register",
        components: [
          { type: "app_bar", props: { title: "Participant Details", centered: true } },
          // Static Fields
          { type: "text_field", id: "name", props: { label: "Full Name", hint: "John Doe" } },
          { type: "text_field", id: "email", props: { label: "Email", hint: "john@example.com" } },
          { type: "text_field", id: "phone", props: { label: "Phone Number", hint: "+1 234..." } },
          { type: "text_field", id: "college", props: { label: "College / Organization", hint: "University of..." } },
          { type: "text_field", id: "dept", props: { label: "Year & Department", hint: "3rd Year CS" } },
          // Dynamic Fields (Example)
          { type: "divider" },
          { type: "text", props: { text: "Additional Info", fontSize: 16, fontWeight: "bold" } },
          { type: "text_field", id: "team_name", props: { label: "Team Name (Optional)", hint: "The Hackers" } },
          { type: "text_field", id: "diet", props: { label: "Dietary Preferences", hint: "Veg, Non-Veg, etc." } },
          { type: "button", props: { text: "Submit Registration", action: "save_form:registrations", fullWidth: true } },
        ],
      },
      {
        id: "dashboard",
        name: "Organizer Dashboard",
        components: [
           { type: "app_bar", props: { title: "Live Stats", centered: true } },
           { type: "grid", props: { columns: 2 }, children: [
               { type: "container", props: { padding: 16, color: "#1E293B" }, children: [
                   { type: "text", props: { text: "124", fontSize: 32, fontWeight: "bold", color: "#6366F1" } },
                   { type: "text", props: { text: "Registrations", fontSize: 12 } }
               ]},
               { type: "container", props: { padding: 16, color: "#1E293B" }, children: [
                   { type: "text", props: { text: "12", fontSize: 32, fontWeight: "bold", color: "#EC4899" } },
                   { type: "text", props: { text: "Colleges", fontSize: 12 } }
               ]}
           ]},
           { type: "button", props: { text: "Generate AI Summary", action: "ai:summarize_registrations", fullWidth: true } },
           { type: "button", props: { text: "Download CSV", action: "download_csv:registrations", fullWidth: true } }
        ]
      }
    ],
  },
  feedback: {
    name: "Feedback Analyzer",
    description: "Get insights from participants. Auto-summarized by AI.",
    theme: {
      primary_color: "#10B981",
      secondary_color: "#3B82F6",
      background_color: "#ffffff",
      surface_color: "#F3F4F6",
      text_color: "#1F2937",
      font_family: "Roboto",
    },
    screens: [
      {
        id: "home",
        name: "Feedback",
        components: [
          { type: "app_bar", props: { title: "Event Feedback", centered: true } },
          { type: "image", props: { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80", height: 180 } },
          { type: "text", props: { text: "We value your opinion!", fontSize: 24, fontWeight: "bold", color: "#111827" } },
          { type: "text", props: { text: "Help us improve future events by answering a few questions.", fontSize: 14, color: "#4B5563" } },
          
          { type: "divider" },
          
          { type: "text", props: { text: "Overall Experience", fontWeight: "bold" } },
          { type: "rating", id: "overall_rating", props: { max: 5 } }, // New comp type? Renderer handles input logic usually
          
          { type: "text", props: { text: "Organization Quality", fontWeight: "bold" } },
          { type: "rating", id: "org_rating", props: { max: 5 } },

          { type: "text_field", id: "suggestions", props: { label: "Suggestions for improvement", hint: "More food options..." } },
          
          { type: "button", props: { text: "Submit Feedback", action: "save_form:feedback", fullWidth: true } },
        ],
      },
      {
         id: "report",
         name: "Analysis Report",
         components: [
             { type: "app_bar", props: { title: "AI Insights", centered: true } },
             { type: "text", props: { text: "Sentiment: Positive (85%)", fontWeight: "bold", color: "#10B981" } },
             { type: "text", props: { text: "Top Themes: Networking, Food, WiFi issues." } },
             { type: "button", props: { text: "Export PDF Report", action: "download_pdf:feedback_report", fullWidth: true } }
         ]
      }
    ],
  },
  certificate: {
    name: "Certificate Generator",
    description: "Bulk generate personalized certs.",
    theme: {
      primary_color: "#F59E0B",
      secondary_color: "#7C3AED",
      background_color: "#111827",
      surface_color: "#1F2937",
      text_color: "#F9FAFB",
      font_family: "Outfit",
    },
    screens: [
      {
        id: "home",
        name: "Issue Certificates",
        components: [
          { type: "app_bar", props: { title: "Certificate Manager", centered: true } },
          { type: "image", props: { url: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1000&q=80", height: 200 } },
          
          { type: "text", props: { text: "1. Upload Names", fontWeight: "bold", fontSize: 18 } },
          { type: "button", props: { text: "Upload CSV File", action: "upload_file:participants", fullWidth: true, icon: "upload" } },
          
          { type: "text", props: { text: "2. Template Config", fontWeight: "bold", fontSize: 18 } },
          { type: "text_field", id: "cert_title", props: { label: "Certificate Title", hint: "Certificate of Appreciation" } },
          { type: "text_field", id: "signatory", props: { label: "Signatory Name", hint: "Dr. Smith" } },
          
          { type: "button", props: { text: "Generate All", action: "process:generate_certs", fullWidth: true } },
          { type: "button", props: { text: "Download ZIP", action: "download:certs_zip", fullWidth: true } },
        ],
      }
    ],
  },
  announcement: {
    name: "Event Announcer",
    description: "Real-time updates for your attendees. Admin posts, users view.",
    theme: {
      primary_color: "#E11D48",
      secondary_color: "#F43F5E",
      background_color: "#FFF1F2",
      surface_color: "#FFE4E6",
      text_color: "#881337",
      font_family: "Poppins",
    },
    screens: [
      {
        id: "feed",
        name: "Latest Updates",
        components: [
          { type: "app_bar", props: { title: "Announcements", centered: true } },
          { type: "announcement_feed", props: { emptyText: "Stay tuned for updates!" } }
        ],
      }
    ],
  }
};
