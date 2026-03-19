
/**
 * Generates a complete, self-contained HTML file from a blueprint and theme.
 */
export function generateSiteHTML(blueprint, theme, templateType = "tech", projectId) {
  const bp = blueprint || {};
  const t = theme || {
    primary: "#3b82f6",
    accent: "#8b5cf6",
    background: "#030712",
    surface: "#0f172a",
    text: "#f8fafc",
    textSecondary: "#94a3b8",
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bp.event_name || "Event Website"}</title>
  <meta name="description" content="${bp.tagline || ""}">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${t.primary};
      --accent: ${t.accent};
      --bg: ${t.background};
      --surface: ${t.surface};
      --text: ${t.text};
      --text-secondary: ${t.textSecondary};
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    a { color: var(--primary); text-decoration: none; }
    h1, h2, h3 { line-height: 1.2; }

    /* Navigation */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 16px 0;
      background: ${t.background}ee;
      backdrop-filter: blur(20px);
      border-bottom: 1px solid ${t.primary}15;
    }
    nav .container { display: flex; justify-content: space-between; align-items: center; }
    nav .brand { font-size: 1.25rem; font-weight: 700; color: var(--text); }
    nav .nav-links { display: flex; gap: 24px; list-style: none; }
    nav .nav-links a {
      color: var(--text-secondary); font-size: 0.875rem; font-weight: 500;
      transition: color 0.2s;
    }
    nav .nav-links a:hover { color: var(--primary); }

    /* Hero */
    .hero {
      min-height: 100vh; display: flex; flex-direction: column;
      justify-content: center; align-items: center; text-align: center;
      padding: 120px 24px 80px;
      background: linear-gradient(135deg, ${t.background}, ${t.surface});
      position: relative; overflow: hidden;
    }
    .hero::before {
      content: ''; position: absolute; top: -50%; left: -50%;
      width: 200%; height: 200%;
      background: radial-gradient(circle at 30% 50%, ${t.primary}12, transparent 50%),
                  radial-gradient(circle at 70% 50%, ${t.accent}10, transparent 50%);
    }
    .hero h1 {
      font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800;
      position: relative; z-index: 1;
      background: linear-gradient(135deg, var(--text), var(--primary));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero p {
      font-size: 1.25rem; color: var(--text-secondary);
      max-width: 600px; margin: 20px auto 0; position: relative; z-index: 1;
    }
    .hero .cta {
      display: inline-block; margin-top: 32px; padding: 14px 32px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #fff; font-weight: 600; border-radius: 8px;
      font-size: 1rem; position: relative; z-index: 1;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .hero .cta:hover { transform: translateY(-2px); box-shadow: 0 8px 30px ${t.primary}40; }
    .hero .meta {
      display: flex; gap: 24px; margin-top: 24px; position: relative; z-index: 1;
      color: var(--text-secondary); font-size: 0.9rem;
    }

    /* Section styles */
    .section { padding: 100px 0; }
    .section-alt { background: var(--surface); }
    .section-title {
      font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 12px;
    }
    .section-subtitle {
      text-align: center; color: var(--text-secondary); max-width: 600px;
      margin: 0 auto 48px; font-size: 1rem;
    }

    /* Cards grid */
    .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .card {
      background: ${t.surface}cc; border: 1px solid ${t.primary}15;
      border-radius: 12px; padding: 28px;
      transition: transform 0.3s, border-color 0.3s;
    }
    .card:hover { transform: translateY(-4px); border-color: ${t.primary}40; }
    .card .icon { font-size: 1.75rem; margin-bottom: 12px; }
    .card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 8px; }
    .card p { color: var(--text-secondary); font-size: 0.9rem; }

    /* Schedule */
    .schedule-item {
      display: flex; gap: 24px; padding: 20px 0;
      border-bottom: 1px solid ${t.primary}10;
    }
    .schedule-time {
      min-width: 100px; font-weight: 600; color: var(--primary);
      font-size: 0.9rem;
    }
    .schedule-content h3 { font-size: 1rem; margin-bottom: 4px; }
    .schedule-content p { color: var(--text-secondary); font-size: 0.875rem; }
    .schedule-speaker {
      font-size: 0.8rem; color: var(--accent); margin-top: 4px; font-style: italic;
    }

    /* Speakers */
    .speakers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
    .speaker-card { text-align: center; padding: 32px 20px; }
    .speaker-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700; color: white;
    }
    .speaker-name { font-weight: 600; font-size: 1rem; }
    .speaker-role { color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; }
    .speaker-company { color: var(--primary); font-size: 0.8rem; margin-top: 2px; }

    /* Sponsors */
    .sponsors-grid {
      display: flex; flex-wrap: wrap; justify-content: center; gap: 16px;
    }
    .sponsor-badge {
      padding: 12px 24px; border-radius: 8px; font-weight: 500;
      background: ${t.surface}; border: 1px solid ${t.primary}20;
      font-size: 0.9rem;
    }
    .sponsor-tier { font-size: 0.7rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }

    /* Registration */
    .reg-form {
      max-width: 500px; margin: 0 auto;
      background: ${t.surface}cc; border: 1px solid ${t.primary}15;
      border-radius: 12px; padding: 32px;
    }
    .form-group { margin-bottom: 20px; }
    .form-group label {
      display: block; font-size: 0.85rem; font-weight: 500;
      color: var(--text-secondary); margin-bottom: 6px;
    }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 12px 16px; background: var(--bg);
      border: 1px solid ${t.primary}20; border-radius: 8px;
      color: var(--text); font-family: 'Inter', sans-serif; font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none; border-color: var(--primary);
    }
    .submit-btn {
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: white; border: none; border-radius: 8px;
      font-weight: 600; font-size: 1rem; cursor: pointer;
      transition: transform 0.2s;
    }
    .submit-btn:hover { transform: translateY(-1px); }

    /* Contact */
    .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; text-align: center; }
    .contact-item h3 { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 4px; }
    .contact-item p { font-weight: 500; }

    /* Footer */
    footer {
      padding: 40px 0; text-align: center;
      border-top: 1px solid ${t.primary}10;
      color: var(--text-secondary); font-size: 0.85rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero h1 { font-size: 2rem; }
      .hero p { font-size: 1rem; }
      .hero .meta { flex-direction: column; gap: 8px; }
      nav .nav-links { display: none; }
      .schedule-item { flex-direction: column; gap: 8px; }
    }
  </style>
</head>
<body>

  <!-- Navigation -->
  <nav>
    <div class="container">
      <span class="brand">${bp.event_name || "Event"}</span>
      <ul class="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#events">Events</a></li>
        <li><a href="#schedule">Schedule</a></li>
        ${bp.speakers?.length ? '<li><a href="#speakers">Speakers</a></li>' : ""}
        <li><a href="#register">Register</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <!-- Hero -->
  <section class="hero">
    <h1>${bp.hero?.headline || bp.event_name || "Welcome"}</h1>
    <p>${bp.hero?.subheadline || bp.tagline || ""}</p>
    ${bp.date || bp.location ? `<div class="meta">${bp.date ? `<span>📅 ${bp.date}</span>` : ""}${bp.location ? `<span>📍 ${bp.location}</span>` : ""}</div>` : ""}
    <a href="#register" class="cta">${bp.hero?.cta_text || "Register Now"}</a>
  </section>

  <!-- About -->
  <section class="section" id="about">
    <div class="container">
      <h2 class="section-title">${bp.about?.title || "About"}</h2>
      <p class="section-subtitle">${bp.about?.description || ""}</p>
      ${
        bp.about?.highlights?.length
          ? `<div class="card-grid">${bp.about.highlights.map((h) => `<div class="card"><p>✨ ${h}</p></div>`).join("")}</div>`
          : ""
      }
    </div>
  </section>

  <!-- Events -->
  ${
    bp.events?.length
      ? `<section class="section section-alt" id="events">
    <div class="container">
      <h2 class="section-title">Events & Activities</h2>
      <div class="card-grid">
        ${bp.events.map((e) => `<div class="card"><div class="icon">${e.icon || "🎯"}</div><h3>${e.title}</h3><p>${e.description}</p></div>`).join("")}
      </div>
    </div>
  </section>`
      : ""
  }

  <!-- Schedule -->
  ${
    bp.schedule?.length
      ? `<section class="section" id="schedule">
    <div class="container">
      <h2 class="section-title">Schedule</h2>
      <div style="max-width: 700px; margin: 0 auto;">
        ${bp.schedule.map((s) => `<div class="schedule-item"><div class="schedule-time">${s.time}</div><div class="schedule-content"><h3>${s.title}</h3>${s.description ? `<p>${s.description}</p>` : ""}${s.speaker ? `<div class="schedule-speaker">🎤 ${s.speaker}</div>` : ""}</div></div>`).join("")}
      </div>
    </div>
  </section>`
      : ""
  }

  <!-- Speakers -->
  ${
    bp.speakers?.length
      ? `<section class="section section-alt" id="speakers">
    <div class="container">
      <h2 class="section-title">Speakers</h2>
      <div class="speakers-grid">
        ${bp.speakers.map((s) => `<div class="card speaker-card"><div class="speaker-avatar">${s.name.charAt(0)}</div><div class="speaker-name">${s.name}</div><div class="speaker-role">${s.role}</div>${s.company ? `<div class="speaker-company">${s.company}</div>` : ""}${s.bio ? `<p style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary)">${s.bio}</p>` : ""}</div>`).join("")}
      </div>
    </div>
  </section>`
      : ""
  }

  <!-- Sponsors -->
  ${
    bp.sponsors?.length
      ? `<section class="section" id="sponsors">
    <div class="container">
      <h2 class="section-title">Sponsors & Partners</h2>
      <div class="sponsors-grid">
        ${bp.sponsors.map((s) => `<div class="sponsor-badge">${s.tier ? `<div class="sponsor-tier">${s.tier}</div>` : ""}${s.name}</div>`).join("")}
      </div>
    </div>
  </section>`
      : ""
  }

  <!-- Registration -->
  <section class="section section-alt" id="register">
    <div class="container">
      <h2 class="section-title">${bp.registration?.title || "Register"}</h2>
      ${bp.registration?.description ? `<p class="section-subtitle">${bp.registration.description}</p>` : ""}
      <form class="reg-form" id="registration-form">
        ${
          bp.registration?.fields?.length
            ? bp.registration.fields
                .map(
                  (f) => `<div class="form-group">
          <label>${f.label}${f.required ? " *" : ""}</label>
          ${
            f.type === "select"
              ? `<select ${f.required ? "required" : ""}><option value="">Select...</option>${(f.options || []).map((o) => `<option value="${o}">${o}</option>`).join("")}</select>`
              : f.type === "textarea"
                ? `<textarea rows="3" ${f.required ? "required" : ""}></textarea>`
                : `<input type="${f.type}" ${f.required ? "required" : ""} />`
          }
        </div>`
                )
                .join("")
            : `<div class="form-group"><label>Full Name *</label><input type="text" required /></div>
        <div class="form-group"><label>Email *</label><input type="email" required /></div>
        <div class="form-group"><label>Phone</label><input type="tel" /></div>`
        }
        <button type="submit" class="submit-btn">Register Now</button>
      </form>
    </div>
  </section>

  <!-- Contact -->
  ${
    bp.contact
      ? `<section class="section" id="contact">
    <div class="container">
      <h2 class="section-title">Contact</h2>
      <div class="contact-info">
        ${bp.contact.email ? `<div class="contact-item"><h3>Email</h3><p>${bp.contact.email}</p></div>` : ""}
        ${bp.contact.phone ? `<div class="contact-item"><h3>Phone</h3><p>${bp.contact.phone}</p></div>` : ""}
        ${bp.contact.address ? `<div class="contact-item"><h3>Address</h3><p>${bp.contact.address}</p></div>` : ""}
      </div>
    </div>
  </section>`
      : ""
  }

  <!-- Footer -->
  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${bp.event_name || "Event"}. Generated by WebsiteBuilder AI.</p>
    </div>
  </footer>

  <script>
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Registration form
    document.getElementById('registration-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      try {
        const projectIdFromUrl = new URLSearchParams(window.location.search).get('pid');
        const projectId = "${projectId || ''}" || projectIdFromUrl;
        
        if (!projectId) {
          alert('Error: Project ID not found. Registration may fail.');
          console.error('Project ID missing from build and URL');
        }

        const res = await fetch('${process.env.NEXT_PUBLIC_APP_URL || ""}/api/register?project_id=' + projectId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          alert('Registration successful! We\\'ll see you at the event.');
          e.target.reset();
        } else {
          alert('Registration failed. Please try again.');
        }
      } catch (err) {
        alert('Thank you for registering!');
        e.target.reset();
      }
    });

    // Smooth nav hide/show on scroll
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('nav');
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
      nav.style.transition = 'transform 0.3s';
      lastScrollY = window.scrollY;
    });
  </script>
</body>
</html>`;
}
