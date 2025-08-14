import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ROUTES } from '../../constants';
import { 
  ShieldCheckIcon,
  HeartIcon,
  ChartBarIcon,
  LockClosedIcon,
  BoltIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CogIcon,
  ClockIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  CloudArrowUpIcon,
  ChatBubbleLeftRightIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolid,
  ShieldCheckIcon as ShieldSolid,
  ChartBarIcon as ChartSolid,
  DocumentTextIcon as DocumentSolid,
  UserGroupIcon as UserGroupSolid,
  CogIcon as CogSolid
} from '@heroicons/react/24/solid';

const LandingPage = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (state.auth.isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    } else {
      navigate(ROUTES.LOGIN);
    }
  };

  const handleLearnMore = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page-luxury overflow-hidden bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container-royal">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black tracking-tight logo-text">Fountain</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-black font-medium transition-colors" style={{fontFamily: 'var(--font-body)'}}
              >
                Features
              </a>
              <a 
                href="#benefits" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-black font-medium transition-colors" style={{fontFamily: 'var(--font-body)'}}
              >
                Who it's for
              </a>
              <a 
                href="#about" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-700 hover:text-black font-medium transition-colors" style={{fontFamily: 'var(--font-body)'}}
              >
                How it works
              </a>
              <button 
                onClick={() => navigate(ROUTES.LOGIN)}
                className="text-gray-700 hover:text-black font-medium transition-colors" style={{fontFamily: 'var(--font-body)'}}
              >
                Sign In
              </button>
              <button 
                onClick={handleGetStarted}
                className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105" style={{fontFamily: 'var(--font-body)'}}
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              <div className="w-6 h-0.5 bg-black mb-1.5"></div>
              <div className="w-6 h-0.5 bg-black mb-1.5"></div>
              <div className="w-6 h-0.5 bg-black"></div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200">
            <div className="px-6 py-4 space-y-3">
              <a 
                href="#features" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="block py-2 text-gray-700 hover:text-black font-medium" style={{fontFamily: 'var(--font-display)'}}
              >
                Features
              </a>
              <a 
                href="#benefits" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="block py-2 text-gray-700 hover:text-black font-medium" style={{fontFamily: 'var(--font-display)'}}
              >
                Who it is for
              </a>
              <a 
                href="#about" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="block py-2 text-gray-700 hover:text-black font-medium" style={{fontFamily: 'var(--font-display)'}}
              >
                How it works
              </a>
              <button onClick={() => navigate(ROUTES.LOGIN)} className="block w-full text-left py-2 text-gray-700 hover:text-black font-medium" style={{fontFamily: 'var(--font-display)'}}>Sign In</button>
              <button onClick={handleGetStarted} className="block w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors mt-4 shadow-lg hover:shadow-xl" style={{fontFamily: 'var(--font-display)'}}>Get Started</button>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 bg-white">

        <div className="container-royal relative z-10">
          <div className="text-center space-y-royal">

            {/* Hero Typography */}
            <div className="space-y-8 animate-fade-luxe" style={{animationDelay: '0.2s'}}>
              <h1 className="text-hero text-balance leading-tight text-black tracking-tight">
                Your Complete
                <br />
                <span className="text-black font-light">
                  Medical History, Organized
                </span>
              </h1>
              
              {/* Prominent Quote */}
              <div className="max-w-5xl mx-auto my-16 p-12 bg-gradient-to-r from-gray-50 to-white border-l-8 border-black rounded-r-2xl shadow-xl backdrop-blur-sm">
                <blockquote className="space-y-8">
                  <p className="text-2xl md:text-3xl font-semibold text-black leading-relaxed text-center" style={{fontFamily: 'var(--font-body)'}}>
                    "A complete medical record can cut serious medical errors by <span className="font-bold text-black">over 50%</span> and help doctors make faster, safer decisions."
                  </p>
                </blockquote>
              </div>
            </div>

            {/* Royal CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-luxe" style={{animationDelay: '0.4s'}}>
              <button 
                onClick={handleGetStarted}
                className="px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 group shadow-xl hover:shadow-2xl" style={{fontFamily: 'var(--font-body)'}}
              >
                Get Started Today
                <ArrowRightIcon className="w-5 h-5 ml-2 inline transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={handleLearnMore}
                className="px-8 py-4 bg-white text-black border-2 border-black font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                See How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="container-royal">
          {/* Section Header */}
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-display text-balance">
              Why Fountain?
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-balance font-medium text-gray-900" style={{fontFamily: 'var(--font-body)'}}>
              Comprehensive healthcare record management for better medical outcomes.
            </p>
          </div>

          {/* Primary Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Complete Picture */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-black text-center space-y-6 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 backdrop-blur-sm">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                <DocumentSolid className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-title text-black" style={{fontFamily: 'var(--font-display)'}}>Complete Picture</h3>
                <p className="text-lg leading-relaxed text-gray-900 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                  We gather your medical files from multiple sources and organize them into one complete, shareable record.
                </p>
              </div>
            </div>

            {/* AI + Human Precision */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-black text-center space-y-6 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-title text-black" style={{fontFamily: 'var(--font-display)'}}>AI Improved Report</h3>
                <p className="text-lg leading-relaxed text-gray-900 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                   AI highlights what matters—diagnoses, treatments, and history—so your doctor gets the full picture fast.
                </p>
              </div>
            </div>

            {/* Multilingual, Patient-Friendly */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-black text-center space-y-6 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                <GlobeAltIcon className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-title text-black" style={{fontFamily: 'var(--font-display)'}}>Patient-Friendly</h3>
                <p className="text-lg leading-relaxed text-gray-900 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                 Translations and explanations in simple language—so you actually understand your care.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Who It's For Section */}
      <section id="benefits" className="py-20 bg-black text-white relative overflow-hidden">

        <div className="container-royal relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-display text-white mb-6">
              Who It’s For
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium" style={{fontFamily: 'var(--font-body)'}}>
              If you're preparing for any of these situations, we make sure you have everything ready—on time, and in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* International Referrals */}
            <div className="bg-white/10 backdrop-blur-xl border-2 border-white/30 p-8 rounded-xl text-center hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                <GlobeAltIcon className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-title text-white mb-3" style={{fontFamily: 'var(--font-display)'}}>International Referrals</h3>
              <p className="text-lg text-gray-300 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                Preparing medical records for treatment abroad or specialist consultations in other countries.
              </p>
            </div>

            {/* Second Opinion */}
            <div className="bg-white/10 backdrop-blur-xl border-2 border-white/30 p-8 rounded-xl text-center hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                <ChatBubbleLeftRightIcon className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-title text-white mb-3" style={{fontFamily: 'var(--font-display)'}}>Second Opinion</h3>
              <p className="text-lg text-gray-300 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                Getting comprehensive records ready for another doctor's review or consultation.
              </p>
            </div>

            {/* Legal & Insurance Cases */}
            <div className="bg-white/10 backdrop-blur-xl border-2 border-white/30 p-8 rounded-xl text-center hover:bg-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-5">
                <DocumentCheckIcon className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-title text-white mb-3" style={{fontFamily: 'var(--font-display)'}}>Legal & Insurance Cases</h3>
              <p className="text-lg text-gray-300 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                Handling insurance claims, legal cases, or managing chronic illness documentation.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Get Your Records Organized
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="container-royal">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-display text-balance">
              How It Works
            </h2>
            <p className="text-xl text-balance max-w-3xl mx-auto font-medium text-gray-900" style={{fontFamily: 'var(--font-display)'}}>
              Simple, transparent process to get your complete medical history organized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="text-center group hover:-translate-y-2 transition-all duration-500">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CloudArrowUpIcon className="w-10 h-10 text-white" />
              </div>
              <div className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-700 mb-4 inline-block" style={{fontFamily: 'var(--font-display)'}}>
                Step 1
              </div>
              <h3 className="text-title text-black mb-3" style={{fontFamily: 'var(--font-display)'}}>Upload or Request Records</h3>
              <p className="text-lg text-gray-900 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                AI automatically contact clinics or hospitals on your behalf to gather all your medical records securely.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group hover:-translate-y-2 transition-all duration-500">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <AcademicCapIcon className="w-10 h-10 text-white" />
              </div>
              <div className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-700 mb-4 inline-block" style={{fontFamily: 'var(--font-display)'}}>
                Step 2
              </div>
              <h3 className="text-title text-black mb-3" style={{fontFamily: 'var(--font-display)'}}>AI-Powered Medical Report</h3>
              <p className="text-lg text-gray-900 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                 We turn scattered files into a clear, structured timeline—highlighting key diagnoses, treatments, and medications.
                </p>

            </div>

            {/* Step 3 */}
            <div className="text-center group hover:-translate-y-2 transition-all duration-500">
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <DocumentCheckIcon className="w-10 h-10 text-white" />
              </div>
              <div className="bg-gray-100 rounded-full px-4 py-1 text-sm font-semibold text-gray-700 mb-4 inline-block" style={{fontFamily: 'var(--font-display)'}}>
                Step 3
              </div>
              <h3 className="text-title text-black mb-3" style={{fontFamily: 'var(--font-display)'}}>Receive Your Health Report</h3>
              <p className="text-lg text-gray-900 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                Get your organized health file to share with any doctor, anywhere in the world.
              </p>
            </div>
          </div>

          {/* Pricing CTA */}
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 max-w-lg mx-auto shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-black tracking-tight" style={{fontFamily: 'var(--font-body)'}}>$200–500</span>
              </div>
              <p className="text-lg text-gray-900 font-medium" style={{fontFamily: 'var(--font-body)'}}>
                One-time service fee, depending on case complexity
              </p>
            </div>
            
            <button 
              onClick={handleGetStarted}
              className="px-12 py-5 bg-black text-white text-xl font-semibold rounded-lg hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl tracking-wide" style={{fontFamily: 'var(--font-body)'}}
            >
              Start Your Health File
            </button>
          </div>
        </div>
      </section>

      {/* Sophisticated Footer */}
      <footer className="bg-black text-white py-24 relative overflow-hidden">
        <div className="container-royal relative z-10">
          <div className="text-center space-y-10">
            <div className="space-y-4">
              <h3 className="text-headline text-white logo-text">Fountain</h3>
              <p className="text-body text-gray-400 max-w-md mx-auto" style={{fontFamily: 'var(--font-display)'}}>
                Your complete medical history, organized and understood.
              </p>
            </div>

            <div className="flex justify-center space-x-12 text-caption text-gray-500" style={{fontFamily: 'var(--font-display)'}}>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>

            <div className="pt-8 border-t border-gray-800">
              <p className="text-micro text-gray-600" style={{fontFamily: 'var(--font-display)'}}>
                © 2025 Fountain. Helping you take control of your medical records.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;