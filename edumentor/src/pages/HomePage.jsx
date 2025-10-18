import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Star, CheckCircle, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#F7F9FB] to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#101827] mb-6">
                Guidance that grows with you
              </h1>
              <p className="text-lg text-[#A6B4C8] mb-8">
                Connect with expert mentors, track your career progress, and achieve 
                your goals with personalized guidance and AI-assisted support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/signup/student')}
                  className="px-8 py-4 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#ff5252] transition flex items-center justify-center group"
                >
                  I'm a Student
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
                </button>
                <button 
                  onClick={() => navigate('/signup/mentor')}
                  className="px-8 py-4 bg-[#1F6FEB] text-white rounded-lg hover:bg-[#1557c0] transition flex items-center justify-center group"
                >
                  I'm a Mentor
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-[#00C38A] rounded-full w-64 h-64 absolute -top-10 -right-10 opacity-10"></div>
              <div className="bg-[#1F6FEB] rounded-full w-48 h-48 absolute bottom-0 left-0 opacity-10"></div>
              <div className="relative z-10 bg-white rounded-2xl shadow-xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#00C38A] bg-opacity-10 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-[#00C38A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#101827]">20,000+ Students</div>
                      <div className="text-sm text-[#A6B4C8]">Finding their path</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#1F6FEB] bg-opacity-10 p-3 rounded-lg">
                      <Star className="h-6 w-6 text-[#1F6FEB]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#101827]">5,000+ Mentors</div>
                      <div className="text-sm text-[#A6B4C8]">Expert guidance</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-[#FF6B6B] bg-opacity-10 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-[#FF6B6B]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#101827]">95% Success Rate</div>
                      <div className="text-sm text-[#A6B4C8]">Goals achieved</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#101827] mb-4">
              Why Choose EduMentor?
            </h2>
            <p className="text-lg text-[#A6B4C8]">
              Everything you need for personalized career guidance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F7F9FB] rounded-xl p-8 hover:shadow-lg transition">
              <div className="bg-[#1F6FEB] bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#1F6FEB]" />
              </div>
              <h3 className="text-xl font-semibold text-[#101827] mb-3">
                Personalized Matching
              </h3>
              <p className="text-[#A6B4C8]">
                AI-powered mentor matching ensures you connect with the right 
                guidance for your unique goals and interests.
              </p>
            </div>

            <div className="bg-[#F7F9FB] rounded-xl p-8 hover:shadow-lg transition">
              <div className="bg-[#00C38A] bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-[#00C38A]" />
              </div>
              <h3 className="text-xl font-semibold text-[#101827] mb-3">
                Track Your Progress
              </h3>
              <p className="text-[#A6B4C8]">
                Set goals, define milestones, and visualize your career growth 
                with our comprehensive tracking tools.
              </p>
            </div>

            <div className="bg-[#F7F9FB] rounded-xl p-8 hover:shadow-lg transition">
              <div className="bg-[#FF6B6B] bg-opacity-10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-[#FF6B6B]" />
              </div>
              <h3 className="text-xl font-semibold text-[#101827] mb-3">
                AI-Assisted Support
              </h3>
              <p className="text-[#A6B4C8]">
                Get instant answers, career suggestions, and learning 
                recommendations from our intelligent chatbot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1F6FEB] py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-lg text-white text-opacity-90 mb-8">
            Join thousands of students and mentors transforming careers every day.
          </p>
          <button 
            onClick={() => navigate('/signup/student')}
            className="px-8 py-4 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#ff5252] transition text-lg font-semibold"
          >
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;