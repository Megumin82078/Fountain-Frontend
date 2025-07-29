import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button/Button';
import Card from '../../components/shared/Card/Card';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: '📋',
      title: 'Request Records',
      description: 'Easily request your medical records from any healthcare provider with just a few clicks.'
    },
    {
      icon: '🤖',
      title: 'AI Organization',
      description: 'Our AI automatically categorizes and organizes your medical documents for easy access.'
    },
    {
      icon: '🔒',
      title: 'Secure Sharing',
      description: 'Share your health information securely with authorized healthcare providers.'
    },
    {
      icon: '📊',
      title: 'Health Insights',
      description: 'Get personalized insights and trends from your complete health history.'
    },
    {
      icon: '🌍',
      title: 'Multi-language Support',
      description: 'Medical documents automatically translated to your preferred language.'
    },
    {
      icon: '🏥',
      title: 'Provider Network',
      description: 'Connected with thousands of healthcare providers nationwide.'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Sign Up & Verify',
      description: 'Create your secure account and verify your identity'
    },
    {
      number: 2,
      title: 'Add Providers',
      description: 'Select the healthcare providers you want records from'
    },
    {
      number: 3,
      title: 'We Request Records',
      description: 'We handle all the paperwork and follow up with providers'
    },
    {
      number: 4,
      title: 'Receive Insights',
      description: 'Get organized records with AI-powered health insights'
    }
  ];

  const securityFeatures = [
    {
      icon: '🛡️',
      title: 'HIPAA Compliant',
      description: 'Fully compliant with healthcare privacy regulations'
    },
    {
      icon: '🔐',
      title: 'End-to-End Encryption',
      description: 'Your data is encrypted at rest and in transit'
    },
    {
      icon: '👤',
      title: 'You Own Your Data',
      description: 'Complete control over who sees your information'
    }
  ];

  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Your Complete Health Story in One Place
          </h1>
          <p className={styles.heroSubtitle}>
            Request, organize, and share your medical records from any provider. 
            Take control of your health data with AI-powered insights and secure sharing.
          </p>
          <div className={styles.heroActions}>
            <Button 
              variant="secondary" 
              size="large"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
            </Button>
            <Button 
              variant="ghost" 
              size="large"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Everything You Need</h2>
          <p className={styles.sectionSubtitle}>
            Comprehensive tools to manage your health records with ease and security
          </p>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Card key={index} className={styles.featureCard} hoverable>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            Get your complete health records in four simple steps
          </p>
          <div className={styles.stepsContainer}>
            {steps.map((step, index) => (
              <div key={index} className={styles.step}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className={`${styles.section} ${styles.security}`}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Your Data, Your Control</h2>
          <p className={styles.sectionSubtitle}>
            Built with healthcare-grade security and privacy at every step
          </p>
          <div className={styles.securityGrid}>
            {securityFeatures.map((item, index) => (
              <div key={index} className={styles.securityItem}>
                <div className={styles.securityIcon}>{item.icon}</div>
                <h3 className={styles.securityTitle}>{item.title}</h3>
                <p className={styles.securityDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={`${styles.section} ${styles.cta}`}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to Take Control of Your Health Data?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of people who have organized their health records with Fountain
          </p>
          <Button 
            variant="primary" 
            size="large"
            onClick={() => navigate('/signup')}
          >
            Get Started Today
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;