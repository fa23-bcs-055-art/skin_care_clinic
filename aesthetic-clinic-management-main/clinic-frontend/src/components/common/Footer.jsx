import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="footer-container">
        <div className="footer-grid">
          {/* About Column */}
          <div className="footer-col">
            <h3>About Us</h3>
            <p>
              Aesthetics by Dr. Hira Iftikhar provides specialized skin and laser treatments 
              with personalized care. Your trusted partner for skincare and beauty.
            </p>
            <div className="social-links">
              <a 
                href="https://www.instagram.com/drdermetam?igsh=MWZzZ2VjNXRibGhiZw==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
              >
                📷
              </a>
              <a 
                href="https://www.facebook.com/share/1E1g69xo3j/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
              >
                📘
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Services Links */}
          <div className="footer-col">
            <h3>Our Services</h3>
            <ul>
              <li><Link to="/services">Skin Treatments</Link></li>
              <li><Link to="/services">Laser Therapy</Link></li>
              <li><Link to="/services">Anti-Aging</Link></li>
              <li><Link to="/services">Acne Treatment</Link></li>
              <li><Link to="/services">Skin Rejuvenation</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h3>Contact Info</h3>
            <ul className="contact-info">
              <li>📍 148 (1st floor), D Chowk, Phase 5, Jeewan City, Madhali Road, Sahiwal</li>
              <li>📞 0319-4474441</li>
              <li>✉️ estheticsbyhiraiftikhar.0001@gmail.com</li>
              <li>⏰ Mon-Fri: 3:00 PM - 7:00 PM</li>
              <li>⏰ Saturday & Sunday: Closed</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Aesthetics by Dr. Hira Iftikhar. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;