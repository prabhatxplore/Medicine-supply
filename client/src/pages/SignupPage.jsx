import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const STEPS = ['Account', 'Personal', 'Verification'];

const SignupPage = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    address: '', phoneNumber: '',
    nationalIdCard: null, citizenshipCard: null,
  });
  const [fileNames, setFileNames] = useState({ nationalIdCard: '', citizenshipCard: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    if (role === 'admin') return '/admin';
    return '/';
  };

  const passwordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669'][strength];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setFileNames({ ...fileNames, [name]: files[0].name });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nationalIdCard && !formData.citizenshipCard) {
      toast.error('Please upload either National ID or Citizenship Card');
      return;
    }
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(k => { if (formData[k]) data.append(k, formData[k]); });
    try {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: data,
        credentials: 'include', // keep session cookie returned by backend
      });
      const result = await res.json();
      if (res.ok) {
        toast.success('Account created successfully. Redirecting…');
        navigate(getDashboardPath(result.role));
      } else {
        toast.error(result.message || 'Signup failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const FileUpload = ({ name, label, required }) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <label
          htmlFor={`file-${name}`}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1rem',
            border: `2px dashed ${fileNames[name] ? '#10b981' : '#cbd5e1'}`,
            borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
            background: fileNames[name] ? '#f0fdf4' : '#f8fafc',
          }}
          onMouseEnter={e => { if (!fileNames[name]) { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'; }}}
          onMouseLeave={e => { if (!fileNames[name]) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}}
        >
          <div style={{ width: 36, height: 36, background: fileNames[name] ? '#dcfce7' : '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {fileNames[name] ? (
              <svg width="18" height="18" fill="none" stroke="#10b981" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg width="18" height="18" fill="none" stroke="#94a3b8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: fileNames[name] ? '#15803d' : '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileNames[name] || 'Click to upload file'}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>JPG image only · Max 5MB</p>
          </div>
        </label>
        <input
          id={`file-${name}`}
          name={name}
          type="file"
          accept="image/jpeg"
          required={required}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
              toast.error('Please upload a JPG image');
              e.target.value = '';
              return;
            }
            handleChange(e);
          }}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Left panel (desktop) ─── */}
      <div className="hidden lg:flex" style={{
        flex: '0 0 40%',
        background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #065f46 100%)',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="animate-blob" style={{ position: 'absolute', top: '10%', right: '-5%', width: 300, height: 300, background: 'rgba(16,185,129,.08)', borderRadius: '50%' }} />
          <div className="animate-blob animation-delay-2000" style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 350, height: 350, background: 'rgba(99,102,241,.08)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="animate-fadeInUp" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 72, marginBottom: 24 }} className="animate-float">💊</div>
          <h1 style={{ color: '#fff', fontWeight: 900, fontSize: '2rem', letterSpacing: '-0.03em', marginBottom: 12 }}>Join PharmaCare</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '1rem', marginBottom: 40, lineHeight: 1.6 }}>
            Get fast, genuine medicine delivered to your door in minutes.
          </p>
          {/* Step guide */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < step ? '#10b981' : i === step ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.06)',
                  border: i === step ? '2px solid rgba(255,255,255,.5)' : '2px solid transparent',
                  flexShrink: 0, fontWeight: 700, fontSize: '0.875rem',
                  color: i < step ? '#fff' : i === step ? '#fff' : 'rgba(255,255,255,.4)',
                  transition: 'all .3s',
                }}>
                  {i < step ? (
                    <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : i + 1}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: i === step ? '#fff' : 'rgba(255,255,255,.5)', margin: 0, fontSize: '0.9375rem', transition: 'color .3s' }}>{s}</p>
                  <p style={{ color: 'rgba(255,255,255,.4)', fontSize: '0.75rem', margin: 0 }}>
                    {['Email & password', 'Name, phone & address', 'ID cards'][i]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right: Form ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: '#f8fafc', overflowY: 'auto', minHeight: 0 }}>
        <div className="animate-scaleIn" style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile step indicator */}
          <div className="lg:hidden flex items-center gap-2 mb-6 justify-center">
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < step ? '#10b981' : i === step ? 'linear-gradient(135deg,#10b981,#0d9488)' : '#e2e8f0',
                  color: i <= step ? '#fff' : '#94a3b8', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 24, height: 2, background: i < step ? '#10b981' : '#e2e8f0', borderRadius: 1 }} />}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '2rem', borderRadius: 20 }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.625rem', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {['Create Account', 'Personal Details', 'Identity Verification'][step]}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>
                {['Set up your login credentials', 'Tell us a bit about yourself', 'Required for account approval'][step]}
              </p>
            </div>

            <form onSubmit={step < 2 ? (e) => { e.preventDefault(); setStep(step + 1); } : handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

              {/* Step 0: Credentials */}
              {step === 0 && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="input-field" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Password <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} required minLength={6} className="input-field" style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex' }}>
                        {showPassword ? (
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {formData.password && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          {[1,2,3,4,5].map(i => (
                            <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= strength ? strengthColor : '#e2e8f0', transition: 'background .3s' }} />
                          ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: strengthColor, margin: 0, fontWeight: 600 }}>{strengthLabel}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 1: Personal */}
              {step === 1 && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <input name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required className="input-field" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <input name="phoneNumber" type="tel" placeholder="+977-98xxxxxxxx" value={formData.phoneNumber} onChange={handleChange} className="input-field" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Address</label>
                    <div style={{ position: 'relative' }}>
                      <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input name="address" type="text" placeholder="Street address, City" value={formData.address} onChange={handleChange} className="input-field" style={{ paddingLeft: '2.5rem' }} />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Verification */}
              {step === 2 && (
                <>
                  <div style={{ padding: '0.875rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
                    <p style={{ fontSize: '0.8125rem', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                      Please provide <strong>either</strong> your National ID Card or your Citizenship Card. All submissions are fully encrypted and secure.
                    </p>
                  </div>
                  <FileUpload name="nationalIdCard" label="National ID Card" required={!formData.nationalIdCard && !formData.citizenshipCard} />
                  <div style={{ textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8', margin: '-4px 0' }}>OR</div>
                  <FileUpload name="citizenshipCard" label="Citizenship Card" required={!formData.nationalIdCard && !formData.citizenshipCard} />
                </>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost" style={{ flex: 1, borderRadius: 12, border: '2px solid #e2e8f0' }}>
                    ← Back
                  </button>
                )}
                <button type="submit" disabled={loading} className="btn btn-primary btn-block" style={{ flex: step > 0 ? 2 : 1, borderRadius: 12, padding: '0.75rem' }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg className="animate-spin-smooth" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
                      Creating account…
                    </span>
                  ) : step < 2 ? 'Next →' : 'Create Account'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: 0 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#10b981', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <Link to="/" style={{ color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
