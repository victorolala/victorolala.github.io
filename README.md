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
├── my_cv/              # CV/Resume folder
│   └── Victor_Olala_Senior_Software_Engineer.pdf
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/OlalaTheExpert/portfolio.git
cd portfolio
```

2. Open `index.html` in your browser:
   - Simply double-click the file, or
   - Use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

3. Visit `http://localhost:8000` in your browser

## 🎨 Customization

### Updating Personal Information

1. **Name & Title**: Edit in `index.html` - Hero section
2. **About Section**: Update the professional summary in the About section
3. **Experience**: Modify experience cards in the Work section
4. **Education**: Update education cards in the Education section
5. **Contact Info**: Update contact details in the Contact section
6. **CV**: Replace `my_cv/Victor_Olala_Senior_Software_Engineer.pdf` with your CV

### Changing Colors

Edit CSS custom properties in `styles.css`:

```css
:root {
    --primary-color: #6366f1;      /* Main brand color */
    --secondary-color: #8b5cf6;    /* Secondary color */
    --accent-color: #ec4899;       /* Accent color */
    /* ... other variables */
}
```

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

### Netlify

1. Drag and drop the folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repository for automatic deployments

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

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

- Portfolio: [olalatheexpert.github.io](https://olalatheexpert.github.io)
- GitHub: [@OlalaTheExpert](https://github.com/OlalaTheExpert)
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

