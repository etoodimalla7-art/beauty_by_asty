/* ============================================================
   📸 GALLERY MEDIA — ADD YOUR IMAGES & VIDEOS HERE
   ------------------------------------------------------------
   HOW TO ADD MEDIA:
   1. Drop your files into /images, /videos, or /posters
   2. Add a line to the array below
   3. Save and refresh — the grid updates automatically

   TYPES:
   - image : { type: 'image', src, alt, caption, tag }
   - video : { type: 'video', src, poster, alt, caption, tag }
   - embed : { type: 'video', src: 'https://youtube.com/embed/ID', alt, caption, tag }

   TAGS (used by filter buttons): mariée, éditorial, soirée, backstage
   ============================================================ */

const GALLERY_MEDIA = [
  // ---------- IMAGES ----------
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=1000&q=85',
    alt: 'Mariée élégante',
    caption: 'Mariée — Abidjan',
    tag: 'mariée'
  },
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&q=85',
    alt: 'Éditorial warm tones',
    caption: 'Éditorial',
    tag: 'éditorial'
  },
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=1000&q=85',
    alt: 'Soirée glam',
    caption: 'Soirée',
    tag: 'soirée'
  },
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1000&q=85',
    alt: 'Beauté naturelle',
    caption: 'Beauté naturelle',
    tag: 'éditorial'
  },
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1000&q=85',
    alt: 'Backstage',
    caption: 'Backstage',
    tag: 'backstage'
  },
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=1000&q=85',
    alt: 'Mariée voile',
    caption: 'Mariée',
    tag: 'mariée'
  },

  // ---------- LOCAL VIDEO EXAMPLE ----------
  // Uncomment and replace with your own file
  // {
  //   type: 'video',
  //   src: 'videos/backstage.mp4',
  //   poster: 'posters/backstage.jpg',
  //   alt: 'Backstage shooting',
  //   caption: 'Backstage',
  //   tag: 'backstage'
  // },

  // ---------- YOUTUBE EMBED EXAMPLE ----------
  // {
  //   type: 'video',
  //   src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  //   alt: 'Tutoriel',
  //   caption: 'Tutoriel',
  //   tag: 'backstage'
  // },

  // ➕ Add more — copy any block above and edit.
];