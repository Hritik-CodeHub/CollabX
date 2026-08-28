import { forwardRef } from 'react';

const CustomInput = forwardRef(
  ({ type = 'text', className, ...props }, ref) => {
    return (
      <div>
        <input
          type={type}
          ref={ref}
          className={`h-12 w-full rounded-xl border border-[#dce8e8] bg-[#fbfdfd] px-4 text-sm text-[#173653] outline-none transition placeholder:text-[#9aa9b5] focus:border-[#29c8bd] focus:ring-4 focus:ring-[#29c8bd]/15 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

export default CustomInput;