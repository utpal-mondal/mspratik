import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Image from 'next/image';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Home: NextPage = () => {
  const router = useRouter();

  // Redirect to login if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="home-page">
      <Head>
        <title>Shipquickk - Warehouse Management Solution</title>
        <meta name="description" content="Professional warehouse management solution for online retailers" />
      </Head>

      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Streamline Your Warehouse Operations</h1>
            <p>Shipquickk gives you complete control over your inventory and order fulfillment</p>
            <div className="cta-buttons">
              <Link href="/signup" className="btn btn-primary">Get Started Free</Link>
              <Link href="/demo" className="btn btn-outline">Request Demo</Link>
            </div>
          </div>
          <div className="hero-image">
            <Image 
              src="/images/warehouse-dashboard.png" 
              alt="Warehouse Management Dashboard" 
              width={600} 
              height={400} 
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to Scale</h2>
            <p>Powerful tools to manage your inventory and orders efficiently</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="icon">
                <i className="fas fa-boxes"></i>
              </div>
              <h3>Inventory Management</h3>
              <p>Real-time tracking of all your stock across multiple locations</p>
            </div>
            
            <div className="feature-card">
              <div className="icon">
                <i className="fas fa-shipping-fast"></i>
              </div>
              <h3>Order Fulfillment</h3>
              <p>Process and ship orders faster with our intuitive system</p>
            </div>
            
            <div className="feature-card">
              <div className="icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Analytics & Reports</h3>
              <p>Gain insights into your operations with detailed reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Get started in minutes, scale without limits</p>
          </div>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Connect Your Store</h3>
              <p>Integrate with popular e-commerce platforms</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Import Inventory</h3>
              <p>Sync your products and stock levels</p>
            </div>
            
            <div className="step-arrow">→</div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Start Managing</h3>
              <p>Process orders and manage inventory in one place</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>Trusted by Growing Businesses</h2>
          </div>
          
          <div className="testimonial-cards">
            <div className="testimonial">
              <div className="quote">"Shipquickk transformed how we handle our inventory. Highly recommended!"</div>
              <div className="author">
                <div className="avatar">JD</div>
                <div className="info">
                  <div className="name">John Doe</div>
                  <div className="company">Fashion Store</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial">
              <div className="quote">"The best inventory management solution we've used. Saved us countless hours!"</div>
              <div className="author">
                <div className="avatar">SJ</div>
                <div className="info">
                  <div className="name">Sarah Johnson</div>
                  <div className="company">Gadget World</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Warehouse?</h2>
          <p>Join thousands of businesses that trust Shipquickk</p>
          <Link href="/signup" className="btn btn-primary btn-lg">Start Free Trial</Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
