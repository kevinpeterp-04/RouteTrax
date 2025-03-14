// Sidebar functionality
function showSB() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'flex';
  }
  
  function hideSB() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = 'none';
  }
  
  // Navbar color change on scroll
  let navbar = document.querySelector(".header");
  let originalColor = navbar.style.backgroundColor;
  
  navbar.addEventListener("mouseover", function() {
    navbar.style.backgroundColor = "rgb(0, 0, 0,0.75)";
  });
  
  navbar.addEventListener("mouseout", function() {
    navbar.style.backgroundColor = originalColor;
  });
  
  // Smooth scrolling
  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Scroll animations
  function handleScrollAnimations() {
    const cards = document.querySelectorAll('.feature-card');
    const windowHeight = window.innerHeight;
    const triggerBottom = windowHeight * 0.8;
  
    cards.forEach(card => {
      const cardTop = card.getBoundingClientRect().top;
  
      if (cardTop < triggerBottom) {
        card.classList.add('show');
      } else {
        card.classList.remove('show');
      }
    });
  }
  
  // Initialize animations
  document.addEventListener('DOMContentLoaded', () => {
    handleScrollAnimations();
    window.addEventListener('scroll', handleScrollAnimations);
  });
  
  // Contact form handling
  document.getElementById('contactForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    // Add your form submission logic here
    alert('Message sent successfully!');
    this.reset();
  });