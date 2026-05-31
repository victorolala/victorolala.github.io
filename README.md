# Victor Olala - Portfolio Website

A modern, responsive portfolio website showcasing my experience as a Cloud & Senior Software Engineer. Built with vanilla HTML, CSS, and JavaScript with a sleek dark theme and smooth animations.

![Portfolio Preview](https://img.shields.io/badge/Portfolio-Live-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- **Modern Design**: Clean, professional design with glassmorphism effects and smooth animations
- **Dark/Light Theme**: Toggle between dark and light themes with persistent preference
- **Fully Responsive**: Optimized for all devices (desktop, tablet, mobile)
- **Performance**: Lightweight vanilla JavaScript (no frameworks)
- **Accessibility**: Semantic HTML and keyboard navigation support
- **SEO Friendly**: Proper meta tags and structured content

## 🚀 Sections

1. **Hero Section**: Introduction with stats and call-to-action buttons
2. **About Section**: Professional summary and key highlights
3. **Work Section**: 
   - Featured current role with detailed responsibilities
   - Skills cloud showcasing all technologies
   - Previous experience cards in a grid layout
4. **Education Section**: Academic background and achievements
5. **Contact Section**: Multiple ways to get in touch with CV download option

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern CSS features (Grid, Flexbox, Custom Properties, Animations)
- **JavaScript (ES6+)**: Vanilla JavaScript for interactivity
- **Google Fonts**: Inter font family
- **SVG Icons**: Custom SVG icons for contact section

## 📁 Project Structure

```
portfolio/
├── index.html          # Main HTML file
├── styles.css          # All styles and animations
├── script.js           # JavaScript functionality
├── admin/              # Superadmin quote portal (not linked publicly)
│   ├── index.html
│   ├── admin.css
│   ├── admin.js
│   ├── config.example.js
│   └── config.js       # Your password hash (gitignored — copy from example)
├── my_cv/              # CV/Resume folder
│   └── Victor_Olala_Senior_Software_Engineer.pdf
└── README.md           # This file
```

## 🔐 Superadmin Quote Portal

A private admin area for generating client **quotes** and **invoices** (line items, tax, discount, rich-text terms, live preview, PDF download).

1. Open **`/admin/`** on your deployed site (e.g. `https://victorolala.github.io/portfolio/admin/`)
2. Default password: **`changeme`** — change this before deploying:
   - Copy `admin/config.example.js` to `admin/config.js`
   - Generate a hash: `node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"`
   - Paste the hash into `config.js`
3. **Quote Builder** — proposals with valid-until dates  
4. **Invoice Builder** — bills with due date, payment status, optional quote reference  
5. **Saved Quotes** — use **→ Invoice** to convert a quote into an invoice  
6. Saved documents live in **browser localStorage** on the device you use  
7. Use **Download PDF** to save the quote or invoice as a file (requires internet on first load for PDF/editor libraries)

**Note:** This is client-side only (suitable for GitHub Pages). The URL is not linked from the portfolio; use a strong password and treat `config.js` as secret.

## 🎨 Customization

### Updating Personal Information

1. **Name & Title**: Edit in `index.html` - Hero section
2. **About Section**: Update the professional summary in the About section
3. **Experience**: Modify experience cards in the Work section
4. **Education**: Update education cards in the Education section
5. **Contact Info**: Update contact details in the Contact section
6. **CV**: Replace `my_cv/Victor_Olala_Senior_Software_Engineer.pdf` with your CV


### Adding Sections

1. Add HTML structure in `index.html`
2. Add corresponding styles in `styles.css`
3. Add navigation link in the navbar if needed

## 🌐 Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be live at `https://username.github.io/portfolio`



## 🎯 Key Features Explained

### Theme Toggle
- Dark theme by default
- Light theme option
- Preference saved in localStorage
- Smooth transitions between themes

### Smooth Scrolling
- All anchor links use smooth scrolling
- Navigation highlights active section
- Mobile menu auto-closes on link click

### Animations
- Intersection Observer for scroll animations
- Hover effects on cards and buttons
- Floating animations on hero elements
- Gradient orb animations in background

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Victor Olala**

- Portfolio: [victorolala.github.io](https://victorolala.github.io)
- GitHub: [@victorolala](https://github.com/victorolala)
- Email: olalavictor01@gmail.com
- Location: Nairobi, Kenya

## 🙏 Acknowledgments

- Design inspired by modern portfolio trends
- Google Fonts for the Inter font family
- All icons are custom SVG or emoji

## 📝 Notes

- The portfolio is built with vanilla JavaScript for optimal performance
- No build process required - just HTML, CSS, and JS
- Easy to customize and modify
- Fully responsive design

---

**Built with ❤️ by Victor Olala**

