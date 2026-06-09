import React, { useState } from "react";

const SignIn = ({ onLogin }) => {
  const images = [
    "/Images/PictureOne.jpg",
    "/Images/PictureFive.png",
    "/Images/PictureFour.webp",
    "/Images/PictureTwo.jpg",
    "/Images/PictureThree.jpg",
  ];

  const streamImages = [...images, ...images];

  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    email: "",
    phone: "+92",
    password: "",
    area: "Area A",
    role: "UCMO",
  });

  // --- NEW INTEGRATION STATES ---
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isAreaDisabled = formData.role === "UCMO" || formData.role === "AreaIncharge";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMsg(""); // Clear error when user types

    if (name === "name") {
      const alphabetsOnly = value.replace(/[^a-zA-Z\s]/g, "");
      if (alphabetsOnly.length <= 20) setFormData({ ...formData, [name]: alphabetsOnly });
      return;
    }

    if (name === "cnic") {
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 13) {
        let formatted = numbers;
        if (numbers.length > 5 && numbers.length <= 12) {
          formatted = `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
        } else if (numbers.length > 12) {
          formatted = `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
        }
        setFormData({ ...formData, [name]: formatted });
      }
      return;
    }

    if (name === "phone") {
      if (!value.startsWith("+92")) return;
      const phoneNumber = value.slice(3).replace(/\D/g, "");
      if (phoneNumber.length <= 10) setFormData({ ...formData, [name]: `+92${phoneNumber}` });
      return;
    }

    if (name === "password") {
      const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, "");
      if (alphanumeric.length <= 20) {
        setFormData({ ...formData, [name]: alphanumeric });
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // --- UPDATED SUBMIT FOR BACKEND INTEGRATION ---
const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    // Password Validation
    const pass = formData.password;
    if (pass.length < 7 || !/[a-zA-Z]/.test(pass) || !/[0-9]/.test(pass)) {
      alert("Security Error: Password must be 7-20 chars with letters & numbers.");
      return;
    }

    setLoading(true);
    
    // --- IMPORTANT: Payload cleaning for Backend logic ---
    const submissionPayload = {
      // Schema fix: use 'name' as we updated in backend
      name: formData.name, 
      cnic: formData.cnic,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      // Logic: Area Incharge and UCMO must send null area
      area: (formData.role === "UCMO" || formData.role === "Area Incharge") ? null : formData.area
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Account Activated Successfully!");
        onLogin(result); 
      } else {
        // English Comment: If validation fails, show the EXACT field error
        const backendErrors = result.errors 
          ? Object.entries(result.errors).map(([field, msg]) => `${field}: ${msg}`).join(", ") 
          : result.message;
        
        setErrorMsg(backendErrors || "Registration failed");
      }
    } catch (err) {
      setErrorMsg("Backend Server is not responding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-black">
      <div className="absolute inset-0 flex">
        <div className="flex animate-professional-stream h-full">
          {streamImages.map((img, index) => (
            <div key={index} className="h-screen w-screen flex-shrink-0 relative">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${img})`,
                  filter: "brightness(0.55) contrast(1.1)", 
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-black/30 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-0" />

      <div className="group relative z-10 w-full max-w-md p-10 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.6)] mx-4 transition-all duration-700 hover:border-emerald-500/40 hover:shadow-[0_0_50px_rgba(16,185,129,0.15)]">
        
        <div className="text-center mb-8 relative">
          <h1 className="text-3xl font-black uppercase text-white tracking-tighter drop-shadow-2xl">
            Smart Polio Portal
          </h1>
          <div className="h-[2px] w-16 bg-emerald-500 mx-auto my-3 rounded-full opacity-60 group-hover:w-24 group-hover:opacity-100 transition-all duration-700" />
          <h2 className="text-emerald-400 font-bold text-[11px] uppercase tracking-[0.4em] opacity-80">
            Authorized Access Only
          </h2>
        </div>

        {/* --- ERROR MESSAGE DISPLAY --- */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 text-xs text-center rounded-xl animate-pulse">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div className="space-y-3">
            {[
              { name: "name", placeholder: "Full Name", type: "text" },
              { name: "cnic", placeholder: "CNIC Number", type: "text" },
              { name: "email", placeholder: "Email Address", type: "email" },
              { name: "phone", placeholder: "Phone Number", type: "text", font: "font-mono" },
              { name: "password", placeholder: "Password (7-20 Mixed)", type: showPassword ? "text" : "password" },
            ].map((field) => (
              <div key={field.name} className="relative">
                <input 
                  required 
                  name={field.name} 
                  type={field.type}
                  value={formData[field.name]} 
                  placeholder={field.placeholder} 
                  onChange={handleChange} 
                  className={`w-full p-4 rounded-2xl bg-white/[0.05] border border-white/5 text-white placeholder:text-white/20 focus:bg-white/[0.08] focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all duration-300 ${field.font || ""}`} 
                />
                {field.name === "password" && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group/select">
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="w-full p-4 rounded-2xl bg-white/[0.05] border border-white/5 text-white font-bold outline-none focus:border-emerald-500/50 focus:bg-white/[0.1] transition-all cursor-pointer appearance-none [&>option]:bg-slate-900 [&>option]:text-white">
                  <option value="UCMO">UCMO</option>
                  <option value="AreaIncharge">Area Incharge</option>
                  <option value="Team">Team</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-xs">▼</div>
            </div>

            <div className="relative group/select">
              <select 
                name="area" 
                value={formData.area} 
                onChange={handleChange} 
                disabled={isAreaDisabled}
                className={`w-full p-4 rounded-2xl border border-white/5 font-bold outline-none focus:border-emerald-500/50 focus:bg-white/[0.1] transition-all cursor-pointer appearance-none [&>option]:bg-slate-900 [&>option]:text-white ${isAreaDisabled ? "bg-white/[0.02] text-white/10 opacity-30 cursor-not-allowed" : "bg-white/[0.05] text-white"}`}>
                  <option>Area A</option>
                  <option>Area B</option>
                  <option>Area C</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-xs">▼</div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-[0_5px_0_0_#064e3b] hover:bg-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] active:translate-y-1 active:shadow-none transition-all uppercase mt-4 tracking-[0.2em] text-sm ${loading ? 'opacity-50 cursor-wait' : ''}`}>
            {loading ? "Verifying..." : "Sign Up"}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes professionalStream {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-professional-stream {
          animation: professionalStream 100s linear infinite;
        }
      `}</style>
    </div>
  );
};

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.67 8.5 7.652 6 12 6c4.348 0 8.33 2.5 9.964 5.678a1.012 1.012 0 0 1 0 .644C20.33 15.5 16.348 18 12 18c-4.348 0-8.33-2.5-9.964-5.678Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.001a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default SignIn;