// src/components/layout/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container-fluid">
        <div className="top-header">
          <div className="logo-block"> 
            <Link href="/">
              <Image 
                src="/images/logo.png" 
                alt="Shipquick Logo" 
                width={140} 
                height={40} 
                className="logo"
              />
            </Link>
          </div>
          <nav className="header-nav">
            <button 
              className="navbar-toggler" 
              type="button" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarSupportedContent">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" href="/pricing">Pricing</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/about">About us</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/support">Support</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/contact">Contact</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link sign-up" href="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link sign-up" href="/signup">Sign up</Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;