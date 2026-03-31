/**
 * Fully Dynamic College Event Templates
 * Features vibrant layouts, dynamic themes, dynamic LoremFlickr media, and timeless alignment.
 */

let globalImageCursor = 0; // Distributes user images dynamically across sections

export function resetImageCursor() {
  globalImageCursor = 0;
}

// Generate deterministic contextual images or use user uploads
// Uses picsum.photos with a seed so the SAME keyword always returns the SAME image
function getDynamicImage(keyword, width = 1600, height = 900, userImages = null) {
  if (userImages && userImages.length > 0) {
     const injection = userImages[globalImageCursor % userImages.length];
     globalImageCursor++;
     return injection;
  }

  // Create a stable seed from the keyword so images never change between loads
  const seed = (keyword || "college-event").replace(/[^a-zA-Z0-9]/g, '-');
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

const PORTRAITS = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop", // Woman
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop", // Man
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", // Woman
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", // Man
];

const ICONS = [
  '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>', // Lightning
  '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>', // Shield
  '<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />' // Pin
];

function getIcon(index) { return ICONS[index % ICONS.length]; }
function getPortrait(index) { return PORTRAITS[index % PORTRAITS.length]; }

export function getNavbarHTML(data) {
  const brand = data.brand || "EventBrand";
  const links = data.links || ["About", "Schedule", "Speakers", "Gallery"];
  
  const linkHTML = links.map(link => 
    `<a href="#${link.toLowerCase().replace(/\\s+/g, '-')}" class="text-sm font-bold text-white/90 hover:text-brand transition-colors uppercase tracking-wider">${link}</a>`
  ).join("\n      ");

  return `<nav class="fixed top-0 left-0 right-0 z-50 py-5 px-6 transition-all duration-300 border-b border-white/10 bg-[#020617]/60 backdrop-blur-2xl" data-nav>
  <div class="max-w-7xl mx-auto w-full flex items-center justify-between">
    <a href="#" class="text-2xl font-black tracking-tighter text-white uppercase">${brand}</a>
    <div class="hidden md:flex items-center gap-10">
      ${linkHTML}
      <a href="#register" class="px-7 py-3.5 bg-brand hover:brightness-110 text-white text-sm font-black uppercase tracking-widest rounded transition-all shadow-lg hover:shadow-brand/40 hover:-translate-y-1">Get Tickets</a>
    </div>
  </div>
</nav>`;
}

export function getEventHeroHTML(data, id = "event-hero") {
  const date = data.date || "OCTOBER 14-16, 2026";
  const venue = data.venue || "Silicon Valley Campus, CA";
  const bgImg = getDynamicImage(data.imageKeyword || "concert,crowd", 1920, 1080, data.userImages);
  
  return `<section id="${id}" class="relative min-h-[90vh] flex flex-col items-center justify-center py-32 px-4 md:px-6 overflow-hidden bg-[#050510]">
  <!-- Dynamic Background Image with Gradient Overlay -->
  <div class="absolute inset-0 z-0">
    <img src="${bgImg}" alt="Event Atmosphere" class="w-full h-full object-cover opacity-50 mix-blend-overlay" />
    <div class="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent"></div>
  </div>
  
  <div class="max-w-7xl mx-auto w-full text-center relative z-10 pt-20">
    <div class="reveal-stagger active flex flex-col items-center">
      <div class="inline-flex flex-col md:flex-row items-center gap-4 px-6 py-3 bg-brand/20 backdrop-blur-xl rounded-2xl text-white font-black tracking-widest uppercase mb-12 border border-brand/30">
        <span class="text-brand">${date}</span>
        <span class="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-white/50"></span>
        <span>${venue}</span>
      </div>
      
      <h1 class="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-white mb-8 uppercase leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] mix-blend-plus-lighter">
        ${data.title || "CYBER<br><span class=\"text-brand\">DAWN</span>"}
      </h1>
      
      <p class="text-xl md:text-3xl text-gray-200 max-w-3xl mx-auto mb-14 font-semibold drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] leading-tight">
        ${data.subtitle || "The largest university festival of the decade. Three days of excitement, learning, and celebration."}
      </p>
      
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 group">
        <a href="#register" class="w-full sm:w-auto px-12 py-5 bg-brand hover:brightness-110 text-white font-black text-xl uppercase tracking-widest rounded-xl transition-all hover:shadow-[0_0_50px_var(--tw-colors-brand)] hover:-translate-y-1">
          ${data.primaryCta || "Register Now"}
        </a>
        <a href="#schedule" class="w-full sm:w-auto px-12 py-5 bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black font-black text-xl uppercase tracking-widest rounded-xl transition-all hover:-translate-y-1">
          ${data.secondaryCta || "View Schedule"}
        </a>
      </div>
    </div>
  </div>
</section>`;
}

export function getAboutEventHTML(data, id = "about-event") {
  const sideImg = getDynamicImage(data.imageKeyword || "campus,technology", 1000, 1000, data.userImages);
  
  return `<section id="${id}" class="py-24 md:py-40 px-4 md:px-6 relative bg-[#020617]">
  <div class="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
     <div class="w-[800px] h-[800px] rounded-full bg-brand blur-[150px]"></div>
  </div>

  <div class="max-w-7xl mx-auto w-full relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
      
      <div class="reveal">
        <h2 class="text-brand font-black text-lg uppercase tracking-[0.3em] mb-4">${data.pretitle || "About The Event"}</h2>
        <h3 class="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.1] uppercase">
          ${data.title || "More than just a festival."}
        </h3>
        <p class="text-xl text-gray-300 leading-relaxed mb-10 font-medium">
          ${data.subtitle || "Experience 48 hours of relentless innovation, hands-on workshops with industry experts, and a community of thousands of ambitious students pushing the boundaries of technology."}
        </p>
        <ul class="space-y-5 mb-10">
          ${(data.features || ["50+ Guest Speakers", "₹1,000,000 in Prizes", "Live Concert Setup"]).map(f => 
            `<li class="flex items-center gap-5 text-white font-bold text-xl tracking-tight">
              <span class="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand leading-[0]">✓</span>
              ${typeof f === 'string' ? f : f.title}
            </li>`
          ).join("\n")}
        </ul>
      </div>
      
      <div class="relative reveal delay-100">
        <!-- Dynamic Photo Stack Aesthetic -->
        <div class="absolute -inset-4 bg-brand rounded-[2rem] transform rotate-3 opacity-30 hidden md:block mix-blend-screen"></div>
        <div class="absolute -inset-4 bg-purple-600 rounded-[2rem] transform -rotate-2 opacity-20 hidden md:block"></div>
        <div class="relative rounded-3xl overflow-hidden shadow-2xl aspect-square border-2 border-white/10 group">
          <img src="${sideImg}" alt="Event Highlight" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80"></div>
        </div>
      </div>

    </div>
  </div>
</section>`;
}

export function getSpeakersHTML(data, id = "speakers") {
  const speakers = data.speakers || [
    { name: "Sarah Jenkins", title: "Keynote / TechNova" },
    { name: "Dr. Alan Turing", title: "AI Researcher" },
    { name: "Emily Chen", title: "Lead Designer" },
    { name: "Mark Johnson", title: "Venture Capitalist" }
  ];

  const cards = speakers.slice(0, 8).map((s, i) => `
      <div class="text-center group reveal">
        <div class="relative mb-8 inline-block">
          <div class="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-[6px] border-brand/20 group-hover:border-brand transition-all duration-500 mx-auto bg-[#0f172a]">
            <img src="${getPortrait(i)}" alt="${s.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-luminosity hover:mix-blend-normal">
          </div>
        </div>
        <h4 class="text-3xl font-black text-white mb-2 uppercase tracking-wide">${s.name}</h4>
        <p class="text-brand font-bold text-sm tracking-[0.2em] uppercase">${s.title}</p>
      </div>`).join("\n");

  return `<section id="${id}" class="py-24 md:py-40 px-4 md:px-6 relative bg-[#020617] border-y border-white/5">
  <div class="max-w-7xl mx-auto w-full">
    <div class="text-center mb-24 reveal">
      <h2 class="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 uppercase flex flex-col">
        <span class="text-brand text-2xl tracking-[0.5em] mb-4">${data.pretitle || "The Lineup"}</span>
        ${data.title || "Featured Speakers"}
      </h2>
      <p class="text-2xl text-gray-400 max-w-2xl mx-auto font-medium">${data.subtitle || "Learn from the brightest minds in the industry."}</p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 reveal-stagger">
      ${cards}
    </div>
  </div>
</section>`;
}

export function getScheduleHTML(data, id = "schedule") {
  const schedule = data.schedule || [
    { time: "09:00 AM", title: "Opening Ceremony", description: "Kickoff at the Main Auditorium with the Dean." },
    { time: "11:00 AM", title: "Hackathon Begins", description: "Teams assemble and problem statements are released." },
    { time: "02:00 PM", title: "Mentorship Round 1", description: "Industry experts visit team tables." },
    { time: "08:00 PM", title: "DJ Night & Dinner", description: "Relax at the campus courtyard." }
  ];

  const rows = schedule.map((s, i) => `
      <div class="relative md:pl-0 reveal">
        <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-10 border-b border-white/5 py-12 group hover:bg-white/[0.02] transition-colors rounded-3xl md:px-10">
          <div class="md:w-1/4 shrink-0">
            <span class="text-4xl md:text-5xl font-black text-brand tracking-tighter">${s.time}</span>
          </div>
          <div class="md:w-3/4">
            <h4 class="text-3xl font-black text-white mb-4 tracking-tight uppercase">${s.title}</h4>
            <p class="text-gray-400 text-xl font-medium leading-relaxed">${s.description}</p>
          </div>
        </div>
      </div>`).join("\n");

  return `<section id="${id}" class="py-24 md:py-40 px-4 md:px-6 relative bg-[#050510]">
  <div class="max-w-6xl mx-auto w-full">
    <div class="mb-24 reveal flex flex-col items-center md:items-start text-center md:text-left">
      <h2 class="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 uppercase flex flex-col">
        <span class="text-brand text-2xl tracking-[0.5em] mb-4 text-center md:text-left">${data.pretitle || "Plan Ahead"}</span>
        ${data.title || "Event Itinerary"}
      </h2>
      <div class="w-32 h-3 bg-brand rounded-full"></div>
    </div>
    
    <div class="relative">
      ${rows}
    </div>
  </div>
</section>`;
}

export function getGalleryGridHTML(data, id = "gallery") {
  const q1 = getDynamicImage((data.imageKeywords?.[0] || data.imageKeyword || "audience") + ",1", 800, 800, data.userImages);
  const q2 = getDynamicImage((data.imageKeywords?.[1] || data.imageKeyword || "concert") + ",2", 800, 800, data.userImages);
  const q3 = getDynamicImage((data.imageKeywords?.[2] || data.imageKeyword || "campus") + ",3", 1600, 800, data.userImages);
  
  return `<section id="${id}" class="py-4 px-4 md:px-6 bg-[#020617]">
  <div class="max-w-7xl mx-auto w-full">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="reveal h-64 md:h-[600px] overflow-hidden rounded-[2rem] relative group border border-white/10">
         <img src="${q1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" alt="Gallery 1"/>
         <div class="absolute inset-0 bg-brand/30 group-hover:bg-transparent transition-colors mix-blend-overlay"></div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="reveal delay-100 h-64 md:h-[292px] overflow-hidden rounded-[2rem] relative group border border-white/10">
           <img src="${q2}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" alt="Gallery 2"/>
           <div class="absolute inset-0 bg-brand/30 group-hover:bg-transparent transition-colors mix-blend-overlay"></div>
        </div>
        <div class="reveal delay-150 h-64 md:h-[292px] overflow-hidden rounded-[2rem] relative group bg-brand flex items-center justify-center p-8 text-center shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
           <div>
             <h3 class="text-4xl font-black text-white uppercase mb-4 tracking-tighter">${data.title || "Join The<br>Hype"}</h3>
             <a href="#register" class="text-white border-b-4 border-white font-black tracking-widest uppercase hover:text-black hover:border-black transition-colors text-lg pb-1">Explore Gallery</a>
           </div>
        </div>
        <div class="reveal delay-200 sm:col-span-2 h-64 md:h-[292px] overflow-hidden rounded-[2rem] relative group border border-white/10">
           <img src="${q3}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" alt="Gallery 3"/>
           <div class="absolute inset-0 bg-brand/30 group-hover:bg-transparent transition-colors mix-blend-overlay"></div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

export function getRegistrationHTML(data, id = "register") {
  // If no registration image is naturally preferred by the prompt, just use abstract 
  return `<section id="${id}" class="py-32 md:py-48 px-4 md:px-6 relative bg-[#020617] overflow-hidden">
  <div class="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
     <div class="w-full h-full max-w-4xl max-h-4xl rounded-full bg-brand blur-[180px] opacity-20"></div>
  </div>

  <div class="max-w-4xl mx-auto w-full relative z-10">
    <div class="bg-black/60 backdrop-blur-3xl border-2 border-brand/40 rounded-[3rem] p-10 md:p-20 shadow-[0_0_150px_rgba(var(--brand-color-rgb),0.2)] reveal relative overflow-hidden">
      <!-- Decor lines -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-brand/20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 left-0 w-32 h-32 bg-brand/20 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
      
      <h2 class="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 uppercase text-center relative z-10">${data.title || "Grab Your Pass"}</h2>
      <p class="text-2xl text-gray-400 text-center mb-16 font-medium relative z-10">${data.subtitle || "Early bird registration completely free for university students."}</p>
      
      <form id="registerForm" class="space-y-8 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label class="block text-sm font-black text-brand uppercase tracking-widest mb-3">Full Name</label>
            <input type="text" name="name" required class="w-full bg-[#020617] border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:border-brand focus:bg-white/5 transition-all outline-none">
          </div>
          <div>
            <label class="block text-sm font-black text-brand uppercase tracking-widest mb-3">Email</label>
            <input type="email" name="email" required class="w-full bg-[#020617] border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:border-brand focus:bg-white/5 transition-all outline-none">
          </div>
        </div>
        <div>
          <label class="block text-sm font-black text-brand uppercase tracking-widest mb-3">Organization</label>
          <input type="text" name="organization" required class="w-full bg-[#020617] border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:border-brand focus:bg-white/5 transition-all outline-none">
        </div>
        <button type="submit" class="w-full py-6 bg-brand hover:brightness-110 text-white font-black text-2xl uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_40px_var(--tw-colors-brand,rgba(255,255,255,0.4))] mt-8">
          ${data.ctaText || "Secure Ticket"}
        </button>
      </form>
    </div>
  </div>
</section>`;
}

export function getFooterHTML(data, id = "footer") {
  return `<footer id="${id}" class="py-24 px-4 md:px-6 bg-[#020617] border-t border-white/10">
  <div class="max-w-7xl mx-auto w-full text-center reveal">
    <h2 class="text-5xl font-black text-white uppercase tracking-tighter mb-10">${data.brand || "EVENT BRAND"}</h2>
    <div class="flex justify-center flex-wrap gap-10 mb-16">
      <a href="#" class="text-gray-500 hover:text-brand font-black uppercase tracking-[0.2em] text-sm transition-colors">Instagram</a>
      <a href="#" class="text-gray-500 hover:text-brand font-black uppercase tracking-[0.2em] text-sm transition-colors">Twitter</a>
      <a href="#" class="text-gray-500 hover:text-brand font-black uppercase tracking-[0.2em] text-sm transition-colors">Discord</a>
      <a href="#" class="text-gray-500 hover:text-brand font-black uppercase tracking-[0.2em] text-sm transition-colors">Contact</a>
    </div>
    <p class="text-brand/50 text-sm font-bold uppercase tracking-[0.3em] border-t border-white/5 pt-12 mt-12">
      © ${new Date().getFullYear()} ${data.brand || "EventBrand"}. Designed Dynamically.
    </p>
  </div>
</footer>`;
}
