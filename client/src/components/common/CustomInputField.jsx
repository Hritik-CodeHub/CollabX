import { Controller } from 'react-hook-form';
import CustomInput from './CustomInput';

const CustomInputField = ({ name, label, control, rules, ...props }) => {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#29435d]">
        {label}
      </span>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <CustomInput {...field} {...props} error={fieldState.error} />
            {fieldState.error && (
              <p className="mt-1 text-xs text-red-500">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </label>
  );
};

export default CustomInputField;