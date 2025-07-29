import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import UserProfileDropdown from './UserProfileDropdown';
import { 
  FaRobot, 
  FaUserMd, 
  FaBell, 
  FaChartLine, 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin,
  FaPlay,
  FaCheck,
  FaStar,
  FaHeart,
  FaShieldAlt,
  FaClock,
  FaArrowRight,
  FaQuoteLeft
} from 'react-icons/fa';
import reactLogo from '../assets/react.svg';
import '../styles/modern.css';

const features = [
  {
    icon: <FaRobot size={40} className="text-primary" />,
    title: 'AI Health Chatbot',
    desc: 'Get instant answers to your health questions and personalized advice 24/7 from our advanced AI assistant.',
    highlight: 'Available 24/7'
  },
  {
    icon: <FaUserMd size={40} className="text-accent" />,
    title: 'Find Doctors Easily',
    desc: 'Search and connect with top-rated doctors and specialists near you with verified reviews and ratings.',
    highlight: 'Verified Doctors'
  },
  {
    icon: <FaBell size={40} className="text-secondary" />,
    title: 'Smart Reminders',
    desc: 'Never miss a dose with intelligent reminders, medication tracking, and personalized scheduling.',
    highlight: 'Never Miss a Dose'
  },
  {
    icon: <FaChartLine size={40} className="text-primary-dark" />,
    title: 'Health Analytics',
    desc: 'Monitor your health stats, set goals, track progress, and get insights with detailed analytics.',
    highlight: 'Data-Driven Insights'
  }
];

const benefits = [
  'Instant AI-powered health consultations',
  'Comprehensive medication management',
  'Verified doctor network access',
  'Personal health data analytics',
  'Secure and private platform',
  '24/7 customer support'
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Working Professional',
    content: 'Smart Health has transformed how I manage my health. The AI chatbot is incredibly helpful!',
    rating: 5
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Healthcare Provider',
    content: 'As a doctor, I appreciate how this platform connects patients with quality healthcare resources.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'Busy Mom',
    content: 'The medicine reminders have been a lifesaver for managing my family\'s medications.',
    rating: 5
  }
];

const sectionPad = "px-4 sm:px-6 md:px-10 lg:px-16";

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState({});
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { isAuthenticated, userData, logoutUser } = useUser();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full font-poppins bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur-md shadow-lg border-b border-blue-100 ${sectionPad}`} style={{height: 70}}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <FaHeart className="text-white text-sm" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight">Smart Health</span>
          </div>
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="hidden sm:block text-primary font-semibold hover:text-primary-dark transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">Dashboard</Link>
                <UserProfileDropdown 
                  user={{ ...userData.profile, onLogout: logoutUser }} 
                  onLogout={logoutUser} 
                />
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-primary font-semibold hover:text-primary-dark transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">Login</Link>
                <Link to="/register" className="get-started-btn font-semibold rounded-full px-6 py-2.5 text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" style={{ background: '#fff', color: '#111' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>
      {/* Main Content with top padding for header */}
      <main className={`flex-1 flex flex-col items-center w-full pt-20 pb-10 ${sectionPad}`}>
        {/* Hero Section */}
        <section id="hero" data-animate className={`w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 py-16 md:py-24 mb-20 ${isVisible.hero ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-primary rounded-full text-sm font-medium mb-4">
                <FaStar className="mr-2" />
                Trusted by 10,000+ users
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 leading-tight">
                Your Personal
                <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Health Companion
                </span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 max-w-2xl leading-relaxed">
                Transform your health journey with AI-powered insights, smart reminders, expert connections, and comprehensive analytics - all in one secure platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Link 
                to="/register" 
                className="get-started-btn font-semibold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                style={{ background: '#fff', color: '#111' }}
              >
                Get Started Free
                <FaArrowRight className="ml-2" />
              </Link>
              <button className="flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300">
                <FaPlay className="mr-2" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-neutral-500">
              <div className="flex items-center">
                <FaShieldAlt className="mr-2 text-green-500" />
                HIPAA Compliant
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2 text-blue-500" />
                24/7 Support
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end mt-10 lg:mt-0 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl transform rotate-6"></div>
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80" 
                alt="Modern healthcare technology" 
                className="relative rounded-3xl shadow-2xl w-full max-w-lg object-cover border border-white/20 transform hover:scale-105 transition-transform duration-500" 
                style={{minHeight: 400}}
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCheck className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Health Goal Achieved!</p>
                    <p className="text-sm text-gray-500">Daily steps completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* About Section */}
        <section id="about" data-animate className={`w-full max-w-6xl mx-auto mb-20 ${isVisible.about ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 px-8 md:px-12 py-12 md:py-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
            
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
                  Revolutionizing Healthcare
                  <span className="block text-primary">One User at a Time</span>
                </h2>
                <p className="text-lg md:text-xl text-neutral-600 leading-relaxed">
                  Smart Health is your comprehensive digital health companion, combining cutting-edge AI technology with personalized care to help you achieve your wellness goals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">10K+</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900">Active Users</h3>
                  <p className="text-neutral-600 text-sm">Trust our platform daily</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-secondary to-secondary-dark rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">500+</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900">Verified Doctors</h3>
                  <p className="text-neutral-600 text-sm">In our network</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-r from-accent to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">99%</span>
                  </div>
                  <h3 className="font-semibold text-neutral-900">Satisfaction Rate</h3>
                  <p className="text-neutral-600 text-sm">User satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section id="features" data-animate className={`w-full max-w-7xl mx-auto mb-20 ${isVisible.features ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Powerful Features for
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Better Health</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover how our comprehensive suite of tools can transform your healthcare experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 overflow-hidden"
                style={{ 
                  minHeight: 280,
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-bl-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                    {feature.icon}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full text-xs font-medium text-primary">
                      {feature.highlight}
                    </div>
                  </div>
                  
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            ))}
          </div>
        </section>
        {/* Benefits Section */}
        <section id="benefits" data-animate className={`w-full max-w-6xl mx-auto mb-20 ${isVisible.benefits ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
                  Why Choose
                  <span className="block text-primary">Smart Health?</span>
                </h2>
                <p className="text-lg text-neutral-600">
                  Join thousands of users who have transformed their health journey with our comprehensive platform.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaCheck className="text-green-600 text-xs" />
                      </div>
                      <span className="text-neutral-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div style={{background: '#f8fafc', border: '2px solid #e0e7ef', borderRadius: '1rem', minHeight: 300, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                  <img 
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?auto=format&fit=crop&w=600&q=80" 
                    alt="Healthcare benefits" 
                    className="rounded-2xl shadow-xl w-full object-cover"
                    style={{minHeight: 300, maxWidth: '100%', display: 'block'}}
                    onError={e => { e.target.onerror = null; e.target.src = reactLogo; }}
                  />
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">Live Support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" data-animate className={`w-full max-w-6xl mx-auto mb-20 ${isVisible.testimonials ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-neutral-600">
              Real stories from real people who trust Smart Health
            </p>
          </div>

          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-blue-100">
            <div className="text-center space-y-6">
              <FaQuoteLeft className="text-4xl text-primary/30 mx-auto" />
              
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-neutral-700 italic leading-relaxed max-w-3xl mx-auto">
                  "{testimonials[currentTestimonial].content}"
                </p>
                
                <div className="flex items-center justify-center space-x-1">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-semibold text-neutral-900">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-neutral-500 text-sm">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-primary scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Screenshots/Preview Section */}
        <section id="preview" data-animate className={`w-full max-w-6xl mx-auto mb-20 ${isVisible.preview ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              See Smart Health in Action
            </h2>
            <p className="text-lg text-neutral-600">
              Experience our intuitive interface designed for your health journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl transform group-hover:scale-105 transition-transform duration-300 pointer-events-none"></div>
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=600&q=80" 
                    alt="Dashboard preview" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 w-full" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div className="py-3 px-4 flex flex-col items-center">
                      <h3 className="font-bold text-white mb-1 text-lg" style={{ textShadow: '0 2px 8px #000' }}>Dashboard Overview</h3>
                      <p className="text-sm text-white" style={{ textShadow: '0 1px 4px #000' }}>Track your health metrics at a glance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-2xl blur-xl transform group-hover:scale-105 transition-transform duration-300 pointer-events-none"></div>
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80" 
                    alt="AI Chatbot preview" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 w-full" style={{ background: 'rgba(0,0,0,0.85)' }}>
                    <div className="py-3 px-4 flex flex-col items-center">
                      <h3 className="font-bold text-white mb-1 text-lg" style={{ textShadow: '0 2px 8px #000' }}>AI Health Assistant</h3>
                      <p className="text-sm text-white" style={{ textShadow: '0 1px 4px #000' }}>Get instant health advice 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Call to Action */}
        <section id="cta" data-animate className={`w-full max-w-6xl mx-auto mb-20 ${isVisible.cta ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <div className="relative bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative px-8 md:px-12 py-16 md:py-20 text-center text-white">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                    Ready to Transform Your
                    <span className="block">Health Journey?</span>
                  </h2>
                  <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
                    Join thousands of users who have already started their journey to better health with Smart Health.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    to="/register" 
                    className="group bg-white text-primary font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center"
                  >
                    Start Free Today
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full hover:bg-white hover:text-primary transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm opacity-80">
                  <div className="flex items-center">
                    <FaCheck className="mr-2" />
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <FaCheck className="mr-2" />
                    Free 30-day trial
                  </div>
                  <div className="flex items-center">
                    <FaCheck className="mr-2" />
                    Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`w-full bg-neutral-900 text-white ${sectionPad}`}>
        <div className="max-w-7xl mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <FaHeart className="text-white text-sm" />
                </div>
                <span className="text-xl font-bold">Smart Health</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Your comprehensive digital health companion, combining AI technology with personalized care.
              </p>
              <div className="flex space-x-4">
                <a href="#" aria-label="Facebook" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <FaFacebook size={16} />
                </a>
                <a href="#" aria-label="Twitter" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <FaTwitter size={16} />
                </a>
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <FaLinkedin size={16} />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Product</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Company</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Support</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-neutral-400 text-sm">
              &copy; {new Date().getFullYear()} Smart Health. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-neutral-400">
              <span className="flex items-center">
                <FaShieldAlt className="mr-2 text-green-400" />
                HIPAA Compliant
              </span>
              <span className="flex items-center">
                <FaHeart className="mr-2 text-red-400" />
                Made with care
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 