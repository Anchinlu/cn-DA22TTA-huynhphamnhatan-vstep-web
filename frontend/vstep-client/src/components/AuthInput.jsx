import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({ 
  label, 
  icon: Icon, 
  type = 'text', 
  error, 
  name, 
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full mb-5">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
        {label}
      </label>
      
      <div 
        className={`
          relative flex items-center transition-all duration-200 rounded-xl border
          ${error 
            ? 'border-red-300 bg-red-50 ring-2 ring-red-100' 
            : isFocused 
              ? 'border-blue-600 ring-2 ring-blue-50 bg-white' 
              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
          }
        `}
      >
        {/* Icon bên trái */}
        <div className={`pl-4 transition-colors ${isFocused ? 'text-blue-600' : 'text-slate-400'}`}>
          <Icon size={20} />
        </div>

        {/* Input */}
        <input
          name={name}
          type={inputType}
          className="w-full px-4 py-3.5 bg-transparent outline-none text-slate-800 font-medium placeholder-slate-400"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Toggle Password */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 ml-1 text-xs font-medium text-red-500 flex items-center gap-1 animate-fade-in">
          • {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;