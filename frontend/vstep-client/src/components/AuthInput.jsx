import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const AuthInput = ({ label, icon: Icon, type = 'text', error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = props.value && props.value.toString().length > 0;

  // Xử lý ẩn/hiện mật khẩu
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`relative mb-5 ${error ? 'animate-shake' : ''}`}>
      {/* Input Field */}
      <div className={`
        relative flex items-center border rounded-lg transition-all duration-200
        ${error ? 'border-red-500 bg-red-50' : isFocused ? 'border-primary ring-1 ring-primary bg-white' : 'border-gray-300 bg-gray-50 hover:bg-white'}
      `}>
        <div className="pl-3 text-gray-400">
          <Icon size={20} className={isFocused || hasValue ? 'text-primary' : ''} />
        </div>
        
        <input
          type={inputType}
          className="w-full px-3 pt-5 pb-2 bg-transparent outline-none text-gray-900 font-medium text-base placeholder-transparent z-10"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={label} // Cần placeholder để trick CSS hoạt động nếu dùng pure CSS, ở đây dùng JS control
          {...props}
        />

        {/* Label Floating */}
        <label className={`
          absolute left-10 transition-all duration-200 pointer-events-none
          ${(isFocused || hasValue) 
            ? 'top-1 text-xs text-primary font-semibold' 
            : 'top-3.5 text-base text-gray-500'}
        `}>
          {label}
        </label>

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error Text */}
      {error && <p className="mt-1 text-xs text-red-600 font-medium ml-1">{error}</p>}
    </div>
  );
};

export default AuthInput;