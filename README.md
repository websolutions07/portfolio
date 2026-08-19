# Alex Turner — 3D Designer Portfolio (clone)

A static clone of the 3D-designer portfolio site shown in `Screen_Recording_20260816_215843_YouTube.mp4`
(a Wix Studio template demo). Rebuilt from the video frames as plain HTML, CSS and one small JS file —
no build step, no framework, no bundler.

## Running it

Any static server works. A small one is included:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:4321>. Pass `-Port 8080` to change the port.

Opening `index.html` straight off disk also works, though the Google Fonts request needs a
network connection either way.

## Layout

```
index.html          all nine sections
css/base.css        design tokens + shared primitives (pill button, marquee, reveals)
css/*.css           one stylesheet per section
js/main.js          scroll reveals, marquee cloning, contact-form handling
assets/*.svg        every image on the page
SPEC.md             what was read off each video frame, and the values it maps to
```

## Sections

Hero → client logos → gallery → About → Services → Projects → Testimonials → Contact → Footer.

Behaviour carried over from the recording:

- horizontal marquees for the client logos, gallery (two rows, opposite directions),
  testimonials and the footer shape strip
- `ABOUT ME` and `SERVICES` animate from outline to solid when scrolled into view
- the three project cards pin and stack on top of one another as you scroll
- floating 3D decorations bob gently
- everything above is suppressed under `prefers-reduced-motion: reduce`

## Things worth knowing

- **The imagery is not the original.** The source renders aren't available, so every image here is
  procedurally generated SVG matching the colour, composition and subject of what the video shows —
  gallery tiles, project shots, client logos, testimonial avatars, 3D decorations, footer shapes.
  The character head is hand-drawn from the frames.
- **Testimonial avatars are generic illustrated figures**, not portraits of real people.
- **The "Built on WIX STUDIO" bar** at the top of the recording is Wix platform chrome, not part of
  the site design, so it is not reproduced.
- **The contact form does not submit anywhere.** It validates name and email client-side and shows
  an inline confirmation.
- **Fonts are stand-ins.** The original is a Wix template using Wix's own faces; this uses the
  closest Google Fonts — Archivo Black for display, Poppins for body, Archivo for labels.
- Client names, testimonials, the address and phone number are the fictional placeholder content
  from the template.
